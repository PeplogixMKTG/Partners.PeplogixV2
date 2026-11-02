import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { readFileSync } from "node:fs";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const database = vi.hoisted(() => ({
  getDb: vi.fn(() => {
    throw new Error("Adapter validation tests must not access the database");
  }),
}));
vi.mock("./db", async importOriginal => ({
  ...(await importOriginal<typeof import("./db")>()),
  getDb: database.getDb,
}));

// Exercise the exact editable source that build:vercel bundles for api/index.js.
import adapter from "./vercelEntry";

const config = JSON.parse(
  readFileSync(new URL("../vercel.json", import.meta.url), "utf8")
);
let server: Server;
let origin: string;

afterEach(() => {
  expect(database.getDb).not.toHaveBeenCalled();
  vi.unstubAllEnvs();
});

beforeAll(async () => {
  // Vercel selects the function by its rewrite destination, then invokes the
  // Express export with the original request URL (including its query string).
  server = createServer(adapter);
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close(error => (error ? reject(error) : resolve()));
    server.closeAllConnections();
  });
});

describe("Vercel Express entry", () => {
  it("keeps the dist contract, scopes rewrites to the API, and preserves the dashboard shell", () => {
    expect(config.outputDirectory).toBe("dist");
    expect(config.rewrites).toEqual([
      { source: "/api/:path*", destination: "/api/index" },
      { source: "/dashboard", destination: "/index.html" },
    ]);
    expect(config.buildCommand).toBe(
      "pnpm run build:vercel && rm -f dist/api/platform/config.js"
    );
    // Keep the Express object itself: @vercel/node skips body helpers when
    // listener.listen exists, leaving the existing Express parsers in control.
    expect(typeof adapter.listen).toBe("function");
  });

  it("answers health at the original pathname rather than the function destination", async () => {
    const response = await fetch(`${origin}/api/health?probe=adapter`);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/application\/json/);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it.each([{}, { requestId: "not-a-uuid" }])(
    "reaches existing inquiry validation without any database access: %j",
    async body => {
      const response = await fetch(`${origin}/api/partner/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "requestId must be a UUID",
      });
      expect(response.headers.get("cache-control")).toContain("no-store");
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    }
  );

  it("generates config.js from request-time environment rather than static build data", async () => {
    vi.stubEnv("MANUS_PROJECT_ID", "adapter-runtime-first");
    vi.stubEnv("SESSION_SECRET", "adapter-private-test-secret");
    const first = await fetch(`${origin}/api/platform/config.js`);
    expect(first.status).toBe(200);
    expect(first.headers.get("content-type")).toMatch(
      /application\/javascript/
    );
    expect(first.headers.get("cache-control")).toBe("no-store");
    const firstScript = await first.text();
    expect(firstScript).toContain('"projectId":"adapter-runtime-first"');
    expect(firstScript).not.toContain("adapter-private-test-secret");

    vi.stubEnv("MANUS_PROJECT_ID", "adapter-runtime-second");
    const second = await fetch(`${origin}/api/platform/config.js`);
    expect(second.status).toBe(200);
    const secondScript = await second.text();
    expect(secondScript).toContain('"projectId":"adapter-runtime-second"');
    expect(secondScript).not.toContain("adapter-runtime-first");
  });

  it("keeps the real OAuth callback and its query validation inside the API namespace", async () => {
    const missing = await fetch(`${origin}/api/oauth/callback`);
    expect(missing.status).toBe(400);
    expect(await missing.json()).toEqual({
      error: "code and state are required",
    });

    // Supplying both query values reaches the existing CSRF guard, without
    // exchanging tokens or writing users. This also catches lost query strings.
    const supplied = await fetch(
      `${origin}/api/oauth/callback?code=invalid&state=invalid`
    );
    expect(supplied.status).toBe(403);
    expect(await supplied.json()).toEqual({ error: "invalid oauth state" });
  });

  it("does not re-enter routing or return the SPA for an unknown API or the entry URL", async () => {
    for (const path of ["/api/not-a-route", "/api/index"]) {
      const response = await fetch(`${origin}${path}`, {
        signal: AbortSignal.timeout(2000),
      });
      expect(response.status).toBe(404);
      expect(await response.text()).not.toContain('<div id="root">');
    }
  });
});

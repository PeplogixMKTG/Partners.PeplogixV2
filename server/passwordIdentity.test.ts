import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Request } from "express";
import type { User } from "../drizzle/schema";
import { COOKIE_NAME } from "../shared/const";

const database = vi.hoisted(() => ({
  getUserByOpenId: vi.fn(),
  upsertUser: vi.fn(),
}));
vi.mock("./db", () => database);

import { sdk } from "./_core/sdk";
import { isPasswordOwner, passwordAdminOpenId } from "./_core/passwordIdentity";

const EMAIL = "owner@example.com";
const OWNER_ID = passwordAdminOpenId(EMAIL);
const owner: User = {
  id: 1,
  openId: OWNER_ID,
  email: EMAIL,
  name: "Test owner",
  loginMethod: "password",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("MANUS_PROJECT_ID", "");
  vi.stubEnv("MANUS_OAUTH_API_URL", "");
  vi.stubEnv("MANUS_JWT_SECRET", undefined);
  vi.stubEnv("SESSION_SECRET", "unit-test-signing-key-never-deployed");
  vi.stubEnv("ADMIN_EMAIL", EMAIL);
  vi.stubEnv("ADMIN_PASSWORD", "test-only-never-deployed");
  database.getUserByOpenId.mockResolvedValue(owner);
  database.upsertUser.mockResolvedValue(undefined);
});
afterEach(() => {
  vi.unstubAllEnvs();
});

async function requestFor(openId: string): Promise<Request> {
  const token = await sdk.createSessionToken(openId, { name: "Test" });
  return {
    path: "/api/partner/inquiries",
    headers: { cookie: `${COOKIE_NAME}=${token}` },
  } as Request;
}

describe("exclusive password dashboard owner", () => {
  it("normalizes only the configured email identity", () => {
    expect(passwordAdminOpenId(" OWNER@EXAMPLE.COM ")).toBe(OWNER_ID);
    expect(isPasswordOwner(owner, EMAIL)).toBe(true);
    expect(isPasswordOwner(owner, "")).toBe(false);
  });

  it.each([
    { email: "someone-else@example.com" },
    { openId: "another-admin" },
    { loginMethod: "oauth" },
    { role: "user" as const },
  ])("rejects a mismatched stored owner identity: %j", change => {
    expect(isPasswordOwner({ ...owner, ...change }, EMAIL)).toBe(false);
  });

  it("allows the valid configured owner and records only their sign-in", async () => {
    const user = await sdk.authenticateRequest(await requestFor(OWNER_ID));
    expect(user.email).toBe(EMAIL);
    expect(database.upsertUser).toHaveBeenCalledWith(
      expect.objectContaining({ openId: OWNER_ID })
    );
  });

  it("rejects a validly signed other-admin token before any database or OAuth lookup", async () => {
    await expect(
      sdk.authenticateRequest(await requestFor("other-admin"))
    ).rejects.toThrow("restricted");
    expect(database.getUserByOpenId).not.toHaveBeenCalled();
    expect(database.upsertUser).not.toHaveBeenCalled();
  });

  it("rejects a configured-owner token if its saved email no longer matches", async () => {
    database.getUserByOpenId.mockResolvedValue({
      ...owner,
      email: "other@example.com",
    });
    await expect(
      sdk.authenticateRequest(await requestFor(OWNER_ID))
    ).rejects.toThrow("restricted");
    expect(database.upsertUser).not.toHaveBeenCalled();
  });

  it("rejects previously issued sessions after signing-key rotation", async () => {
    const req = await requestFor(OWNER_ID);
    vi.stubEnv("SESSION_SECRET", "rotated-unit-test-key-never-deployed");
    await expect(sdk.authenticateRequest(req)).rejects.toThrow(
      "Invalid session"
    );
    expect(database.getUserByOpenId).not.toHaveBeenCalled();
  });
});

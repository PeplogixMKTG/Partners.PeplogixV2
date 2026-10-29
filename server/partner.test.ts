import { createHash } from "node:crypto";
import { MySqlDialect } from "drizzle-orm/mysql-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { partnerAdminInvites, partnerAssets, users } from "../drizzle/schema";
import {
  partnerInquiryDataSchema,
  partnerSubmissionSchema,
} from "../shared/partner";

const { authenticateRequestMock, getDbMock } = vi.hoisted(() => ({
  authenticateRequestMock: vi.fn(),
  getDbMock: vi.fn(),
}));

vi.mock("./db", () => ({ getDb: getDbMock }));
vi.mock("./_core/sdk", () => ({
  sdk: { authenticateRequest: authenticateRequestMock },
}));

import {
  detectFile,
  directClientIp,
  registerPartnerRoutes,
  validateUploadPayload,
} from "./partner";

const baseInquiry = () => ({
  company: "Clearly Labeled Test Company",
  firstName: "Test",
  lastName: "Partner",
  email: "test.partner@example.com",
  phone: "+1 212 555 0199",
  hasWebsite: "No" as const,
  businessTypes: ["Ecommerce Brand"] as const,
  partnerships: ["Wholesale Supply"] as const,
  purchaseMode: "Bulk Wholesale Orders" as const,
  initialSize: "Small Initial Order" as const,
});

const pngBytes = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
]);
const mysqlDialect = new MySqlDialect();

type RouteHandler = (req: any, res: any, next: () => void) => unknown;

function routeHandlers() {
  const routes = new Map<string, RouteHandler[]>();
  const app = {
    post: (path: string, ...handlers: RouteHandler[]) =>
      routes.set(`POST ${path}`, handlers),
    get: (path: string, ...handlers: RouteHandler[]) =>
      routes.set(`GET ${path}`, handlers),
    delete: (path: string, ...handlers: RouteHandler[]) =>
      routes.set(`DELETE ${path}`, handlers),
  } as never;
  registerPartnerRoutes(app);
  return (method: string, path: string): RouteHandler[] => {
    const handlers = routes.get(`${method} ${path}`);
    if (!handlers)
      throw new Error(`Route is not registered: ${method} ${path}`);
    return handlers;
  };
}

function testResponse() {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    ended: false,
    set: vi.fn(),
    status: vi.fn((statusCode: number) => {
      response.statusCode = statusCode;
      return response;
    }),
    json: vi.fn((body: unknown) => {
      response.body = body;
      return response;
    }),
    end: vi.fn(() => {
      response.ended = true;
      return response;
    }),
  };
  return response;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("partner inquiry validation", () => {
  it("accepts the required wholesale path and safely defaults omitted branding state", () => {
    const parsed = partnerInquiryDataSchema.parse(baseInquiry());
    expect(parsed.colorsNotFinal).toBe(false);
    expect(parsed.company).toBe("Clearly Labeled Test Company");
  });

  it("requires a valid website when the business says it has one", () => {
    expect(() =>
      partnerInquiryDataSchema.parse({
        ...baseInquiry(),
        hasWebsite: "Yes",
        website: "not a url",
      })
    ).toThrow(/website URL/i);
  });

  it("requires conditional storefront, domain, migration, and custom values", () => {
    expect(() =>
      partnerInquiryDataSchema.parse({
        ...baseInquiry(),
        partnerships: ["Custom-Branded Storefront"],
      })
    ).toThrow(/storefront type/i);

    const storefront = partnerInquiryDataSchema.parse({
      ...baseInquiry(),
      partnerships: ["Custom-Branded Storefront"],
      storefrontType: "A fully custom ecommerce website",
      ownsDomain: "Yes",
      domain: "example.co",
      migration: "Yes",
      migrationUrl: "https://example.co",
      features: ["Other"],
      featuresOther: "A secure account area",
    });
    expect(storefront.domain).toBe("example.co");
  });

  it("enforces the exact partnership allowlist and non-reusable asset IDs", () => {
    expect(() =>
      partnerInquiryDataSchema.parse({
        ...baseInquiry(),
        partnerships: ["not an allowed partnership"],
      })
    ).toThrow();

    const assetId = "A".repeat(43);
    expect(() =>
      partnerSubmissionSchema.parse({
        requestId: "7cf50cf2-a1d0-4fd4-a9d8-ca57b67a1706",
        data: baseInquiry(),
        logoId: assetId,
        assetIds: [assetId],
        confirmed: true,
      })
    ).toThrow(/only be attached once/i);
  });
});

describe("partner asset validation", () => {
  it("derives the canonical MIME type from valid PNG bytes", () => {
    const payload = validateUploadPayload({
      name: "../My Logo.png",
      type: "image/png",
      data: pngBytes.toString("base64"),
    });
    expect(payload.name).toBe("My Logo.png");
    expect(payload.detected.type).toBe("image/png");
    expect(detectFile(pngBytes)).toBe("image/png");
  });

  it("rejects browser MIME labels that disagree with the bytes", () => {
    expect(() =>
      validateUploadPayload({
        name: "logo.jpg",
        type: "image/jpeg",
        data: pngBytes.toString("base64"),
      })
    ).toThrow(/does not match/i);
  });

  it("does not trust an arbitrary forwarded-for chain for rate-limit identity", () => {
    const req = {
      socket: { remoteAddress: "198.51.100.12" },
      headers: { "x-forwarded-for": "203.0.113.4, 203.0.113.7" },
    } as never;
    expect(directClientIp(req)).toBe("198.51.100.12");
  });
});

describe("partner temporary upload lifecycle", () => {
  it("deletes only an unclaimed upload capability, with no-store and a 204 missing response", async () => {
    const deleteWhere = vi.fn().mockResolvedValue(undefined);
    const db = { delete: vi.fn(() => ({ where: deleteWhere })) };
    getDbMock.mockResolvedValue(db);
    const capability = "A".repeat(43);
    const handlers = routeHandlers()("DELETE", "/api/partner/upload/:id");
    expect(handlers).toHaveLength(3);

    const response = testResponse();
    const request = { params: { id: capability } };
    const next = vi.fn();
    handlers[0](request, response, next);
    expect(next).toHaveBeenCalledOnce();
    expect(response.set).toHaveBeenCalledWith(
      expect.objectContaining({
        "Cache-Control": "private, no-store, max-age=0",
      })
    );

    await handlers[2](request, response, vi.fn());
    expect(response.status).toHaveBeenCalledWith(204);
    expect(response.end).toHaveBeenCalledOnce();
    const query = mysqlDialect.sqlToQuery(deleteWhere.mock.calls[0][0]);
    expect(query.sql).toBe(
      "(`partner_assets`.`id` = ? and `partner_assets`.`inquiryId` is null)"
    );
    expect(query.params).toEqual([capability]);
  });

  it("returns 204 without querying for a malformed or missing upload capability", async () => {
    const handlers = routeHandlers()("DELETE", "/api/partner/upload/:id");
    const response = testResponse();

    await handlers[2](
      { params: { id: "not-a-capability" } },
      response,
      vi.fn()
    );

    expect(getDbMock).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(204);
    expect(response.end).toHaveBeenCalledOnce();
  });

  it("lazily prunes only stale unclaimed uploads before inserting a new upload", async () => {
    const pruneWhere = vi.fn().mockResolvedValue(undefined);
    const insertValues = vi.fn().mockResolvedValue(undefined);
    const db = {
      delete: vi.fn(() => ({ where: pruneWhere })),
      insert: vi.fn(() => ({ values: insertValues })),
    };
    getDbMock.mockResolvedValue(db);
    const handlers = routeHandlers()("POST", "/api/partner/upload");
    const response = testResponse();

    await handlers[2](
      {
        body: {
          name: "logo.png",
          type: "image/png",
          data: pngBytes.toString("base64"),
        },
      },
      response,
      vi.fn()
    );

    expect(pruneWhere.mock.invocationCallOrder[0]).toBeLessThan(
      insertValues.mock.invocationCallOrder[0]
    );
    const query = mysqlDialect.sqlToQuery(pruneWhere.mock.calls[0][0]);
    expect(query.sql).toBe(
      "(`partner_assets`.`inquiryId` is null and `partner_assets`.`createdAt` < ?)"
    );
    expect(query.params[0]).toMatch(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/
    );
    expect(response.status).toHaveBeenCalledWith(201);
  });
});

describe("partner administrator activation", () => {
  it("requires an authenticated user and atomically promotes that user while consuming a valid invite", async () => {
    const code = "A".repeat(43);
    const tokenHash = createHash("sha256").update(code).digest("hex");
    const invite = {
      id: "46a6ae70-8ef4-4b14-a262-cd65d36fb2ec",
      tokenHash,
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    };
    const forUpdate = vi.fn().mockResolvedValue([invite]);
    const limit = vi.fn(() => ({ for: forUpdate }));
    const where = vi.fn((_condition: unknown) => ({ limit }));
    const from = vi.fn(() => ({ where }));
    const select = vi.fn(() => ({ from }));
    const updates: Array<{
      table: unknown;
      values: unknown;
      condition: unknown;
    }> = [];
    const update = vi.fn((table: unknown) => ({
      set: (values: unknown) => ({
        where: async (condition: unknown) => {
          updates.push({ table, values, condition });
        },
      }),
    }));
    const tx = { select, update };
    const db = {
      transaction: vi.fn(async (work: (transaction: typeof tx) => unknown) =>
        work(tx)
      ),
    };
    getDbMock.mockResolvedValue(db);
    authenticateRequestMock.mockResolvedValue({
      id: 42,
      openId: "authenticated-owner",
      isCron: false,
    });
    const handlers = routeHandlers()("POST", "/api/partner/admin/activate");
    const response = testResponse();

    await handlers[2]({ body: { code } }, response, vi.fn());

    expect(authenticateRequestMock).toHaveBeenCalledOnce();
    expect(forUpdate).toHaveBeenCalledWith("update");
    const hashQuery = mysqlDialect.sqlToQuery(where.mock.calls[0][0] as never);
    expect(hashQuery.params).toEqual([tokenHash]);
    expect(updates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ table: users, values: { role: "admin" } }),
        expect.objectContaining({
          table: partnerAdminInvites,
          values: expect.objectContaining({ usedAt: expect.any(Date) }),
        }),
      ])
    );
    expect(response.body).toEqual({ success: true });
  });
});

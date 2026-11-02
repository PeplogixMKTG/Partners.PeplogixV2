import { afterEach, describe, expect, it, vi } from "vitest";
import { partnerInquiries, partnerNotifications } from "../drizzle/schema";

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
  auth: vi.fn(),
  build: vi.fn(),
  deliver: vi.fn(),
  tryDeliver: vi.fn(),
  readStatus: vi.fn(),
}));
vi.mock("./db", () => ({ getDb: mocks.getDb }));
vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest: mocks.auth } }));
vi.mock("./partnerNotifications", () => ({
  buildNotificationRecord: mocks.build,
  deliverNotification: mocks.deliver,
  tryDeliverNotification: mocks.tryDeliver,
  readNotificationStatus: mocks.readStatus,
}));
import { registerPartnerRoutes } from "./partner";
const id = "76cae75a-4fc7-47d9-a5a6-47e9b1ddbfcc";
const requestId = "f7814cf1-962e-41f6-8850-21d3a758572e";
const submission = {
  requestId,
  confirmed: true,
  logoId: null,
  assetIds: [],
  data: {
    company: "Clearly labelled notification test",
    firstName: "Test",
    lastName: "Only",
    email: "applicant@example.com",
    phone: "+1 212 555 0199",
    hasWebsite: "No",
    businessTypes: ["Ecommerce Brand"],
    partnerships: ["White-Label Products"],
    needs: "Full notes preserved",
    colorsNotFinal: true,
  },
};
function handler(method: string, path: string) {
  const routes = new Map<string, any[]>();
  const app: any = {};
  for (const verb of ["get", "post", "delete"])
    app[verb] = (p: string, ...h: any[]) => routes.set(`${verb} ${p}`, h);
  registerPartnerRoutes(app);
  const list = routes.get(`${method} ${path}`)!;
  return list[list.length - 1];
}
function response() {
  const res: any = { statusCode: 200, body: null };
  res.set = vi.fn(() => res);
  res.status = vi.fn((n: number) => {
    res.statusCode = n;
    return res;
  });
  res.json = vi.fn((body: any) => {
    res.body = body;
    return res;
  });
  return res;
}
function inquiryLookup(results: any[]) {
  return {
    select: () => ({
      from: () => ({ where: () => ({ limit: async () => results }) }),
    }),
  };
}
function lockedInquiryLookup() {
  return {
    select: () => ({
      from: () => ({
        where: () => ({ limit: () => ({ for: async () => [] }) }),
      }),
    }),
  };
}
afterEach(() => {
  vi.resetAllMocks();
});

describe("inquiry notification integration", () => {
  it("queues the complete alert inside the inquiry transaction and sends only after commit", async () => {
    const insertions: any[] = [];
    let committed = false;
    const tx = {
      ...lockedInquiryLookup(),
      insert: (table: any) => ({
        values: async (values: any) => {
          insertions.push({ table, values });
        },
      }),
    };
    const db = {
      ...inquiryLookup([]),
      transaction: vi.fn(async (work: any) => {
        const result = await work(tx);
        committed = true;
        return result;
      }),
    };
    mocks.getDb.mockResolvedValue(db);
    mocks.build.mockImplementation((input: any) => ({
      inquiryId: input.id,
      payload: "immutable full entry",
    }));
    mocks.tryDeliver.mockImplementation(async (inquiryId: string) => {
      expect(committed).toBe(true);
      expect(inquiryId).toBe(insertions[0].values.id);
    });
    const res = response();
    await handler("post", "/api/partner/inquiries")({ body: submission }, res);
    expect(res.statusCode).toBe(201);
    expect(insertions.map(x => x.table)).toEqual([
      partnerInquiries,
      partnerNotifications,
    ]);
    expect(mocks.build).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          needs: "Full notes preserved",
          email: "applicant@example.com",
          colorsNotFinal: true,
        }),
        assets: [],
      })
    );
    expect(mocks.tryDeliver).toHaveBeenCalledOnce();
  });
  it("does not create a second inquiry or notification for a repeated submission UUID", async () => {
    const db = {
      ...inquiryLookup([{ id, submittedAt: new Date() }]),
      transaction: vi.fn(),
    };
    mocks.getDb.mockResolvedValue(db);
    const res = response();
    await handler("post", "/api/partner/inquiries")({ body: submission }, res);
    expect(res.statusCode).toBe(200);
    expect(db.transaction).not.toHaveBeenCalled();
    expect(mocks.build).not.toHaveBeenCalled();
    expect(mocks.tryDeliver).toHaveBeenCalledWith(id);
    expect(JSON.stringify(res.body)).not.toContain("applicant@example.com");
  });
  it("keeps the existing saved-inquiry behavior when email is not configured", async () => {
    const inserted: any[] = [];
    const tx = {
      ...lockedInquiryLookup(),
      insert: (table: any) => ({
        values: async () => {
          inserted.push(table);
        },
      }),
    };
    mocks.getDb.mockResolvedValue({
      ...inquiryLookup([]),
      transaction: async (work: any) => work(tx),
    });
    mocks.build.mockReturnValue(null);
    const res = response();
    await handler("post", "/api/partner/inquiries")({ body: submission }, res);
    expect(res.statusCode).toBe(201);
    expect(inserted).toEqual([partnerInquiries]);
  });
  it.each(["get", "post"])(
    "requires a real administrator before %s notification access",
    async method => {
      mocks.auth.mockRejectedValue(new Error("not authenticated"));
      const res = response();
      const path =
        method === "get"
          ? "/api/partner/inquiries/:id/notification"
          : "/api/partner/inquiries/:id/notification/retry";
      await handler(method, path)({ params: { id } }, res);
      expect(res.statusCode).toBe(401);
      expect(mocks.readStatus).not.toHaveBeenCalled();
      expect(mocks.deliver).not.toHaveBeenCalled();
    }
  );
  it("blocks non-admin accounts from retrying", async () => {
    mocks.auth.mockResolvedValue({ role: "user", isCron: false });
    const res = response();
    await handler("post", "/api/partner/inquiries/:id/notification/retry")(
      { params: { id } },
      res
    );
    expect(res.statusCode).toBe(403);
    expect(mocks.deliver).not.toHaveBeenCalled();
  });
  it("allows an authenticated administrator to inspect and retry queued delivery", async () => {
    mocks.auth.mockResolvedValue({ role: "admin", isCron: false });
    mocks.readStatus.mockResolvedValue({ inquiryId: id, status: "sent" });
    const res = response();
    await handler("post", "/api/partner/inquiries/:id/notification/retry")(
      { params: { id } },
      res
    );
    expect(mocks.deliver).toHaveBeenCalledWith(id, true);
    expect(res.body.status).toBe("sent");
  });
});

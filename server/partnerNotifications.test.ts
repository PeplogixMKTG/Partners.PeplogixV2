import { afterEach, describe, expect, it, vi } from "vitest";

const { getDbMock } = vi.hoisted(() => ({ getDbMock: vi.fn() }));
vi.mock("./db", () => ({ getDb: getDbMock }));

import {
  notificationConfig,
  buildNotificationRecord,
  sendResendNotification,
  shouldReviewNotification,
  deliverNotification,
  tryDeliverNotification,
  NotificationSendError,
  notificationWorkerAuthorized,
  type NotificationPayload,
} from "./partnerNotifications";
import type { PartnerNotification } from "../drizzle/schema";

const INQUIRY_ID = "76cae75a-4fc7-47d9-a5a6-47e9b1ddbfcc";
const payload: NotificationPayload = {
  from: "Peplogix Partners <notifications@example.com>",
  to: ["team@example.com"],
  subject: "New Peplogix Partnership Inquiry — Test Company",
  html: "<p>Clearly labelled test</p>",
  text: "Clearly labelled test",
  reply_to: "applicant@example.com",
};
function configured() {
  vi.stubEnv("RESEND_API_KEY", "test-only-not-a-real-key");
  vi.stubEnv("PARTNER_NOTIFICATION_FROM", payload.from);
  vi.stubEnv(
    "PARTNER_NOTIFICATION_TO",
    "team@example.com; second@example.com,team@example.com"
  );
  vi.stubEnv("APP_BASE_URL", "https://partners.example.com/");
}
function row(
  overrides: Partial<PartnerNotification> = {}
): PartnerNotification {
  return {
    inquiryId: INQUIRY_ID,
    payload: JSON.stringify(payload),
    status: "pending",
    attempts: 0,
    claimToken: null,
    leaseUntil: null,
    nextAttemptAt: new Date(0),
    firstAttemptAt: null,
    providerId: null,
    lastError: null,
    createdAt: new Date(),
    sentAt: null,
    ...overrides,
  };
}
function fakeDb(initial: PartnerNotification) {
  const data = { ...initial };
  const sets: any[] = [];
  const update = vi.fn(() => ({
    set: (values: any) => ({
      where: async () => {
        sets.push(values);
        Object.assign(data, values);
      },
    }),
  }));
  const tx = {
    select: () => ({
      from: () => ({
        where: () => ({ limit: () => ({ for: async () => [data] }) }),
      }),
    }),
    update,
  };
  return {
    data,
    sets,
    update,
    transaction: async (fn: (x: typeof tx) => unknown) => fn(tx),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  getDbMock.mockReset();
});

describe("notification server-only configuration", () => {
  it("does not enable email when sender/recipient/settings are incomplete", () => {
    vi.stubEnv("RESEND_API_KEY", "test-only");
    expect(notificationConfig()).toBeNull();
  });
  it("validates and deduplicates recipients without using applicant input", () => {
    configured();
    expect(notificationConfig()).toEqual({
      apiKey: "test-only-not-a-real-key",
      from: payload.from,
      to: ["team@example.com", "second@example.com"],
      appBaseUrl: "https://partners.example.com",
    });
  });
  it("rejects header injection and unsafe dashboard origins", () => {
    configured();
    vi.stubEnv(
      "PARTNER_NOTIFICATION_FROM",
      "team@example.com\r\nBcc: other@example.com"
    );
    expect(notificationConfig()).toBeNull();
    configured();
    vi.stubEnv("APP_BASE_URL", "javascript:alert(1)");
    expect(notificationConfig()).toBeNull();
    configured();
    vi.stubEnv("APP_BASE_URL", "https://user:pass@example.com");
    expect(notificationConfig()).toBeNull();
  });
  it("captures the complete notification payload once for stable retry idempotency", () => {
    configured();
    const record = buildNotificationRecord({
      id: INQUIRY_ID,
      submittedAt: new Date("2026-11-02T12:00:00Z"),
      sourceDomain: "weg.partners.peplogix.com",
      data: {
        company: "Test Company",
        firstName: "Test",
        lastName: "Only",
        email: "applicant@example.com",
        phone: "+1 212 555 0199",
        hasWebsite: "No",
        businessTypes: ["Ecommerce Brand"],
        partnerships: ["White-Label Products"],
        colorsNotFinal: false,
        needs: "Include this complete note",
      },
      assets: [],
    });
    expect(record?.inquiryId).toBe(INQUIRY_ID);
    const saved = JSON.parse(record!.payload);
    expect(saved.to).toEqual(["team@example.com", "second@example.com"]);
    expect(saved.reply_to).toBe("applicant@example.com");
    expect(saved.text).toContain("Include this complete note");
    expect(saved.subject).toContain("weg.partners.peplogix.com");
    expect(saved.text).toContain(
      "Submitted from domain: weg.partners.peplogix.com"
    );
    expect(saved.html).toContain("weg.partners.peplogix.com");
  });
});

describe("Resend transport", () => {
  it("posts a fixed idempotency key and plain/HTML bodies and awaits provider acceptance", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "provider-test-id" }), {
        status: 200,
      })
    );
    await expect(
      sendResendNotification(payload, INQUIRY_ID, "test-key", fetcher)
    ).resolves.toBe("provider-test-id");
    const [url, options] = fetcher.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(options.headers["Idempotency-Key"]).toBe(
      `peplogix-inquiry/${INQUIRY_ID}`
    );
    expect(options.headers.Authorization).toBe("Bearer test-key");
    expect(JSON.parse(options.body)).toEqual(payload);
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });
  it.each([409, 429, 500, 503])(
    "classifies HTTP %s as retryable without storing provider response contents",
    async status => {
      const fetcher = vi
        .fn()
        .mockResolvedValue(
          new Response("sensitive provider response", { status })
        );
      await expect(
        sendResendNotification(payload, INQUIRY_ID, "test-key", fetcher)
      ).rejects.toMatchObject({
        code: `resend_http_${status}`,
        retryable: true,
      });
    }
  );
  it.each([400, 401, 403, 422])(
    "classifies HTTP %s as requiring administrator review",
    async status => {
      const fetcher = vi
        .fn()
        .mockResolvedValue(new Response("not exposed", { status }));
      await expect(
        sendResendNotification(payload, INQUIRY_ID, "test-key", fetcher)
      ).rejects.toMatchObject({
        code: `resend_http_${status}`,
        retryable: false,
      });
    }
  );
  it("handles ambiguous network errors without leaking credentials", async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValue(new Error("sensitive credential"));
    await expect(
      sendResendNotification(payload, INQUIRY_ID, "test-key", fetcher)
    ).rejects.toEqual(
      new NotificationSendError("resend_network_or_timeout", true)
    );
  });
});

describe("durable state and safe retry", () => {
  it("accepts only a configured, exact scheduler bearer token", () => {
    expect(notificationWorkerAuthorized("Bearer anything")).toBe(false);
    vi.stubEnv("CRON_SECRET", "test-only-scheduler-secret-with-32-characters");
    expect(
      notificationWorkerAuthorized(
        "Bearer test-only-scheduler-secret-with-32-characters"
      )
    ).toBe(true);
    expect(notificationWorkerAuthorized("Bearer wrong-secret")).toBe(false);
  });
  it("allows explicit administrator retry after correcting a definite rejected sender or key", async () => {
    configured();
    const db = fakeDb(
      row({
        status: "needs_review",
        lastError: "resend_http_403",
        attempts: 1,
        firstAttemptAt: new Date(Date.now() - 60000),
      })
    );
    getDbMock.mockResolvedValue(db);
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "corrected-provider-id" }), {
        status: 200,
      })
    );
    vi.stubGlobal("fetch", fetcher);
    await deliverNotification(INQUIRY_ID, true);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(db.data.status).toBe("sent");
  });
  it("does not resend a notification already marked sent", async () => {
    configured();
    const db = fakeDb(row({ status: "sent" }));
    getDbMock.mockResolvedValue(db);
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await deliverNotification(INQUIRY_ID, true);
    expect(fetcher).not.toHaveBeenCalled();
    expect(db.sets).toEqual([]);
  });
  it("retries the immutable original source and recipients rather than reattributing the inquiry", async () => {
    configured();
    const original = {
      ...payload,
      subject:
        "New Peplogix Partnership Inquiry [jvega.partners.peplogix.com] — Test Company",
      text: "Submitted from domain: jvega.partners.peplogix.com",
      html: "<p>Submitted from domain: jvega.partners.peplogix.com</p>",
    };
    const db = fakeDb(
      row({ status: "failed", payload: JSON.stringify(original) })
    );
    getDbMock.mockResolvedValue(db);
    vi.stubEnv("PARTNER_NOTIFICATION_TO", "new-recipient@example.com");
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: "original-source-retry" }), {
          status: 200,
        })
      );
    vi.stubGlobal("fetch", fetcher);
    await deliverNotification(INQUIRY_ID);
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual(original);
    expect(db.data.status).toBe("sent");
  });
  it("does not take another request's active send lease", async () => {
    configured();
    const db = fakeDb(
      row({ status: "sending", leaseUntil: new Date(Date.now() + 60000) })
    );
    getDbMock.mockResolvedValue(db);
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await deliverNotification(INQUIRY_ID, true);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("records provider acceptance only after send completion", async () => {
    configured();
    const db = fakeDb(row());
    getDbMock.mockResolvedValue(db);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: "provider-accepted" }), {
          status: 200,
        })
      )
    );
    await deliverNotification(INQUIRY_ID);
    expect(db.sets[0]).toMatchObject({ status: "sending", attempts: 1 });
    expect(db.data).toMatchObject({
      status: "sent",
      providerId: "provider-accepted",
      claimToken: null,
      lastError: null,
    });
  });
  it("retains a failed notification with retry state while preserving the saved inquiry", async () => {
    configured();
    const db = fakeDb(row());
    getDbMock.mockResolvedValue(db);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("not logged", { status: 503 }))
    );
    await deliverNotification(INQUIRY_ID);
    expect(db.data).toMatchObject({
      status: "failed",
      lastError: "resend_http_503",
      claimToken: null,
    });
  });
  it("stops ambiguous retries before the provider's 24-hour idempotency expiry", async () => {
    configured();
    const now = new Date();
    expect(
      shouldReviewNotification(
        row({ firstAttemptAt: new Date(now.getTime() - 23 * 3600 * 1000) }),
        now
      )
    ).toBe(true);
    expect(shouldReviewNotification(row({ attempts: 8 }), now)).toBe(true);
    const db = fakeDb(
      row({
        firstAttemptAt: new Date(now.getTime() - 24 * 3600 * 1000),
        status: "failed",
      })
    );
    getDbMock.mockResolvedValue(db);
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await deliverNotification(INQUIRY_ID, true);
    expect(fetcher).not.toHaveBeenCalled();
    expect(db.data.status).toBe("needs_review");
  });
  it("never propagates a delivery-state error to the saved-submission response", async () => {
    configured();
    getDbMock.mockRejectedValue(
      new Error("database unavailable after inquiry commit")
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(tryDeliverNotification(INQUIRY_ID)).resolves.toBeUndefined();
  });
});

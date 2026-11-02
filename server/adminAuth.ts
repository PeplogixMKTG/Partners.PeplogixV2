import { createHash, timingSafeEqual } from "node:crypto";
import type { Express, Request, Response } from "express";
import { z } from "zod";
import { upsertUser } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";

const loginSchema = z
  .object({
    email: z.string().trim().email().max(320),
    password: z.string().min(1).max(1024),
  })
  .strict();

type RateLimitBucket = { count: number; resetAt: number };
const rateLimitBuckets = new Map<string, RateLimitBucket>();

function clientIp(req: Request): string {
  return req.socket.remoteAddress || "unknown";
}

function rateLimit(req: Request, res: Response): boolean {
  const now = Date.now();
  const key = clientIp(req);
  const existing = rateLimitBuckets.get(key);
  const bucket =
    !existing || existing.resetAt <= now
      ? { count: 0, resetAt: now + 10 * 60 * 1000 }
      : existing;
  bucket.count += 1;
  rateLimitBuckets.set(key, bucket);

  if (rateLimitBuckets.size > 10_000) {
    for (const [bucketKey, value] of rateLimitBuckets) {
      if (value.resetAt <= now) rateLimitBuckets.delete(bucketKey);
    }
  }

  if (bucket.count > 10) {
    res
      .set(
        "Retry-After",
        String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)))
      )
      .status(429)
      .json({ error: "Too many sign-in attempts. Please try again shortly." });
    return false;
  }
  return true;
}

function safeEqual(left: string, right: string): boolean {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function adminOpenId(email: string): string {
  return `password_admin_${createHash("sha256")
    .update(email)
    .digest("hex")
    .slice(0, 40)}`;
}

/**
 * Adds an owner-controlled login for external deployments. It is enabled only
 * when ADMIN_EMAIL, ADMIN_PASSWORD, and SESSION_SECRET are supplied. In Manus
 * deployments the existing OAuth route continues to be used instead.
 */
export function registerAdminPasswordRoutes(app: Express): void {
  app.post("/api/admin/login", async (req, res) => {
    res.set({
      "Cache-Control": "private, no-store, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    });

    if (!ENV.passwordAuthEnabled) {
      res.status(404).json({ error: "Password login is not configured." });
      return;
    }
    if (!rateLimit(req, res)) return;

    try {
      const { email, password } = loginSchema.parse(req.body);
      const normalizedEmail = email.toLowerCase();
      const authorized =
        safeEqual(normalizedEmail, ENV.adminEmail) &&
        safeEqual(password, ENV.adminPassword);
      if (!authorized) {
        res.status(401).json({ error: "Incorrect email or password." });
        return;
      }

      const openId = adminOpenId(normalizedEmail);
      await upsertUser({
        openId,
        name: "Peplogix Administrator",
        email: normalizedEmail,
        loginMethod: "password",
        role: "admin",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name: "Peplogix Administrator",
        expiresInMs: ONE_YEAR_MS,
      });
      res.cookie(COOKIE_NAME, sessionToken, {
        ...getSessionCookieOptions(req),
        maxAge: ONE_YEAR_MS,
      });
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Enter a valid email and password." });
        return;
      }
      console.error("[Admin] Password login failed", error);
      res.status(500).json({ error: "Unable to sign in securely." });
    }
  });
}

import type { CookieOptions, Request } from "express";
import { ENV } from "./env";

export function getSessionCookieOptions(req: Request): CookieOptions {
  // Manus Preview is a public HTTPS cross-site iframe. A standard Vercel site is
  // top-level, so Lax cookies offer CSRF protection while still working locally.
  if (ENV.authMode === "manus") {
    return { httpOnly: true, path: "/", sameSite: "none", secure: true };
  }
  const forwardedProto = req.headers["x-forwarded-proto"];
  const isSecure =
    ENV.isProduction ||
    forwardedProto === "https" ||
    (Array.isArray(forwardedProto) && forwardedProto.includes("https"));
  return { httpOnly: true, path: "/", sameSite: "lax", secure: isSecure };
}

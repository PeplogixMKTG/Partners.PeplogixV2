import express, { type Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAdminPasswordRoutes } from "./adminAuth";
import { registerOAuthRoutes } from "./_core/oauth";
import { publicPlatformScript } from "./_core/publicConfig";
import { createContext } from "./_core/context";
import { partnerNoStoreMiddleware, registerPartnerRoutes } from "./partner";
import { appRouter } from "./routers";

/**
 * Builds the complete HTTP application without binding a port. This keeps the
 * existing local Node server and Vercel's Express runtime on the same routes,
 * validation, secure upload handling, and dashboard behavior.
 */
export function createApp(): Express {
  const app = express();

  // Apply privacy headers even if the JSON parser rejects a malformed or oversized partner payload.
  app.use("/api/partner", partnerNoStoreMiddleware);
  // Five MiB source files expand to roughly 6.67 MiB base64; no endpoint needs a larger JSON body.
  app.use(express.json({ limit: "8mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/platform/config.js", (_req, res) => {
    res
      .set("Cache-Control", "no-store")
      .type("application/javascript")
      .send(publicPlatformScript());
  });

  // Manus OAuth remains available when its environment values are configured.
  // Vercel deployments can instead enable the password-protected owner mode.
  registerOAuthRoutes(app);
  registerAdminPasswordRoutes(app);
  registerPartnerRoutes(app);

  // The dashboard is an internal view even though static serving supplies its SPA shell.
  app.use("/dashboard", (_req, res, next) => {
    res.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    next();
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  return app;
}

import { ENV } from "./env";

// Only these public values may reach the browser. Never serialize process.env.
export function publicPlatformConfig(env: NodeJS.ProcessEnv = process.env) {
  const passwordMode = Boolean(
    env.ADMIN_EMAIL &&
      env.ADMIN_PASSWORD &&
      (env.SESSION_SECRET || env.MANUS_JWT_SECRET)
  );
  const manusMode = Boolean(
    env.MANUS_PROJECT_ID && env.MANUS_OAUTH_API_URL && env.MANUS_JWT_SECRET
  );
  return {
    projectId: env.MANUS_PROJECT_ID ?? "",
    oauthPortalUrl: env.MANUS_OAUTH_PORTAL_URL ?? "",
    apiUrl: env.MANUS_API_URL ?? "",
    apiBrowserKey: env.MANUS_API_BROWSER_KEY ?? "",
    authMode: passwordMode ? "password" : manusMode ? "manus" : ENV.authMode,
  };
}

export function publicPlatformScript(
  env: NodeJS.ProcessEnv = process.env
): string {
  const json = JSON.stringify(publicPlatformConfig(env)).replaceAll(
    "<",
    "\\u003c"
  );
  return `window.__MANUS_CONFIG__=${json};`;
}

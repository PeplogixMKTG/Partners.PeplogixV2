// Platform values are read at use time. Vercel may instead use the portable
// password-protected owner mode documented in .env.example and README.md.
export const ENV = {
  get manusAppId() {
    return process.env.MANUS_PROJECT_ID ?? "";
  },
  // A fixed internal audience is sufficient for signed password-mode sessions.
  get appId() {
    return this.manusAppId || "peplogix-partner-portal";
  },
  get cookieSecret() {
    return process.env.MANUS_JWT_SECRET ?? process.env.SESSION_SECRET ?? "";
  },
  get databaseUrl() {
    return process.env.DATABASE_URL ?? "";
  },
  get oAuthServerUrl() {
    return process.env.MANUS_OAUTH_API_URL ?? "";
  },
  get adminEmail() {
    return (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  },
  get adminPassword() {
    return process.env.ADMIN_PASSWORD ?? "";
  },
  get passwordAuthEnabled() {
    return Boolean(this.adminEmail && this.adminPassword && this.cookieSecret);
  },
  get privateUploadBucket() {
    return process.env.S3_BUCKET ?? "";
  },
  get privateUploadRegion() {
    return process.env.S3_REGION ?? "";
  },
  get privateUploadEndpoint() {
    return process.env.S3_ENDPOINT ?? "";
  },
  get privateUploadForcePathStyle() {
    return process.env.S3_FORCE_PATH_STYLE === "true";
  },
  get privateUploadAccessKeyId() {
    return process.env.S3_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID ?? "";
  },
  get privateUploadSecretAccessKey() {
    return (
      process.env.S3_SECRET_ACCESS_KEY ??
      process.env.AWS_SECRET_ACCESS_KEY ??
      ""
    );
  },
  get authMode(): "password" | "manus" | "unconfigured" {
    if (this.passwordAuthEnabled) return "password";
    if (this.manusAppId && this.oAuthServerUrl && this.cookieSecret)
      return "manus";
    return "unconfigured";
  },
  // Preserve the legacy hint when supplied; otherwise roles remain application data.
  get ownerOpenId() {
    return process.env.OWNER_OPEN_ID ?? "";
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
  get forgeApiUrl() {
    return process.env.MANUS_API_URL ?? "";
  },
  get forgeApiKey() {
    return process.env.MANUS_API_KEY ?? "";
  },
};

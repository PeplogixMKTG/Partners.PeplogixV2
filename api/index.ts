import { createApp } from "../server/app";

// Export Express itself so Vercel preserves its Node request/body handling.
// Same-application rewrites select this function but retain the original URL.
const app = createApp();
export default app;

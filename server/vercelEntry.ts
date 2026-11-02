import { createApp } from "./app";

// The same Express app serves all existing partner, auth, and tRPC routes.
// build:vercel bundles these modules for Node before Vercel traces api/index.js.
const app = createApp();
export default app;

import "dotenv/config";
import { createApp } from "./server/app";

// Vercel detects this root default Express export and runs it as one Node.js
// function. `build:vercel` writes the unchanged Vite site into root `public/`.
const app = createApp();

export default app;

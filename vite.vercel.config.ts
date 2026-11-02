import path from "node:path";
import { defineConfig, mergeConfig } from "vite";
import baseConfig from "./vite.config";

// Vercel serves root `public/` from its CDN. This keeps the same Vite/React
// client bundle while placing the finished assets where Vercel expects them.
export default defineConfig(
  mergeConfig(baseConfig, {
    build: {
      outDir: path.resolve(import.meta.dirname, "public"),
      emptyOutDir: true,
    },
  })
);

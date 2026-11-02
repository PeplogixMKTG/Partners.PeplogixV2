import path from "node:path";
import { defineConfig, mergeConfig } from "vite";
import baseConfig from "./vite.config";

// The connected Vercel project expects its static deployment output at root
// `dist/`. This keeps the same Vite/React bundle while matching that setting.
export default defineConfig(
  mergeConfig(baseConfig, {
    build: {
      outDir: path.resolve(import.meta.dirname, "dist"),
      emptyOutDir: true,
    },
  })
);

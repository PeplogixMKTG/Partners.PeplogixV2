# Vercel deployment references — November 1, 2026

- [Express on Vercel](https://vercel.com/kb/guide/ship-a-express-app-on-vercel): Vercel can detect a root `app.ts`, `index.ts`, or `server.ts` that default-exports an Express app and run it as one Node.js function. Static assets should be placed in root `public/` for CDN serving; do not rely on Express static middleware as the deployment asset server.
- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite): Vite projects can deploy to Vercel; static SPAs need an explicit rewrite for direct deep links such as `/dashboard`. Vite-prefixed browser environment variables are public and must not contain secrets.
- [Node.js Vercel Functions](https://vercel.com/docs/functions/runtimes/node-js): Node functions support TypeScript files, pnpm lockfile installation, and recommend grouping related API routes in one function.
- [Vercel environment variables](https://vercel.com/docs/environment-variables): server environment values are configured per Production, Preview, and Development deployment scope; secret values must remain outside source control.

These official references informed the root Express export, root `public/` Vite output, `/dashboard` SPA rewrite, `pnpm` build command, and secret-free `.env.example` in this export.

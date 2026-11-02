# Vercel API routing fix

The project keeps its Vite framework preset and root `dist` static output. The complete Express app already exists in `server/app.ts`; a root `api/index.ts` Node function can export that app directly rather than duplicating its routes. Vercel documents that supported source files in the root `api` directory become Node functions and that related endpoints can share a single function through rewrites. [1]

Vite SPA deep links require explicit rewrites. The existing `/dashboard` rewrite should remain separate from API routing so the current homepage and assets continue to use the static build. [2]

The base Vite config emits `dist/api/platform/config.js` at build time. The existing Express app serves the same pathname dynamically with `Cache-Control: no-store`. The Vercel-only build command must remove that one generated static asset after a successful Vite build so filesystem routing cannot shadow the runtime handler. This does not require any client, shared Vite plugin, or package-script changes. Vercel supports overriding the build command in `vercel.json`. [3]

`registerOAuthRoutes` registers `/api/oauth/callback`, not `/manus-oauth`. The API rewrite therefore covers the existing OAuth callback without adding a nonexistent alternate route.

## Verification

Implementation and local verification are in progress. No commit, push, browser use, or deployment is authorized. Production behavior cannot be confirmed by local tests alone.

## References

[1]: https://vercel.com/docs/functions/runtimes/node-js "Using the Node.js Runtime with Vercel Functions"
[2]: https://vercel.com/docs/frameworks/frontend/vite "Vite on Vercel"
[3]: https://vercel.com/docs/project-configuration/vercel-json "Static Configuration with vercel.json"

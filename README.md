# Peplogix Partner Landing Page

This is the complete editable source for the existing Peplogix Partner Landing Page. It preserves the current React/Vite visual system, responsive layouts, Peplogix brand assets, guided partnership inquiry, secure file handling, optional internal inquiry dashboard, and all form interactions.

The public page is a Vite/React single-page application. The secure inquiry API and dashboard are Express routes backed by Drizzle and a MySQL-compatible database. The project includes a root Express export for Vercel and a Vercel-specific Vite build that produces the same frontend bundle into Vercel's `dist/` directory.

## What is included

- The exact landing-page source, components, responsive styles, typography, colors, icons, animations, and supplied Peplogix images under `client/`.
- The complete inquiry API, secure upload validation, private attachment retrieval, database schema, migrations, and tests under `server/`, `shared/`, and `drizzle/`.
- A Vercel-compatible root `app.ts`, `vercel.json`, `vite.vercel.config.ts`, `.env.example`, `pnpm-lock.yaml`, and Dockerfile.
- A protected `/dashboard` for reviewing submissions. On Vercel, set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `SESSION_SECRET` to enable the portable password-login mode. Existing Manus OAuth is retained only when its Manus environment values are intentionally configured.

## Requirements

- Node.js 22 or newer.
- Corepack with pnpm 10.18.0. The project pins the package-manager version in `package.json`.
- A MySQL-compatible database for inquiries and private uploaded files. Vercel does not provide MySQL automatically; create one through your preferred database provider and keep its connection string private.
- A Vercel account and a GitHub repository for deployment.

## Local setup

1. Extract the ZIP and open the project folder.
2. Copy the secret-free template and add your own values:

   ```bash
   cp .env.example .env.local
   ```

3. Edit `.env.local`. At minimum, add `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Do not commit `.env.local`.
4. Enable the pinned package manager and install dependencies:

   ```bash
   corepack enable
   pnpm install --frozen-lockfile
   ```

5. Apply the checked-in database migrations once against your database:

   ```bash
   DATABASE_URL='your-mysql-connection-url' pnpm db:migrate
   ```

6. Run the full local application:

   ```bash
   pnpm dev
   ```

   Open `http://localhost:3000`. The public page is available at `/` and the internal submission dashboard is at `/dashboard`.

## Verification commands

Run these before committing or deploying:

```bash
pnpm check
pnpm test
pnpm build
pnpm build:vercel
```

`pnpm build` verifies the existing Node/Express production build. `pnpm build:vercel` writes the Vercel CDN assets to a generated root `dist/` directory; it is intentionally ignored by Git. The visual frontend source is the same Vite application in both builds.

## GitHub setup

1. Create an empty GitHub repository.
2. From this project directory, initialize and push your repository if needed:

   ```bash
   git init
   git add .
   git commit -m "Initial Peplogix partner landing page export"
   git branch -M main
   git remote add origin https://github.com/YOUR-ACCOUNT/YOUR-REPOSITORY.git
   git push -u origin main
   ```

3. Confirm `.env`, `.env.local`, `node_modules`, `dist`, and generated root `public/` are not included in the GitHub commit. `.env.example` is safe to commit because it contains names and placeholders only.

## Deploy to Vercel

1. In Vercel, choose **Add New → Project** and import the GitHub repository.
2. Leave the framework detection enabled. The root `app.ts` exports the Express application for Vercel's Node.js runtime. The included `vercel.json` uses `pnpm run build:vercel` and configures the SPA dashboard route.
3. In **Project Settings → Environment Variables**, add these values for **Production**. Add the same values to **Preview** if you want review deployments to accept real test submissions:
   - `DATABASE_URL` — full MySQL-compatible connection string.
   - `SESSION_SECRET` — a unique high-entropy secret, at least 32 random bytes.

- `ADMIN_EMAIL` — the owner email allowed to sign in at `/dashboard`.
- `ADMIN_PASSWORD` — a long unique password for that dashboard.

  To preserve the existing 5 MB-per-file and 25 MB-total branding-asset limits on Vercel, also configure a **private S3-compatible bucket** and set `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, and `S3_SECRET_ACCESS_KEY`. Enable bucket-default encryption. The application gives the browser a short-lived signed PUT URL, then keeps only the private object key in the database. Add the production domain and any preview domains you plan to test to the bucket's CORS `AllowedOrigins`, allowing `PUT` and `Content-Type` from those origins. For Cloudflare R2, MinIO, or another compatible service, set `S3_ENDPOINT` and, if required, `S3_FORCE_PATH_STYLE=true`.

  Mark `DATABASE_URL`, `SESSION_SECRET`, and `ADMIN_PASSWORD` as secrets. Never prefix any of these server values with `VITE_`.

4. Deploy. Vercel runs `pnpm install --frozen-lockfile` and `pnpm run build:vercel`, serves generated static files from its CDN, and runs the Express API/dashboard backend as a Node.js function.
5. Open the deployment URL. Verify `/`, submit a test inquiry, sign into `/dashboard`, review the test submission, and then remove the test record from the dashboard/database if you do not want it retained.

### Optional Manus OAuth mode

The original Manus OAuth path is still in the source for use only when you deliberately configure its project values. If you choose it, supply the `MANUS_*` variables listed as comments in `.env.example` and omit the portable password variables. For a normal GitHub/Vercel deployment, use the password mode described above.

## Security and data handling

The public inquiry endpoints validate request shapes and uploaded bytes, limit file count and size, apply no-store headers, and keep uploaded files private until an authenticated administrator downloads them. Without S3 settings, local and Manus deployments retain the original database-backed fallback. On Vercel, configure the private direct-upload bucket described above for attachments larger than the Function request limit. The dashboard is excluded from search indexing. Do not expose database, session, or object-storage values in browser code, GitHub, Vercel client variables, or screenshots.

## Project structure

```text
client/             React page, components, CSS, Peplogix imagery, and Vite entry
server/             Express API, authentication, secure inquiry routes, and database access
shared/             Shared inquiry schema and browser/server constants
drizzle/            MySQL schema and migration history
app.ts              Root Vercel Express export
vercel.json         Vercel build and SPA routing configuration
vite.vercel.config.ts  Vercel static output configuration
.env.example        Secret-free variable names and placeholders
```

## Existing deployment alternatives

The included `Dockerfile` remains available for other Node container hosts. For Vercel, use the supplied `app.ts`, `vercel.json`, and `build:vercel` command rather than the Dockerfile.

## Full-entry team notification emails (Resend)

The landing-page design is unchanged. When all email settings below are valid, every **newly saved** inquiry atomically queues one email containing all submitted answers, the accuracy confirmation, submission ID/time, and uploaded-file metadata. The applicant's email is `Reply-To`; the sender is your verified address. Files remain private in the authenticated `/dashboard`; notification emails do not publish file capabilities or attach private files.

### Activation

1. In your Resend account, add a domain or sending subdomain you own under **Domains** and publish the exact DNS verification records Resend supplies. Do not replace existing mailbox MX records. Wait until Resend marks the sending domain verified.
2. Create a sending API key restricted to that domain where available. Save it directly in Vercel; do not commit or paste it in source, messages, screenshots, or client-prefixed variables.
3. Apply the checked-in **additive** migration `0003_partner_notifications` against the **same** MySQL database configured for the live Vercel API, using the existing `pnpm db:migrate` command. Run migrations as a one-time trusted operation, not during the static frontend build. This migration creates only the notification table; it does not delete inquiries or files.
4. Add these **server-side** Vercel Production environment values:
   - `RESEND_API_KEY`: your Resend sending key.
   - `PARTNER_NOTIFICATION_FROM`: a verified sender such as `Peplogix Partners <notifications@YOUR-VERIFIED-DOMAIN>`.
   - `PARTNER_NOTIFICATION_TO`: the approved team mailbox(es), separated by commas or semicolons, up to 50 unique recipients. Everyone in this list receives the entire entry, so use only authorized internal recipients.
   - `APP_BASE_URL`: your actual live website origin, such as `https://YOUR-PRODUCTION-DOMAIN`. The dashboard link goes to this website and still requires administrator sign-in.
5. Redeploy the latest GitHub commit after saving environment values. Do not enable real team emails in untrusted Preview deployments. Incomplete/invalid email settings disable new email enqueueing; earlier inquiries are not bulk-emailed automatically.
6. Submit a clearly labelled test entry, verify the saved inquiry, inspect the accepted email in Resend, and confirm receipt in the intended mailbox. An API acceptance is **not** proof of inbox delivery; check Resend's delivery/bounce details and your mailbox.

### Failure and duplicate protection

The notification row is saved in the same transaction as its inquiry. The first send is bounded and awaited before the HTTP request ends, making it compatible with Vercel Functions; it is not an unreliable detached background promise. The original success response remains successful when sending fails. The saved immutable email payload, unique inquiry ID, leased send claim, and Resend idempotency key prevent repeated form requests from creating new alerts. A row marked `sent` means the provider accepted the message, not that the recipient opened or received it.

Authenticated administrator-only endpoints provide delivery state and controlled retry:

- `GET /api/partner/inquiries/:id/notification`
- `POST /api/partner/inquiries/:id/notification/retry`
- `POST /api/partner/notifications/process` (administrator-only bounded outbox drain)
- `GET /api/partner/notifications/process` (scheduler-only; requires exact `Authorization: Bearer <CRON_SECRET>` and a configured random token of at least 32 characters)

Use the existing authenticated administrator session; these are not public resend links. A retry never resends a row already marked `sent`. A pending/failed alert can also be retried by an idempotent repeat of its original submission request after its backoff delay. **No periodic scheduler is installed or claimed**: if there are no later requests or administrator actions, a failed alert remains stored for follow-up. A bounded worker is implemented and processes at most two due alerts per call. Connect its protected GET endpoint to your deployment's native scheduler and configure `CRON_SECRET` to enable recurring retries; select a cadence supported by your Vercel plan. No scheduler or paid service is automatically provisioned.

A definite sender/key/configuration rejection requires administrator review. After correcting it, the administrator retry endpoint can retry within the original safe window using the unchanged payload and key. Eight attempts or the 23-hour safe retry boundary blocks automatic re-sending rather than risking duplicate mail after Resend's 24-hour idempotency-key retention expires. Verify the provider's records before any deliberate manual re-send. Do not delete durable notification state to force retries. This integration never forwards historical inquiries or messages to an unconfirmed address.

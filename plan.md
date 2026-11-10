# Peplogix Partner Portal

## Scope and implementation

Build the complete standalone partner landing page described in the supplied requirements, using the prepared React/TypeScript client, Express/tRPC server, managed MySQL database, and existing Manus OAuth for the internal owner/admin dashboard. A single public page contains the marketing hero and in-page four-step inquiry. The only supporting application page is the protected inquiries dashboard. Submission is public, inquiry reading and asset downloads require validated admin authentication. No affiliate, referral, commission or pricing content.

Preserve every question and conditional branch in the supplied requirements. The brand step is skipped when no selected service needs customization; the four-step progress communicates the skipped state. Requirements for wholesale, storefront, dropshipping and 3PL are collected within partnership preferences. Persist full structured inquiry payload, sanitized raster logo and document/image asset bytes, date, and idempotency token in managed MySQL; secure authenticated download endpoints prevent public exposure of confidential branding assets. File size/count limits and allowlisted signatures are validated server-side. This provides durable protected storage without pretending public object URLs are private. No email/CRM integration is assumed.

## Design

Reuse the existing Peplogix brand: deep navy typography, bright turquoise molecule accents, coral calls to action and warm white backgrounds. Editorial, science-led product presentation with an asymmetrical two-column hero; oversized navy headline and teal emphasis, realistic vial composition, quiet molecular orbit motif, outlined chips and restrained floating callouts. White header with supplied logo, subtle section links and a coral CTA. Partner opportunities flow into the inquiry panel with a narrow numbered progress rail and clean spacious form content. Rounded corners are modest, not pill-heavy. Use the current site's sans-serif direction with Geist headings and body, matching the supplied reference site. Navy builds credibility; teal conveys scientific precision; coral marks decisive actions. Motion is short 180–300ms opacity/translate transitions, with reduced-motion respected. Controls show clear focus/selection and never rely on color alone. Keep logo proportions and use the supplied original logo, not a recreated wordmark. Voice is clear, professional and encouraging: “Build Your Brand With Peplogix.” and “Your products. Your brand. Your platform.”

## Structure

- `client/src/pages/Home.tsx`: public landing page composition and entry to the inquiry.
- `client/src/components/partner/`: inquiry step components, accessible fields, uploads, live vial preview.
- `client/src/pages/Dashboard.tsx`: authenticated owner/admin submission list, details and protected assets.
- `shared/partner.ts`: form data, option catalogs, conditional predicates and submission validation shared by client/server.
- `server/partner.ts`: validated public submission, idempotent database persistence, protected list/detail/download.
- `drizzle/schema.ts`, `drizzle/`: durable inquiry schema and additive migrations.
- `client/public/`: small brand assets, favicon and complete route manifest.

## Deployment constraints

Publish the saved version through the managed container deployment. The intended custom domain is `partners.peplogixpeptide.com`; connecting it requires domain/DNS ownership and cannot be assumed. Provide the actual published managed URL if publication completes and identify custom-domain setup separately. Team access uses real Manus authentication and admin authorization; only the configured project owner or explicitly authorized admins may read inquiries.

## Owner access provisioning

Because no platform owner OpenID was supplied, administrator access is provisioned with a pre-created one-time invitation token delivered privately to the project owner. Only its SHA-256 hash is stored in MySQL; redemption requires a real authenticated Manus account, is expiration-bound and atomically single-use. It never grants rights to the first visitor. The authenticated account consuming the privately delivered code becomes an administrator. Removed temporary upload capabilities can delete only their own unclaimed bytes; abandoned bytes are lazily pruned after 24 hours on new upload.

## Requested visual refinements — October 29

Use supplied capsule-bottle and clinical-vial photos as physical-packaging references for a new generated hero composition and blank photographic bases for functional live-label views. Keep the approved overall layout and palette while exact brand values are pending. Replace tall decorative vial artwork, remove FAQ completely, and normalize section rhythm/remove redundant form intro. No backend or auth changes required.

## Confirmed palette and richer page treatment — October 29, 14:52

The user confirmed blue #003F6A and orange #D8603D. These supersede the previous inferred navy/teal/coral palette for interface colors. Preserve the supplied logo artwork. Use the exact supplied ClinicalPeptideProductTrioMockup.png in the hero, re-encoded to WebP without cropping or altering label content. Expand the hero product area for the landscape aspect ratio. Enrich the page with a sky-blue hero, a branded blue capability band, pale-blue opportunity section with white and warm-tinted cards, deep brand-blue process section with white text and orange accents, and a light-blue inquiry background around the white form. Increase primary descriptive text to 16–18px on desktop and 15–16px mobile with restrained, readable line lengths. Live vial/capsule mockups retain existing accurate photographic packaging bases but their printed label hierarchy now matches the supplied reference: framed YOUR / LOGO HERE placeholder, blue product field (outline for vial, filled for capsule), framed detail and orange research-use accent; no invented dosage or purity specifications. Keep all inquiry/secure-upload logic unchanged; update preview defaults/reset to brand colors.

## Button lettering refinement — October 29, 15:28

Per the user's explicit preference, orange buttons use white text and icons rather than the previous dark lettering. Preserve button backgrounds, sizes, actions, and all other page styling.

## Close-up reference vial refinement — October 29, 15:31

Match the clinical-vial live preview to the newly supplied close-up screenshot through a narrowly scoped image edit: remove only the logo placeholder and frame, preserving the remaining reference photograph and label. Use a reference-proportioned stage, place uploaded logos in the now-white top label region, and preserve the product-band color customization through a fitted interface overlay. Remove default YOUR LOGO HERE text from the live preview while leaving the hero unchanged. All displayed dose/purity text comes from the supplied reference photograph, not a new product claim; the existing visual-only/unapproved-packaging disclaimer remains.

## Equal preview dimensions — October 29, 15:38

Both formats use the existing capsule-size 4:5 stage. Place the tall reference vial in a centered, natural-aspect inner image scene that contains the photo and its live overlays, so its full image remains undistorted while the outer preview has identical dimensions to the capsule preview.

## Vial background removal — October 29, 15:40

Use native-alpha image editing to remove the blue studio backdrop and floor from the live-vial asset. Preserve the reference vial and label, and place it over a near-white stage background matching the capsule photo's edge treatment. Retain equal-sized preview frames, natural image proportions and the existing live overlays. No hero or capsule-image edits.

## Replacement banner — October 29, 15:46

Replace only the hero image binding with the supplied PremiumBlueResearchSkincareCollection.png, re-encoded without cropping at its original1672×941 dimensions. Keep the approved hero layout and all live-preview assets and behavior unchanged.

## Catalog-interest replacement — October 30

Replace the single shared catalog-interest constant with the user's exact 21 provided labels and remove every old label, including the former catch-all. Because inquiry UI search, selection, review, client/server validation, persisted payloads and dashboard rendering share the same `products` model, no backend schema or workflow changes are needed. Update the focused browser checks from any removed selection to a retained option and verify the complete replacement list is the only catalog list surfaced.

## Landing-logo stability and responsive QA — October 30

The pre-React static fallback previously rendered the 1600×684 logo without stylesheet constraints, then snapped to the application header on mount. Replace it with a critical styled boot shell that reserves the same header, logo, hero and product-image geometry as the React landing screen. Preload the logo and hero asset; add intrinsic logo dimensions, exact aspect ratio and high fetch priority to both the boot and React header. The boot marker is removed immediately before React mounts. Validate first paint at desktop and mobile widths plus hero/header CTA navigation, guided form step navigation, new-catalog search/selection, package switching, color reset, no horizontal overflow, logo uploads/removal/reset through the existing focused preview regression, server tests, and production build. No real inquiry is submitted for UI QA.

### Asset-delivery correction

The approved hero image is served from `client/public/brand/peplogix-partner-hero.webp` rather than a managed-storage route, keeping the exact1672×941 owner-supplied composition while ensuring it loads reliably on fresh local, Preview and mobile sessions. Update the preload and all hero assertions to the public path.

## Preview watcher recovery — October 30

The development Preview process crashed while Vite followed a sandbox symlink loop under `/run/udev/watch/1`, leaving the platform “Setting up your project” fallback. The embedded Vite middleware now enables polling, disables symlink following, and ignores dependency/build/Git/debug-log directories. Start the temporary development listener with polling enabled as well. This affects only development Preview file watching; the production build remains unchanged. The gateway’s yellow temporary-preview status is expected until the user explicitly publishes a deployed version.

## GitHub + Vercel export — November 1

The export preserves the existing React/Vite/Express architecture and all visual source files. It adds a root `app.ts` that Vercel recognizes as an Express application, extracting shared middleware/routes into `server/app.ts` so local development, the original Docker/Node production server, and Vercel invoke the identical API logic. `pnpm build:vercel` runs the existing Vite client bundle with a Vercel output override into root `public/`; the landing components, styling, imagery, and responsive breakpoints are not redesigned or regenerated.

External Vercel deployments require `DATABASE_URL` because secure inquiry records and private uploads are persisted in MySQL. For the internal dashboard, a Vercel-safe password mode is enabled only by `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `SESSION_SECRET`. Existing Manus OAuth remains optional and unchanged when its values are configured. `.env.example` contains names/placeholders only, and the README gives exact local, GitHub, migration, Vercel environment, build, and deployment steps.

The final ZIP will exclude generated build output, dependencies, `.git`, local environment files, test screenshots, credentials, and Manus-only runtime artifacts while including the full editable source, migrations, tests, lockfile, Vercel configuration, assets, Dockerfile, and README.

## Export completion — November 1

The final export is self-contained for GitHub and Vercel: its approved hero, logo, live transparent vial, and live capsule-bottle source assets are served from `client/public/brand/`, not Manus storage. The project retains the unchanged landing experience while the deployment layer adds a root Express export, Vercel static output, optional password mode for the internal dashboard, and S3-compatible direct browser uploads for the existing full-size private attachment workflow.

## Vercel deployment recovery — November 1

Vercel’s deployment log confirms the configured `pnpm run build:vercel` command succeeds but its connected project still requires Vite’s conventional root `dist/` directory. Configure both `vite.vercel.config.ts` and `vercel.json` to generate and declare `dist/` explicitly. This is a deployment configuration repair only; it does not alter application source, design, assets, responsive layout, or interaction behavior.

## Full-entry team email notifications — November 2

Add application-native Resend notifications to the existing saved-inquiry backend. Preserve all landing components and styles. Atomically create a durable notification outbox entry with each newly saved inquiry when notification configuration is enabled; store the fixed rendered email payload, state, attempts, provider ID, and timestamps. Await an initial bounded send attempt before the submission handler finishes, without allowing a provider failure to discard a saved inquiry. Repeated form requests use the existing request UUID and cannot create multiple notifications. Use provider idempotency plus durable sent state and a leased claim for concurrent attempts. Expose authenticated administrator-only status and retry actions; no public replay or resend endpoint. Automatic periodic retry wiring is configured only if an actual scheduler is connected, rather than claiming a nonexistent background worker.

The email contains every submitted field, contact details, partnership/product selections, conditional storefront/fulfillment requirements, color values, notes, accuracy confirmation, submission ID/time, and private asset metadata. Keep files private behind authenticated dashboard access. The applicant address is Reply-To, not the sender. Use server-only RESEND_API_KEY, PARTNER_NOTIFICATION_FROM, PARTNER_NOTIFICATION_TO, and APP_BASE_URL; recipient addresses, sender domain, DNS ownership, live-site runtime/migrations, and real email delivery must be confirmed before marking the integration live. The user's open Resend account currently shows no sending domain.

## Notification activation details — November 2, 11:49

User authorized recipient gpernudi@peplogix.com and live origin https://partners-peplogix-v2.vercel.app, using Resend's default sender for now. The existing Resend team member is gpernudi@peplogix.com, consistent with default resend.dev testing eligibility; verify an accepted test before claiming delivery. Treat default sender as temporary/testing-only, not branded production sending. Live HTTP inspection found / returns 200 while /api/health and /api/partner/inquiries both return Vercel 404, and generated /api/platform/config.js is static unconfigured metadata. Add an explicit Vercel Node Function and API rewrites so the same Express routes run under the current Vite deployment without altering any landing source. Inspect live database/environment provisioning before applying the outbox migration or enabling notification settings.

## Live Vercel ESM packaging recovery — November 2

Runtime logs show an extensionless `server/app` import after the API TypeScript entry was individually transpiled. Preserve the existing Express application and every frontend file, but generate an ESM backend bundle using esbuild during build:vercel. The committed JavaScript API entry imports that generated bundle through its explicit `.js` extension; include the bundle in Vercel function artifacts, ignore it in source control, and pin Node 22. Runtime secrets remain environment-only. Validate the generated entry with real Node and the deployed cold-start health/API routes before the authorized full-entry email test.

## Live notification activation verified — November 2

The existing Vercel application now saves inquiries to the managed MySQL database and sends full-entry Resend email to the approved sole recipient. Runtime module packaging, migration and all required Production secret settings are complete. Native Node22 cold-start health, complete answer/file persistence, owner authentication, private downloads, immutable single-send delivery and idempotent request repeats were exercised end-to-end. Resend reports Delivered for the clearly labeled live test. Keep default sender restricted to the account email; no domain or DNS connection and no periodic retry scheduler were configured. The application source was synced to V2; this final evidence-only update is saved in the managed repository without triggering a redundant Vercel deployment.

## Single-owner dashboard access — November 2, 12:53

Only the configured gpernudi@peplogix.com password-mode owner may authenticate to the external dashboard and its protected APIs. Match signed sessions to the canonical password-owner OpenID, current configured email, password login method and admin role; leave Manus-mode behavior unchanged. Update the user-supplied password only in Vercel secret storage and rotate the session signing key so previously issued sessions are invalid. Preserve every client file, submission route and email setting. Never put the password in Git or this plan.

Owner-only access verified on the deployed November2 version: live acceptance/rejection tests passed, including invalidation of an actual old session. Credentials remain secret-only; no client changes. A concurrent existing Vercel domain redirect targets partners.peplogix.com, which is not resolving from this environment; this update did not alter domains/DNS.

## Two-recipient notifications and missed test recovery — November 2,16:54

User now authorizes full-entry email to gpernudi@peplogix.com and gelsey@marketingdna.com. Inspect the existing saved test and durable delivery state, current Vercel settings, and Resend sender verification first. Correct environment-only sender/recipient configuration where supported, redeploy the existing source, and retry only definitely unsent notifications without weakening idempotency. Keep owner-only dashboard access and every frontend file unchanged. No domain/DNS changes are authorized by this request; if Resend still has only its restricted default sender, report that prerequisite rather than breaking currently working notifications.

## Temporary single-recipient restoration — November 2,16:58

User explicitly chose to restore gpernudi-only notifications. Keep Resend's current default sender and change only PARTNER_NOTIFICATION_TO back to gpernudi@peplogix.com in Production; redeploy the current Vercel source without altering website or dashboard credentials. Recover only the identified test4 notification with provider403, no provider ID and no successful send, retaining the full saved entry and file metadata. A recipient correction for this definitively rejected outbox payload must be audited and conditional; do not mutate sent or ambiguous delivery records or send duplicates. Verify provider acceptance and Resend delivery before marking complete. Gelsey remains excluded until a sender domain is verified.

Temporary restoration verified17:01: production redeploy Ready, sole recipient configured, exact rejected test corrected and safely retried, provider Delivered confirmed, and duplicate retry prevented. Both-recipient sending remains deferred until sender-domain verification; no website/DNS/admin-access changes.

## Verified-domain two-recipient activation — November 3

User states Resend domain setup is complete and authorizes sending full-entry notifications to gpernudi@peplogix.com and gelsey@marketingdna.com. Verify the existing sending domain, replace the default From with Peplogix Partners at a notification address on that verified domain, and configure both addresses in PARTNER_NOTIFICATION_TO. Redeploy the existing source so runtime settings apply. Preserve all frontend, owner-only access, secrets and DNS settings. User plans to send a new test; inspect its durable delivery and Resend recipient statuses without generating unsolicited duplicate test submissions.

November3 configuration activation complete: peplogix.com Verified, branded notifications@ sender and both approved recipients saved in Production; existing source redeployed Ready. Every application source file is unchanged. Actual delivery of the upcoming user test remains unverified until it is submitted.

## Five-recipient replacement — November 3,10:26

User authorized notification recipients only partner@peplogix.com, mgt@peplogix.com (explicitly corrected from .xom), wnagi@peplogix.com, sbuculesei@peplogix.com, gpernudi@peplogix.com. Replace PARTNER_NOTIFICATION_TO in Production, retaining verified From and every other setting. Redeploy current production source once; remove prior Gelsey recipient for future submissions and do not resend historical notifications. Preserve website and owner-only dashboard access.

Five-recipient replacement complete10:27: Production variable update and redeployment succeeded. Current verified sender retained and prior Gelsey recipient excluded; no source/design/access changes or historical resends.

## Partnership opportunity replacement — November 10

Replace the visible seven checkbox cards in Step2 with the supplied seven service titles and complete descriptions in supplied order, one top-to-bottom column at desktop and mobile sizes. Retain existing colors, spacing system, checkbox multi-selection, icons, hero and all unrelated sections. Use service-specific icons. Turnkey Business opens the existing storefront and 3PL questions and brand preview; Product Supply and 3PL Fulfilment Only opens existing fulfillment/dropship requirements, with branding available when branded packaging is selected; Wholesale and Contract Manufacturing opens wholesale questions and brand customization. The four advisory/medical/processing/resource options need only the existing general optional interests/notes and proceed directly to review unless another selected option needs branding. Persist new names unchanged into review, database and full-entry notification emails. Retain legacy option names only in server validation/helper compatibility for historical and already-open sessions, never in the new visible picker. No database migration, notification recipient, authentication, DNS or other landing-page changes.

FDA states compounded medications are not FDA-approved. Requested permission to title the medical option “503A Compounded Medications and Medical Supplies” while preserving its provided description; do not publish the disputed original heading without resolution. Source: https://www.fda.gov/drugs/human-drug-compounding/compounding-and-fda-questions-and-answers .

User requested original medical title be kept. Keep exact original title and supplied description; display an immediate, readable clarification beneath it that 503A compounded medications are not FDA-approved, avoiding an unqualified false medical claim. All seven supplied titles and descriptions retained.

November10 local implementation validated: seven complete descriptions and single-column desktop/tablet/mobile layout, conditional mappings and safe form flows passed. New service names render in full-entry emails; legacy names remain accepted only for historical/in-flight compatibility. Existing hero/assets/catalog/owner access/notification settings unchanged. Both builds and250 backend tests passed.

November10 deployment complete: source tree synced to V2 commitc58b6bb; its GitHub-triggered Vercel deployment dpl_CUnuH8H5dTCrZX7mHywgbLjF7csp reached Ready. Only selected service-card copy/layout, mappings and test fixtures changed; all other design, assets and email/admin settings preserved.

## Approved 503A wording correction — November10,17:30

User explicitly approved title “503A Compounded Medications and Medical Supplies” and removal of the added clarification. Rename the shared fourth service, delete only the additional clarification markup/data/style, keep description unchanged, update icon mapping and matching tests. Preserve old displayed title only in hidden legacy validation for historical/in-flight records. No redesign, changes to other form paths, database migration or environment configuration. Sync existing V2 history and verify its GitHub-triggered production deployment.

Approved 503A correction deployed17:33: GitHub cf9ee0b, Vercel READY dpl_6KNVnhw2sY4ycRaaNejMHouzxQeK; live title and removed clarification confirmed, descriptions unchanged.

## Source-domain email attribution — November10,17:53

Backend-only change: normalize and allowlist the five user-provided page hostnames from the request (host preferred; valid same-site origin/referrer fallback for proxy requests). Pass optional sourceDomain separately from validated form data into the inquiry transaction and email builder; store sourceDomain in existing inquiry JSON and render it in immutable HTML/plain-text payload and safe subject. Keep configured canonical dashboard URL separate from originating domain. Unknown hosts remain explicitly unavailable rather than inventing a known page; existing requests/queued records and all frontend files stay unchanged. Validate exact domains, spoofed/unknown/control headers, persistence, idempotent repeats and full-entry emails with mocked operations, then normal fast-forward V2 sync and existing GitHub-triggered Vercel deployment.

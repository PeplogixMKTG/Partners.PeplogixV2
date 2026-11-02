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

Vercel’s deployment log confirms the configured `pnpm run build:vercel` command succeeds but writes the unchanged Vite build to root `public/`; Vercel was still searching for its Vite default `dist/`. Add the explicit `outputDirectory: "public"` field to `vercel.json`. This is a deployment configuration repair only; it does not alter application source, design, assets, responsive layout, or interaction behavior.

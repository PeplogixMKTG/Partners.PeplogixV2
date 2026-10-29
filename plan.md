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

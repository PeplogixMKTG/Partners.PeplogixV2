# Delivery outcomes

The following acceptance clauses are retained verbatim from the supplied specification. Checkmarks indicate completed outcomes only after implementation evidence.

## [x] Outcome 1

# Manus Prompt: Peplogix Partner Portal & Branded Landing Page

## Project Overview

Build a premium, fully branded, multi-step partner inquiry landing page for Peplogix.

**Landing page URL:** `https://partners.peplogixpeptide.com`

**Reference website:** https://peplogix.github.io/start and Peplogixpeptide.com
Reference logo to use: attached

Use the current Peplogix website as the primary reference for branding, colors, typography, visual style, logo usage, and overall design direction.

The purpose of this page is to collect detailed inquiries from businesses interested in partnering with Peplogix through wholesale supply, private labeling, custom-branded products, custom storefront development, dropshipping, or 3PL fulfillment.

This is NOT a traditional contact page. It should function as a simple, professional partner onboarding and inquiry experience.

The design should feel modern, premium, clean, and technology-driven.

Do not include affiliate programs, referral programs, commissions, or pricing anywhere on this page.

## [x] Outcome 2

# 1. Overall Design & Branding

Create a visually impressive, branded landing page that feels like a natural extension of the existing Peplogix website.

### Design direction

- Use the existing Peplogix brand colors.
- Use the existing Peplogix logo.
- Match the current website's typography and visual identity.
- Use a clean, modern, premium aesthetic.
- Use subtle animations and transitions between steps.
- Use rounded cards, clean spacing, and a minimal interface.
- Keep the experience simple and intuitive.
- Make the page fully responsive for desktop, tablet, and mobile.
- Do not use generic stock photography.
- Use product imagery and branding elements that feel consistent with Peplogix.

### Hero section

Create a simple hero section with:

**Headline:**
Build Your Brand With Peplogix.

**Subheadline:**
Your products. Your brand. Your platform.

Explore partnership opportunities with Peplogix, from wholesale supply and custom-branded products to fully branded storefronts and fulfillment solutions.

**CTA Button:**
Start Your Partnership Inquiry

The CTA should initiate the multi-step form.

Include a subtle visual of a Peplogix vial or branded product to make the page visually engaging.

## [x] Outcome 3

# 2. Multi-Step Partner Inquiry Form

The form should be presented as a clean, guided onboarding experience.

Use a progress indicator at the top showing:

1. About Your Business
2. Partnership Preferences
3. Brand Customization
4. Review & Submit

The form should dynamically adjust based on the selections made by the user.

Users should be able to go back to previous steps without losing their information.

Use conditional logic so users only see the questions relevant to their partnership interests.

## STEP 1 — About Your Business

**Headline:**
Tell Us About Your Business

**Description:**
Let's start with a few details so our team can better understand your business.

Collect the following information:

- Business / Company Name
- First Name
- Last Name
- Business Email Address
- Phone Number
- Do You Currently Have a Website?

For the website question, use radio buttons:

- Yes, I have an existing website.
- No, I am looking to build one.

If they select YES, display an additional field:

**Current Website URL**

Example placeholder:
https://yourbusiness.com

Also include:

**What type of business do you operate?**

Allow users to select one or more:

- Medical / Healthcare Business
- Wellness / Aesthetics Business
- Ecommerce Brand
- Research Supply Business
- Distributor / Wholesaler
- Other

If they select Other, display a text field.

CTA: Continue

## [x] Outcome 4

## STEP 2 — Partnership Preferences

**Headline:**
How Would You Like to Partner With Peplogix?

**Description:**
Tell us what you're looking for. Whether you need product supply, custom branding, a complete storefront, or fulfillment support, we can explore the right solution for your business.

Allow users to select MULTIPLE options.

Present the options as visually appealing cards with icons, titles, and short descriptions.

### Partnership Options

**1. Wholesale Supply**

I want to purchase products in bulk and sell them through my existing business or sales channels.

**2. White-Label Products**

I want Peplogix products branded with my own company logo and branding.

**3. Custom-Branded Storefront**

I want a website or ecommerce platform built specifically for my brand, with my own logo, colors, and product catalog.

**4. Dropshipping Fulfillment**

I want to sell products through my business without holding inventory. I am interested in having orders fulfilled directly to my customers.

**5. 3PL Warehousing & Fulfillment**

I am looking for warehousing, inventory management, order processing, and fulfillment services.

**6. Wholesale + Custom Storefront**

I want to purchase wholesale products while also having a dedicated ecommerce storefront built for my brand.

**7. Other Partnership Opportunity**

I have a different partnership model in mind.

If selected, display:

**Tell us more about your partnership idea.**

Use a text area.

### Additional Questions

After the user selects their partnership preferences, display relevant follow-up questions.

**What products or product categories are you interested in?**

Use a multi-select dropdown or searchable selection field.

Allow users to select from the current Peplogix product catalog where possible.

Also provide:

- Other / Not Sure Yet

**Estimated Monthly Order Volume**

Use optional selections:

- Just Getting Started
- Under 100 Orders
- 100–500 Orders
- 500–1,000 Orders
- 1,000+ Orders
- Not Sure Yet

**Tell Us More About Your Business Needs**

Optional text area.

Placeholder:
Share any additional details about your business, goals, or the partnership you're envisioning.

CTA: Continue

## [x] Outcome 5

# 3. STEP 3 — Brand Customization

This step should be conditionally displayed if the user selects:

- White-Label Products
- Custom-Branded Storefront
- Wholesale + Custom Storefront
- Dropshipping Fulfillment with custom branding

The objective is to allow prospective partners to visualize their own brand on Peplogix products and storefronts.

**Headline:**
Make It Your Brand.

**Description:**
Tell us how you envision your brand. Upload your logo, select your brand colors, and explore how your products could look with your own identity.

## A. Upload Your Logo

Create a prominent logo upload section.

Allow users to upload:

- PNG
- JPG
- JPEG
- SVG, if supported safely

Allow drag-and-drop uploads.

Display a live preview of the uploaded logo.

Include a remove / replace option.

The logo should be used in the vial mockup described below.

## B. Brand Colors

Ask:

**What are your brand colors?**

Provide:

- Primary Brand Color
- Secondary Brand Color
- Accent Color

Use interactive color pickers.

Also include an option:

"My brand colors are not finalized yet."

If selected, allow them to skip the color selection.

## C. Live Vial Mockup

This is a key feature of the landing page.

Create a realistic, high-quality vial mockup that allows the user to visualize their logo on a Peplogix-style product vial.

The mockup should update dynamically as the user uploads their logo.

### Mockup requirements

- Display a realistic research product vial.
- Include a clean, professional product label.
- Place the uploaded logo directly onto the vial label.
- Maintain the correct proportions of the uploaded logo.
- Allow the label to incorporate the user's selected brand colors.
- Ensure the logo looks naturally printed onto the vial label rather than floating above it.
- Use subtle shadows, reflections, and realistic lighting.
- Display the vial against a clean, neutral background.
- The mockup should update instantly when the logo or colors change.
- Provide a reset option.

If no logo is uploaded, display a neutral placeholder label with the text:

YOUR BRAND

The purpose of this feature is to make the partnership experience more engaging and help prospective partners visualize their own branded products.

Important: This is a visual branding mockup only. Do not imply that the mockup represents a finalized product label, approved packaging, or an actual product specification.

## D. Additional Brand Assets

Ask:

**Do you have any additional branding or marketing assets?**

Allow users to upload multiple files.

Examples:

- Brand Guidelines
- Logo Variations
- Product Images
- Marketing Materials
- Existing Website Screenshots
- Other Brand Assets

Allow common image, PDF, and document formats.

Include an optional text field:

**Additional Branding Instructions**

Placeholder:
Tell us more about your brand, design preferences, or any specific requirements for your custom products or storefront.

## [x] Outcome 6

# 4. Storefront & Fulfillment Requirements

Display relevant questions based on the partnership selections.

## If Custom-Branded Storefront Is Selected

Ask:

**What type of storefront are you looking for?**

- A fully custom ecommerce website
- A branded storefront using an existing platform
- A custom-branded product catalog
- I am not sure yet

Ask:

**Do you already own a domain?**

- Yes
- No
- I need assistance

If Yes, collect the domain name.

Ask:

**Do you have an existing website that needs to be redesigned or migrated?**

- Yes
- No
- Not Sure

If Yes, collect the existing website URL.

Ask:

**What features would you like your storefront to include?**

Allow multiple selections:

- Custom Branding
- Product Catalog
- Ecommerce Checkout
- Customer Accounts
- Order Management
- Subscription Capabilities
- Inventory Management
- Shipping & Fulfillment Integration
- Other

If Other, display a text field.

## If Dropshipping Fulfillment Is Selected

Ask:

**How would you like orders to be fulfilled?**

- Direct-to-customer fulfillment
- Fulfillment under my own brand
- White-label packaging
- I am not sure yet

Ask:

**Do you currently have an ecommerce website?**

- Yes
- No
- I am planning to build one

If Yes, collect the platform:

- Shopify
- WooCommerce
- WordPress
- Custom Platform
- Other

## If 3PL Warehousing & Fulfillment Is Selected

Ask:

**What fulfillment services are you interested in?**

Allow multiple selections:

- Inventory Storage
- Order Processing
- Pick & Pack
- Direct-to-Customer Shipping
- White-Label Packaging
- Inventory Management
- Returns Processing
- Other

Ask:

**Will you be supplying your own inventory?**

- Yes
- No
- Not Sure

## If Wholesale Supply Is Selected

Ask:

**How are you planning to purchase products?**

- Bulk Wholesale Orders
- Ongoing Recurring Orders
- Wholesale Supply for My Own Storefront
- Wholesale Supply for an Existing Business
- Not Sure Yet

Ask:

**Estimated Initial Order Size**

- Just Exploring
- Small Initial Order
- Medium Initial Order
- Large Initial Order
- Not Sure Yet

Do not display pricing or dollar amounts.

## [x] Outcome 7

# 5. STEP 4 — Review & Submit

**Headline:**
You're One Step Closer.

**Description:**
Review your information below and submit your partnership inquiry. Our team will review your business and reach out to discuss the next steps.

Display a clean summary of:

- Business Information
- Website Information
- Partnership Preferences
- Product Interests
- Brand Customization
- Fulfillment Requirements
- Additional Notes

Allow users to edit each section before submission.

Include a required checkbox:

"I confirm that the information provided is accurate and that I am submitting this inquiry on behalf of my business."

CTA Button:

**Submit Partnership Inquiry**

After successful submission, display a branded confirmation screen.

### Confirmation Screen

**Headline:**
Thank You for Your Interest in Peplogix.

**Description:**
Your partnership inquiry has been successfully submitted.

Our team will review your information and get back to you to discuss the best way to partner with Peplogix.

We look forward to learning more about your business.

Do not display pricing, automated quotes, or any promise of approval.

## [x] Outcome 8

# 6. Backend & Submission Requirements

This must be a functional inquiry form, not just a visual mockup.

Ensure all submissions are captured and accessible to the Peplogix team.

### Submission data

Capture:

- Company Information
- Contact Information
- Website Information
- Partnership Selections
- Product Interests
- Brand Colors
- Uploaded Logo
- Uploaded Marketing Assets
- Storefront Requirements
- Fulfillment Requirements
- Additional Notes
- Submission Date & Time

### Functional requirements

- Validate required fields.
- Validate email addresses and phone numbers.
- Allow users to navigate backward and forward.
- Preserve entered information between steps.
- Support conditional form logic.
- Support file uploads.
- Display upload progress and errors.
- Prevent duplicate submissions from repeated clicks.
- Display a clear success message.
- Ensure uploaded files are stored securely.
- Ensure the team can access submitted inquiries and uploaded assets.

If possible, create an internal submission dashboard or connect the form to an existing Peplogix inquiry management system.

Do not assume that the form is connected to an email or CRM unless the integration has actually been configured and tested.

## [ ] Outcome 9

# 7. Technical Requirements

Build this as a standalone landing page for the subdomain:

`partners.peplogixpeptide.com`

The page should be easy to maintain and should not require changes to the primary Peplogix website.

Requirements:

- Responsive design
- Fast loading
- Clean, modern UI
- Functional multi-step form
- Dynamic conditional questions
- Live logo preview
- Live vial mockup
- Secure file uploads
- Proper form validation
- Accessible form controls
- Mobile-friendly interactions

Use the current Peplogix website as the source of truth for visual branding.

Do not introduce a different brand identity.

Do not add affiliate marketing, referral programs, commission structures, pricing tables, or pricing estimates.

Do not create unnecessary pages or navigation.

The primary goal is to help a potential business partner explain exactly what they need and submit a detailed inquiry with minimal friction.

## [ ] Outcome 10

# Final Deliverable

Build the complete, polished, functional landing page.

The finished experience should feel like a premium Peplogix partner portal, with a guided inquiry process and a live branded vial visualization.

Prioritize simplicity, brand consistency, and a professional experience that encourages qualified businesses to submit their partnership inquiries.

Before completing the project, test the full experience on desktop and mobile, including conditional form logic, logo uploads, vial mockup rendering, file uploads, navigation between steps, and successful form submission.

Provide the final deployed URL and confirm what backend or submission system is connected.

## [x] Read-only implementation review

A separate read-only validation agent traces form, validation, conditional logic, persistence, private asset downloads and admin authorization against these requirements.

## Evidence and remaining handoff

Desktop/mobile full-flow submissions and private asset behavior passed; exact test data removed. The separate review identified hidden-file payload, aggregate size, optional-selection consistency, MIME allowlist, and unclaimed upload cleanup. These are resolved in the client and backend; focused mobile regression passed. Team access uses real Manus OAuth plus a privately delivered one-time admin activation code. Custom subdomain DNS connection remains pending; no email or CRM delivery is configured. Publication of the recorded version remains to be confirmed.

## [x] Product-reference refinement — October 29

Replace the previous tall decorative hero vials and carton with capsule bottle and short clinical vial renderings matching the supplied Peplogix reference photos. Match white ribbed screw-cap bottles and wide gray flip-off/silver-crimp glass vials with white labels. Update the live your-logo-here preview to this packaging language, preserving live logo/colors and reset, and offer capsule/vial views.

## [x] Section rhythm and FAQ removal

Fix inconsistent section spacing on desktop/mobile, including redundant form introductions. Remove the entire A LITTLE MORE CLARITY / Before you begin FAQ section and unused code/styles. Preserve the secure inquiry backend.

## [x] Confirmed brand colors

Apply exact brand color codes when supplied. The palette was originally pending; the user supplied blue #003F6A and orange #D8603D in the October 29, 14:52 message. Apply these exact interface colors while retaining original logo artwork.

Verification: desktop1440 and mobile390 through stable Preview loaded new images, no FAQ/duplicate inquiry intro, measured intro-to-form gaps32px/28px, zero form top padding, no horizontal overflow or JavaScript errors. Both packaging views preserve live colors/logo across switching; reset removes test upload and restores defaults. TypeScript, 17tests and production build passed. Exact brand values remain pending. Earlier publish request was cancelled; this update is for Preview/checkpoint, not claimed live publication.

## [x] Supplied product-trio hero and reference-matched live labels

Use the attached ClinicalPeptideProductTrioMockup.png as the hero banner image, with all products and original label content preserved. Match the live vial and capsule preview label styling to this reference, including YOUR LOGO HERE placeholder, framed logo region, outlined vial product band, filled-blue capsule product band, and orange detail accent. Preserve live uploads, logo proportions, color updates and reset, with a visual-only disclaimer and no fabricated dosage/purity claims.

## [x] Richer section colors and readable copy

Make the page more colorful and polished using exact blue #003F6A and orange #D8603D, coordinated section backgrounds and stronger color contrast. Increase paragraph font sizes for easier reading across marketing sections and the inquiry without introducing spacing problems, horizontal overflow or new pages. Keep FAQ removed and retain all secure submission logic.

### Confirmed palette refresh evidence

Exact #003F6A blue and #D8603D orange are applied to interface tokens, CTA backgrounds, section surfaces, form styling, team-page styling, metadata, preview defaults and reset. Original logo artwork retained. Supplied hero image rendered at original aspect with object-fit contain. Desktop1440, tablet768, mobile390 and small-mobile320 checks passed with no horizontal overflow or JavaScript errors. Hero body18/17/16px, marketing body16pxdesktop and15pxmobile, inquiry descriptions16px. Reference-style vial/capsule label preview, two-line YOUR LOGO HERE, uploaded-logo switching and cleanup, readable custom-color ink and reset passed. The old hero CSS-cascade conflict was fixed by scoping the branded hero. TypeScript, existing17server tests and production build passed. These are Preview changes; prior cancelled publication is not retried without a new publish request.

## [x] White text on orange buttons — October 29, 15:28

Use white text and inherited white icons, not black, on all orange buttons across the public page, guided inquiry, and team dashboard. Keep existing orange backgrounds, spacing, typography, button actions, and quiet/secondary button styles unchanged.

Verification: all three orange-button CSS definitions use #fff; icons inherit currentColor. TypeScript, production build and diff checks passed. Backgrounds and secondary/quiet button styles are unchanged.

## [x] Exact reference vial and plain-white logo area — October 29, 15:31

Use the newly supplied close-up vial screenshot as the live clinical-vial reference: match its broad gray cap, silver crimp, clear glass, white label and reflected glass base. Remove YOUR LOGO HERE and its placeholder outline from the live preview, leaving the logo area clean white until an uploaded logo is present. Preserve uploaded-logo proportions and live colors, retain a visual-only disclaimer, and keep the hero image unchanged.

Verification: focused desktop1440/mobile390 checks confirmed the new vial asset loaded at natural proportions, no live YOUR LOGO HERE placeholder or default frame, uploaded-logo placement/format switching/removal, custom colors and reset, no horizontal overflow or JavaScript errors, and unchanged hero. Only the exact temporary test upload was removed by its private capability; no inquiry was submitted.

## [x] Equal vial and capsule preview dimensions — October 29, 15:38

Make the live vial preview the same width and height as the capsule preview, with a shared 4:5 preview stage and identical card dimensions when switching formats. Fit the full vial reference without cropping or stretching. Keep uploaded logos and live label-color overlays aligned to the vial's actual image, and retain the plain-white default logo area.

Verification: desktop and mobile measured identical vial/capsule stage and frame dimensions (frame heights370.47pxdesktop and398.52pxmobile). The full vial retains its source aspect without clipping, and its uploaded logo/color overlays stay within the centered image scene. Blank default logo area, switching, reset and no-overflow checks passed.

## [x] Transparent vial background matching capsule preview — October 29, 15:40

Remove the live-vial photo's blue background so the vial sits on the same near-white background treatment as the capsule preview. Preserve the reference vial, blank logo area, equal preview dimensions and live logo/color behavior. Keep the hero and capsule product image unchanged.

Verification: native-alpha PNG/WebP confirmed transparent exterior, original858×1832 dimensions retained. Transparent vial asset loaded over the shared near-white gradient sampled from capsule-image edges. Desktop/mobile checks passed for equal frame dimensions, matching stage backgrounds, natural proportions, blank default logo area, uploaded-logo switching/cleanup, colors and reset, no overflow/errors. Hero/capsule images unchanged. TypeScript and production build passed.

## [x] Replacement hero image — October 29, 15:46

Replace the banner with the supplied PremiumBlueResearchSkincareCollection.png, preserving the full image and its original proportions. Keep current page styling and all live-preview assets and behavior unchanged.

Verification: supplied replacement is1672×941, re-encoded158886-byte WebP, confirmed200 image/webp from managed storage. Hero URL updated; original width/height and object-fit contain preserved. Live-preview assets, dimensions, controls and styles unchanged.

## [x] Catalog-interest option replacement — October 30

Replace the existing catalog-interest choices, rather than adding to them, with exactly: Reta; Tirz; Sema; KLOW; GLOW; Tesamorelin; TESAMORELIN/IPAMORELIN; CJC-1295 no DAC/IPAMORELIN; BPC-157; TB500; WOLVERINE; GHK-Cu; KPV; Epithalon; NAD+; SEMAX; SELANK; MOTS-C; Capsules; Nasals; Serums. Do not retain old labels or add a catch-all option. Retain searchable multi-select behavior, selected chips, optional validation, persisted submission values, review summary, and dashboard display.

Verification: exact ordered21-item shared catalog confirmed; focused browser check confirmed the picker shows only that list, CJC-1295 no DAC/IPAMORELIN and MOTS-C search/select as independent chips, and removed catch-all returns no match. TypeScript,17 server tests, production build and diff checks passed. The product picker remains optional and no inquiry was submitted during the focused check.

## [x] Landing-logo stability and mobile experience — October 30

Fix the logo so it does not glitch when visitors first land on the page. Verify the landing page and guided inquiry are optimized for mobile and that interactive controls work correctly, including the hero CTA, step navigation, catalog search/selection, package switching, color controls, logo upload/remove/reset, conditional fields, review/submit path, and responsive layout. Preserve the approved colors, banner, secure submission behavior, and existing form contents.

Verification: diagnosed the original unstyled static fallback rendering the1600×684 source logo at full size before React CSS loaded. Added a critical first-paint boot shell, asset preloads and intrinsic logo dimensions/aspect ratio. Desktop1440 first/final header98px and logo151×64.55px; mobile390 first/final header80px and logo116×49.58px. Focused desktop/mobile QA passed hero/header CTAs, inquiry jump, required step-one navigation, White-Label conditional flow, KLOW catalog search/selection, capsule/vial switching, primary color/reset, back navigation and no horizontal overflow. Reference-vial upload/remove/reset/equal-size checks, catalog check, TypeScript,17 server tests, production build, managed gateway assets/routes/health and diff check passed. No inquiry was submitted during landing QA. The existing mobile upload/conditional-submit regression was also run separately and passed; the exact test inquiry was deleted afterward, with zero matching private asset records remaining. The approved hero now loads from the app public asset path in both local and Preview gateways.

## [x] Preview runtime recovery — October 30

Restore the temporary Preview after it showed “Setting up your project.” The development listener had stopped because Vite’s watcher followed a sandbox filesystem symlink loop at `/run/udev/watch/1`. Configure the embedded Vite server to use polling, avoid following symlinks, and ignore dependency, build, Git, and debug-log directories. Verify the listener, health endpoint, route manifest, hero asset, stable Preview gateway, and browser-rendered landing page all recover. Note: Preview is temporary and can go offline when the Sandbox sleeps; the project has not been published because `auto_publish` is disabled.

## [ ] GitHub and Vercel production export — November 1

Export the current Peplogix Partner Landing Page as one downloadable, editable source-project ZIP without redesigning or modifying its approved desktop/mobile appearance. Include all source, images, components, styling, icons, typography, responsive behavior, forms, navigation, interactions, configurations, dependency manifests, Vercel deployment configuration, environment-variable template, and a README with exact GitHub/Vercel installation, build, environment, migration, and deployment steps. Preserve backend-backed inquiries and private uploads through an appropriate Vercel runtime adapter; never include secret values. Verify the production build, a local production-server smoke test, and the final archive contents before delivery.

## [x] GitHub + Vercel source export

- Preserve the existing React/Vite landing page, visual assets, responsive behavior, inquiry flow, dashboard, database schema, and server routes as editable source rather than a static screenshot.
- Add Vercel Express entrypoint, Vercel static build configuration, secret-free environment template, portable local assets, password-protected dashboard mode, and private S3-compatible direct-upload path that retains the existing 5 MB-per-file capability on Vercel.
- Verify TypeScript, backend tests, original Node build, Vercel static build, root serverless-style smoke routes, desktop/mobile visual regressions, live preview, and catalog interactions before packaging a secret-free ZIP.

## [ ] Vercel static-output recovery

- Fix the concrete Vercel `STATIC_BUILD_NO_OUT_DIR` failure by making `pnpm run build:vercel` generate root `dist/` and declaring that same directory in `vercel.json`, without changing the landing-page implementation or design.
- Verify the clean Vercel build produces `dist/index.html`, then sync a normal new commit to the managed source and `PeplogixMKTG/Partners.PeplogixV2` so Vercel receives the configuration update.

## [x] Full-entry team submission notifications — November 2

Send the full entry to the user's specified team recipient(s) through their Resend account after the inquiry is successfully saved. Include all submitted business/contact fields, partnership and product selections, conditional service answers, brand colors/instructions, notes, submission time/ID, and logo/additional-file metadata with authenticated dashboard access. Preserve the approved landing page exactly. Keep credentials server-only and out of Git; use the applicant's address as Reply-To, not From. Save durable notification state, prevent duplicate alerts on repeated form requests, preserve inquiries if email delivery fails, and support authenticated retry/status inspection. Verify rendering, escaped input, duplicate protection, provider failures, Vercel build, real sender verification, deployment configuration/migration, and an authorized test delivery before claiming live operation.

Implementation progress: server-only renderer covers every current inquiry schema field (typed exhaustive map plus coverage tests), accuracy confirmation, UTC timestamp, ID, contact Reply-To and private file metadata. Atomic outbox enqueue, immutable payload, leased claims, fixed provider idempotency, bounded initial send, safe admin status/retry and a bounded token-authenticated scheduler worker are implemented. Both reviewer findings were addressed: an actual drain execution path exists (not scheduled yet), and admin retries can recover definite key/domain rejections within the safe window. TypeScript and all 164 isolated tests passed, using mocked mail/database operations; landing client source is unchanged. No real email has been sent, no database migration has been applied, no API key obtained, no recurring scheduler provisioned, and no live Vercel configuration or deployment claimed. Awaiting the user's recipient(s), owned sender domain/DNS provider, and live URL before activation and end-to-end receipt verification.

Activation progress — November 2, 12:39: User saved RESEND_API_KEY in the existing Vercel Production environment (verified by name/scope only; secret was not read). Approved temporary sender is Peplogix Partners <onboarding@resend.dev>, sole recipient gpernudi@peplogix.com, origin https://partners-peplogix-v2.vercel.app. No domain/DNS work is authorized or needed for this account-email-only default-sender test. Existing Vercel deployment still lacks DATABASE_URL. Explicit api/index.ts adapter and API rewrites pass 171 tests and Vercel dist build; no client files differ. Pending secure database provisioning/migration and real live-email receipt verification; do not mark the overall notification outcome complete.

November 2, 12:41: Vercel confirmed all four email settings saved in Production: RESEND_API_KEY (user-entered protected value, not read), PARTNER_NOTIFICATION_FROM, PARTNER_NOTIFICATION_TO, APP_BASE_URL. No DNS/domain changes. Notification source and explicit Vercel function pass 171 tests; built CSS/JS hashes remain identical to the prior landing build. The Vercel project still has no DATABASE_URL and no backend data store configured; live receipt cannot be claimed until that connection and the additive migration are completed.

Live activation — November 2, 12:46: Secure Vercel authorization completed. DATABASE_URL was transferred via stdin into Production secret storage without displaying its value, and the additive notification migration was applied successfully to the existing database. Live function logs exposed an extensionless ESM import error, now being corrected through a prebundled backend and explicit JavaScript entry; no client changes. Live test email is pending successful function recovery.

Completed live activation — November 2, 12:52: Synced notification/API recovery to existing V2 main at e9ede92; redeployment GVTQfvYW2Re6PnfrBSF1DABHyLqdm completed and aliased to the existing live Vercel origin. Native Node22 API health and runtime password-mode config succeed. Applied additive outbox migration against the same existing MySQL database, securely configured Production database/session/admin/Resend values, and verified owner login/private file retrieval. Authorized full-entry test inquiry 2a6e7c48-cc6d-4fbf-b1d3-5539bdb2339a preserved all34 submitted fields and2 private files. Exactly one email attempt was accepted; Resend ID01a19d99-f95a-76ef-a2cd-d74e27ea0996 is marked Delivered at12:51PM. Repeating the exact request returned the same inquiry and did not send a second email. Email payload contains every section and file metadata, sole authorized recipient and applicant Reply-To. Test record is clearly labeled and retained for owner review. Landing client tree and built CSS/JS hashes are unchanged. Resend default sender remains restricted to the account email; no owned-domain/DNS changes or periodic retry schedule were installed. Local private owner access instructions are outside Git.

## [x] Exclusive owner dashboard access — November 2, 12:53

Only gpernudi@peplogix.com may sign in to the Vercel dashboard and read protected inquiries/files. Use the password supplied by the user, stored only as a protected Production secret, not in code or documentation. Invalidate old passwords and pre-change sessions. Reject other emails even when they supply the correct password, reject signed non-owner sessions, preserve the public landing/form/email experience, and verify the live login and access rules after deployment.

Verification November 2,13:00: V2 commit3433a39 deployed successfully as dpl_APryvKucb6QmziDqvC1tJqSSuK3W.180 isolated tests, TypeScript, Vercel build and Node22 health passed with unchanged frontend hashes. User-specified password exists only in protected Production settings and in-memory verification input; session signing key rotated. Authenticated Vercel requests to the actual immutable deployment verified: correct owner/new password succeeds and reads protected inquiries; a different email with the correct password is denied; old generated password denied; a genuine pre-change session from the previous immutable deployment is denied; unauthenticated reads denied. Old generated credential removed from the earlier private local instructions. No email sent or inquiry created. Concurrent existing domain configuration now redirects the Vercel alias to partners.peplogix.com, which fails DNS resolution from the sandbox; domain settings were inspected only, not changed.

## [x] Two-recipient notification update — activated November 3 after sender verification

Send new full-entry submission notifications to exactly gpernudi@peplogix.com and gelsey@marketingdna.com. Diagnose the user's latest test submission, preserving the saved entry and private files. Check current Resend sender verification before enabling a recipient list that may be blocked by the default sender. Correct supported production configuration and safely retry the missing notification where delivery state proves it was not sent; preserve duplicate protection, the approved website, and owner-only dashboard access. Do not change DNS/domain settings without authorization. Report actual delivery results and any remaining provider limitation accurately.

Diagnosis16:55: Live custom-domain API health200; existing Vercel deployment is Ready. Latest saved inquiry17fba737-50a8-4994-aea6-d7624323a0d5 (company test4, submitted22:49:28UTC) has a durable outbox with both requested recipients, one attempt, no provider ID, statusneeds_review, errorresend_http_403, FromPeplogix Partners <onboarding@resend.dev>. The earlier single-recipient authorized test remains sent. Resend Domains in the current peplogix account shows No domains yet. Both addresses are already configured; switching the recipient variable again would not resolve the provider restriction. Saved entry/private files unchanged; no retries or settings changes were made. Await sender-domain verification authorization before enabling delivery to both recipients.

## [x] Restore gpernudi-only notifications and recover test4 — November 2,16:58

User chose single-recipient restoration. PARTNER_NOTIFICATION_TO restored to gpernudi@peplogix.com in protected Production settings, keeping the default sender and all other secrets unchanged. Current source redeployed successfully as dpl_5XnzvmGe4ypmxXGgBfyUAqgDzytu, aliased to the working custom domain. No source/client/credential/domain/DNS changes. Corrected only To on the exact definitely rejected test4 outbox17fba737-50a8-4994-aea6-d7624323a0d5, conditioned on needs_review,403,attempt1,no provider ID and no active claim. Preserved inquiry, original submission time, full rendered content and idempotency identity; content hash excluding To remained208f0747bd6ec2a8c2c27e950ec54f5eb1746a22fa1f3fae1b1905aa639fde97. Authenticated owner retry used the existing API, producing attempt2 and Resend ID01a19e7f-08a0-7ef3-b205-3e596fd873e4. Resend shows Delivered at17:01 local time, sole To gpernudi@peplogix.com, subject New Peplogix Partnership Inquiry — test4. Repeated retry returned the same provider ID and unchanged attempt count. No duplicate inquiry or new test was created. Public health200. Gelsey remains excluded until sending-domain verification is authorized and completed.

## [x] Verified-domain two-recipient notifications — November 3

Use the sending domain the user has now verified in Resend. Activate full-entry notifications for gpernudi@peplogix.com and gelsey@marketingdna.com on the live submission app; both receive the same complete entry. Change only necessary sender/recipient Production settings and redeploy the existing source. Preserve exact website design, owner-only dashboard, credentials and DNS. Confirm the actual verified sender, configuration/deployment and any new test-delivery evidence without claiming receipt before verification. Do not duplicate a previously sent entry.

Activation November3,10:15: User-provisioned peplogix.com shows Verified in Resend. Updated only protected Production PARTNER_NOTIFICATION_FROM=Peplogix Partners <notifications@peplogix.com> and PARTNER_NOTIFICATION_TO=gpernudi@peplogix.com,gelsey@marketingdna.com. Both Vercel updates succeeded, followed by redeployment dpl_7J64Dwn9UcJKX5M5neaoMRez9z44 (partners-peplogix-v2-ch0v3ys4x-peplogix.vercel.app), Ready and aliased to https://partners.peplogix.com. No application/client changes, DNS modifications, API-key changes, credential/access changes or old-message resends. Both recipients are supported via the existing multiple-To list. Await the new user-submitted test to confirm actual Resend delivery to both; no unsolicited test was created.

## [x] Five-recipient notification replacement — November 3,10:26

Replace existing notification recipients with only partner@peplogix.com, mgt@peplogix.com, wnagi@peplogix.com, sbuculesei@peplogix.com and gpernudi@peplogix.com. User explicitly confirmed .com for the management address rather than .xom. Remove gelsey@marketingdna.com from future notifications. Keep the verified notifications@peplogix.com sender and all website/dashboard/credential/DNS settings unchanged. Save Production recipient configuration, redeploy existing source and verify readiness; do not resend historical entries or claim delivery before a new submission.

November3,10:27 verification: PARTNER_NOTIFICATION_TO replaced successfully in protected Production with exactly partner@peplogix.com,mgt@peplogix.com,wnagi@peplogix.com,sbuculesei@peplogix.com,gpernudi@peplogix.com. Existing source redeployed as dpl_91GDPjhV5w4XUKy2E3U3yKDRRbwM, Ready and aliased to https://partners.peplogix.com. Previous Gelsey notification address removed. Sender, domain/DNS, website/backend code and administrator access/credentials unchanged. No historical email replay or new test submission created; future-mailbox delivery not yet tested.

## [x] Seven partnership opportunities in one column — November 10

Replace the old Step2 cards with only the following seven options, in this order, retaining multi-select and all existing visual identity and unrelated page sections. Arrange top-to-bottom in one column on desktop and mobile. Keep full descriptions readable, with no truncation:

1. Turnkey Business – Get a custom-branded e-commerce website with a full storefront and built-in merchant processing. Our inventory and 3PL logistics support your brand behind the scenes. Add our optional marketing package, led by a marketing professional with 15 years of experience, to leverage your existing network and drive revenue compliantly.
2. Product Supply and 3PL Fulfilment Only – Already have a website but need products? We can supply your products and handle all of your fulfillment. Our inventory and 3PL logistics team stores, packs, and ships every order on your behalf, so you can focus on growing your brand.
3. Wholesale and Contract Manufacturing – Stock your clinic, spa, or retail shelves with our full product line at tiered wholesale pricing. Ready to launch your own formulas? Our contract manufacturing service takes your product from formulation to finished, labeled goods, with private-label packaging and quality-controlled production, all at scale.
4. 503a FDA Approved Products and Medical Supplies – Give your patients access to compounded medications prepared by licensed 503A pharmacy partners and dispensed under valid, patient-specific prescriptions. Pair them with the medical supplies your practice relies on, such as syringes, alcohol prep pads, and other clinical essentials, all ordered through one convenient portal and shipped directly to you or your patients. Title factual correction pending user response; proposed “503A Compounded Medications and Medical Supplies.”
5. Education and Training – Learn the business from people who have built it. Our education hub includes quick-start guides, video training, and live onboarding sessions covering product knowledge, dosing protocols for licensed providers, compliant marketing, and sales best practices. Ongoing courses and certifications keep you and your team current as the industry evolves.
6. Payment Processing – Get reliable merchant processing built for our industry. We connect you with processing partners who understand your products, so you can accept cards and online payments with fewer holds, freezes, and declined applications.
7. Marketing and Compliance Resources – Grow without the guesswork. Get ready-to-use marketing assets, social media templates, email campaigns, and compliance guidance that helps your messaging stay within FDA and FTC guidelines.

Keep values selected across Back/Continue/edit, allow multiple new opportunities, and keep checkbox keyboard/focus accessible. Connect relevant existing conditional storefront, fulfillment, wholesale and branding questions to the new options. General advisory/medical/processing selections should not introduce unrelated mandatory requirements. Submission server validates new option names, review and team full-entry emails include them, old saved inquiries and already-open legacy sessions remain readable/valid without showing the old options in the new picker. Preserve current catalog, uploads, mockups, notification sender/recipients and owner-only dashboard access. Verify builds and isolated tests without sending production emails or modifying existing submissions. Sync the existing GitHub V2 repository and confirm Vercel deployment after the medical-title clarification.

Medical wording resolved: user said Keep the original title. Original medical title retained with its complete description. A directly visible clarification states “503A compounded medications are not FDA-approved. FDA approval applies only to products that have individually received FDA approval, not to compounded preparations.”

November10 validation: All seven supplied titles and full descriptions matched exactly in a read-only browser flow on desktop1440, tablet768 and mobile375; cards share one vertical column with no horizontal overflow. Multi-select, generic-only review skip, relevant conditional validation, Back/Continue state, vial/capsule switches, full summary and intercepted (non-persisted) submission passed. Safe landing/logo and catalog regressions passed. 250 isolated backend tests passed, including 70 new branch/legacy/schema/email tests. Original Node build and Vercel dist/bundled-function build succeeded. No production inquiry, upload or email created, and no database/auth/notification environment changes. GitHub/Vercel deployment pending.

Deployment November10,16:56: Tested source checkpoint365cf49 saved to managed main; exact same project tree synced through a normal fast-forward PeplogixMKTG-authored commit c58b6bbbd4d083e3ecf41ed0132f2e864bd88b71 to the existing Partners.PeplogixV2 main, preserving rewritten history. Existing GitHub-triggered Vercel production deployment dpl_CUnuH8H5dTCrZX7mHywgbLjF7csp (partners-peplogix-v2-ovk35rw10-peplogix.vercel.app) reached READY. No redundant redeploy, environment changes, DNS changes or live-email tests were made. Seven complete supplied descriptions, original medical title plus immediate factual clarification, single-column cards, new conditional paths and old-session compatibility delivered. Existing five-recipient notifications, dashboard ownership and all unrelated landing elements preserved.

## [ ] Approved 503A title and clarification removal — November10,17:30

Change only the fourth visible partnership title to “503A Compounded Medications and Medical Supplies” and remove the additional clarification beneath it. Keep its supplied description byte-for-byte unchanged. Retain all other choices, order, icons, single-column layout, form logic, assets, dashboard access and notification configuration. Accept the previously visible medical title only as a hidden historical/in-flight value so submissions from already-open tabs are not broken. Update the matching icon key and automated assertions, build and validate without creating submissions/emails, and fast-forward the existing V2 repository for its connected Vercel production deployment.

Local verification: approved new title present, clarification data/markup/style removed, all seven complete descriptions byte-for-byte unchanged. TypeScript, isolated backend tests, original production build and Vercel build succeeded. Unrelated page sections, images, dashboard and notification settings untouched. Deployment pending.

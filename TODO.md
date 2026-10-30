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

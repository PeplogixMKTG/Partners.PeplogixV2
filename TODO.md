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

import { DEFAULT_BRAND_COLORS } from "./brand";
import { z } from "zod";

export const businessTypeOptions = [
  "Medical / Healthcare Business",
  "Wellness / Aesthetics Business",
  "Ecommerce Brand",
  "Research Supply Business",
  "Distributor / Wholesaler",
  "Other",
] as const;

export const partnershipOptions = [
  {
    value: "Turnkey Business",
    description:
      "Get a custom-branded e-commerce website with a full storefront and built-in merchant processing. Our inventory and 3PL logistics support your brand behind the scenes. Add our optional marketing package, led by a marketing professional with 15 years of experience, to leverage your existing network and drive revenue compliantly.",
  },
  {
    value: "Product Supply and 3PL Fulfilment Only",
    description:
      "Already have a website but need products? We can supply your products and handle all of your fulfillment. Our inventory and 3PL logistics team stores, packs, and ships every order on your behalf, so you can focus on growing your brand.",
  },
  {
    value: "Wholesale and Contract Manufacturing",
    description:
      "Stock your clinic, spa, or retail shelves with our full product line at tiered wholesale pricing. Ready to launch your own formulas? Our contract manufacturing service takes your product from formulation to finished, labeled goods, with private-label packaging and quality-controlled production, all at scale.",
  },
  {
    value: "503A Compounded Medications and Medical Supplies",
    description:
      "Give your patients access to compounded medications prepared by licensed 503A pharmacy partners and dispensed under valid, patient-specific prescriptions. Pair them with the medical supplies your practice relies on, such as syringes, alcohol prep pads, and other clinical essentials, all ordered through one convenient portal and shipped directly to you or your patients.",
  },
  {
    value: "Education and Training",
    description:
      "Learn the business from people who have built it. Our education hub includes quick-start guides, video training, and live onboarding sessions covering product knowledge, dosing protocols for licensed providers, compliant marketing, and sales best practices. Ongoing courses and certifications keep you and your team current as the industry evolves.",
  },
  {
    value: "Payment Processing",
    description:
      "Get reliable merchant processing built for our industry. We connect you with processing partners who understand your products, so you can accept cards and online payments with fewer holds, freezes, and declined applications.",
  },
  {
    value: "Marketing and Compliance Resources",
    description:
      "Grow without the guesswork. Get ready-to-use marketing assets, social media templates, email campaigns, and compliance guidance that helps your messaging stay within FDA and FTC guidelines.",
  },
] as const;

// Kept out of the visible picker. Accept older already-open form sessions and
// historical inquiries without changing their meaning during deployment.
export const legacyPartnershipValues = [
  "Wholesale Supply",
  "White-Label Products",
  "Custom-Branded Storefront",
  "Dropshipping Fulfillment",
  "3PL Warehousing & Fulfillment",
  "Wholesale + Custom Storefront",
  "Other Partnership Opportunity",
  "503a FDA Approved Products and Medical Supplies",
] as const;

const acceptedPartnershipValues = [
  ...partnershipOptions.map(option => option.value),
  ...legacyPartnershipValues,
] as const;

export const productOptions = [
  "Reta",
  "Tirz",
  "Sema",
  "KLOW",
  "GLOW",
  "Tesamorelin",
  "TESAMORELIN/IPAMORELIN",
  "CJC-1295 no DAC/IPAMORELIN",
  "BPC-157",
  "TB500",
  "WOLVERINE",
  "GHK-Cu",
  "KPV",
  "Epithalon",
  "NAD+",
  "SEMAX",
  "SELANK",
  "MOTS-C",
  "Capsules",
  "Nasals",
  "Serums",
] as const;

export const monthlyVolumeOptions = [
  "Just Getting Started",
  "Under 100 Orders",
  "100–500 Orders",
  "500–1,000 Orders",
  "1,000+ Orders",
  "Not Sure Yet",
] as const;

export const storefrontTypeOptions = [
  "A fully custom ecommerce website",
  "A branded storefront using an existing platform",
  "A custom-branded product catalog",
  "I am not sure yet",
] as const;

export const domainOptions = ["Yes", "No", "I need assistance"] as const;
export const migrationOptions = ["Yes", "No", "Not Sure"] as const;

export const storefrontFeatureOptions = [
  "Custom Branding",
  "Product Catalog",
  "Ecommerce Checkout",
  "Customer Accounts",
  "Order Management",
  "Subscription Capabilities",
  "Inventory Management",
  "Shipping & Fulfillment Integration",
  "Other",
] as const;

export const dropshipModeOptions = [
  "Direct-to-customer fulfillment",
  "Fulfillment under my own brand",
  "White-label packaging",
  "I am not sure yet",
] as const;

export const ecommerceOptions = [
  "Yes",
  "No",
  "I am planning to build one",
] as const;
export const platformOptions = [
  "Shopify",
  "WooCommerce",
  "WordPress",
  "Custom Platform",
  "Other",
] as const;

export const fulfillmentServiceOptions = [
  "Inventory Storage",
  "Order Processing",
  "Pick & Pack",
  "Direct-to-Customer Shipping",
  "White-Label Packaging",
  "Inventory Management",
  "Returns Processing",
  "Other",
] as const;

export const ownInventoryOptions = ["Yes", "No", "Not Sure"] as const;

export const purchaseModeOptions = [
  "Bulk Wholesale Orders",
  "Ongoing Recurring Orders",
  "Wholesale Supply for My Own Storefront",
  "Wholesale Supply for an Existing Business",
  "Not Sure Yet",
] as const;

export const initialSizeOptions = [
  "Just Exploring",
  "Small Initial Order",
  "Medium Initial Order",
  "Large Initial Order",
  "Not Sure Yet",
] as const;

export type WebsiteChoice = "" | "Yes" | "No";

export interface PartnerFormData {
  company: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hasWebsite: WebsiteChoice;
  website: string;
  businessTypes: string[];
  businessOther: string;
  partnerships: string[];
  partnershipOther: string;
  products: string[];
  monthlyVolume: string;
  needs: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  colorsNotFinal: boolean;
  brandingInstructions: string;
  storefrontType: string;
  ownsDomain: string;
  domain: string;
  migration: string;
  migrationUrl: string;
  features: string[];
  featuresOther: string;
  dropshipMode: string;
  ecommerce: string;
  platform: string;
  fulfillmentServices: string[];
  fulfillmentOther: string;
  ownInventory: string;
  purchaseMode: string;
  initialSize: string;
}

export const createEmptyPartnerForm = (): PartnerFormData => ({
  company: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  hasWebsite: "",
  website: "",
  businessTypes: [],
  businessOther: "",
  partnerships: [],
  partnershipOther: "",
  products: [],
  monthlyVolume: "",
  needs: "",
  ...DEFAULT_BRAND_COLORS,
  colorsNotFinal: false,
  brandingInstructions: "",
  storefrontType: "",
  ownsDomain: "",
  domain: "",
  migration: "",
  migrationUrl: "",
  features: [],
  featuresOther: "",
  dropshipMode: "",
  ecommerce: "",
  platform: "",
  fulfillmentServices: [],
  fulfillmentOther: "",
  ownInventory: "",
  purchaseMode: "",
  initialSize: "",
});

export const hasPartnership = (
  data: Pick<PartnerFormData, "partnerships">,
  partnership: string
) => data.partnerships.includes(partnership);

export const needsStorefront = (data: Pick<PartnerFormData, "partnerships">) =>
  hasPartnership(data, "Turnkey Business") ||
  hasPartnership(data, "Custom-Branded Storefront") ||
  hasPartnership(data, "Wholesale + Custom Storefront");

export const needsDropship = (data: Pick<PartnerFormData, "partnerships">) =>
  hasPartnership(data, "Product Supply and 3PL Fulfilment Only") ||
  hasPartnership(data, "Dropshipping Fulfillment");

export const needsFulfillment = (data: Pick<PartnerFormData, "partnerships">) =>
  hasPartnership(data, "Turnkey Business") ||
  hasPartnership(data, "Product Supply and 3PL Fulfilment Only") ||
  hasPartnership(data, "3PL Warehousing & Fulfillment");

export const needsWholesale = (data: Pick<PartnerFormData, "partnerships">) =>
  hasPartnership(data, "Wholesale and Contract Manufacturing") ||
  hasPartnership(data, "Wholesale Supply") ||
  hasPartnership(data, "Wholesale + Custom Storefront");

export const needsBrandCustomization = (
  data: Pick<PartnerFormData, "partnerships" | "dropshipMode">
) =>
  hasPartnership(data, "Wholesale and Contract Manufacturing") ||
  hasPartnership(data, "White-Label Products") ||
  needsStorefront(data) ||
  (needsDropship(data) &&
    (data.dropshipMode === "Fulfillment under my own brand" ||
      data.dropshipMode === "White-label packaging"));

/**
 * Creates the minimum meaningful inquiry payload. Values from services that were not
 * selected remain in client state for back-navigation but are deliberately not sent.
 */
export const toPartnerSubmissionData = (
  data: PartnerFormData
): Partial<PartnerFormData> => {
  const payload: Partial<PartnerFormData> = {
    company: data.company.trim(),
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    hasWebsite: data.hasWebsite,
    businessTypes: data.businessTypes,
    partnerships: data.partnerships,
    products: data.products,
  };

  if (data.hasWebsite === "Yes") payload.website = data.website.trim();
  if (data.businessTypes.includes("Other"))
    payload.businessOther = data.businessOther.trim();
  if (hasPartnership(data, "Other Partnership Opportunity")) {
    payload.partnershipOther = data.partnershipOther.trim();
  }
  if (data.monthlyVolume) payload.monthlyVolume = data.monthlyVolume;
  if (data.needs.trim()) payload.needs = data.needs.trim();

  if (needsBrandCustomization(data)) {
    payload.colorsNotFinal = data.colorsNotFinal;
    if (!data.colorsNotFinal) {
      payload.primaryColor = data.primaryColor;
      payload.secondaryColor = data.secondaryColor;
      payload.accentColor = data.accentColor;
    }
    if (data.brandingInstructions.trim())
      payload.brandingInstructions = data.brandingInstructions.trim();
  }

  if (needsStorefront(data)) {
    payload.storefrontType = data.storefrontType;
    payload.ownsDomain = data.ownsDomain;
    if (data.ownsDomain === "Yes") payload.domain = data.domain.trim();
    payload.migration = data.migration;
    if (data.migration === "Yes")
      payload.migrationUrl = data.migrationUrl.trim();
    payload.features = data.features;
    if (data.features.includes("Other"))
      payload.featuresOther = data.featuresOther.trim();
  }

  if (needsDropship(data)) {
    payload.dropshipMode = data.dropshipMode;
    payload.ecommerce = data.ecommerce;
    if (data.ecommerce === "Yes") payload.platform = data.platform;
  }

  if (needsFulfillment(data)) {
    payload.fulfillmentServices = data.fulfillmentServices;
    if (data.fulfillmentServices.includes("Other")) {
      payload.fulfillmentOther = data.fulfillmentOther.trim();
    }
    payload.ownInventory = data.ownInventory;
  }

  if (needsWholesale(data)) {
    payload.purchaseMode = data.purchaseMode;
    payload.initialSize = data.initialSize;
  }

  return payload;
};

const optionalText = (maximum: number) =>
  z.string().trim().max(maximum).optional();
const requiredText = (label: string, maximum: number) =>
  z.string().trim().min(1, `${label} is required`).max(maximum);
const uniqueStrings = (maximumItems: number, maximumItemLength: number) =>
  z
    .array(z.string().trim().min(1).max(maximumItemLength))
    .max(maximumItems)
    .refine(
      values => new Set(values).size === values.length,
      "Selections must not contain duplicates"
    )
    .optional();

function isHttpUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isDomain(value: string | undefined): boolean {
  if (!value || value.length > 253 || /[/:?#\s]/.test(value)) return false;
  const labels = value.split(".");
  return (
    labels.length >= 2 &&
    labels.every(label =>
      /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label)
    )
  );
}

function addRequiredIssue(
  ctx: z.RefinementCtx,
  path: string,
  message: string
): void {
  ctx.addIssue({ code: "custom", path: [path], message });
}

/**
 * Server-side contract for the deliberately flat partner inquiry form. This is kept
 * separate from the UI's `PartnerFormData`: omitted conditional values are allowed,
 * while selected service paths are validated below.
 */
export const partnerInquiryDataSchema = z
  .object({
    company: requiredText("Company", 200),
    firstName: requiredText("First name", 100),
    lastName: requiredText("Last name", 100),
    email: z
      .string()
      .trim()
      .email("A valid email address is required")
      .max(320),
    phone: z
      .string()
      .trim()
      .min(7, "A valid phone number is required")
      .max(32)
      .refine(
        value =>
          /^[+0-9().\-\s]+$/.test(value) &&
          value.replace(/\D/g, "").length >= 7 &&
          value.replace(/\D/g, "").length <= 15,
        "A valid phone number is required"
      ),
    hasWebsite: z.enum(["Yes", "No"]),
    website: optionalText(2048),
    businessTypes: z
      .array(z.enum(businessTypeOptions))
      .min(1, "Select at least one business type")
      .max(businessTypeOptions.length)
      .refine(
        values => new Set(values).size === values.length,
        "Business types must not contain duplicates"
      ),
    businessOther: optionalText(500),
    partnerships: z
      .array(z.enum(acceptedPartnershipValues))
      .min(1, "Select at least one partnership option")
      .max(acceptedPartnershipValues.length)
      .refine(
        values => new Set(values).size === values.length,
        "Partnerships must not contain duplicates"
      ),
    partnershipOther: optionalText(2000),
    products: uniqueStrings(30, 200),
    monthlyVolume: optionalText(100),
    needs: optionalText(10000),
    primaryColor: optionalText(16).refine(
      value => value === undefined || /^#[0-9a-fA-F]{6}$/.test(value),
      "Color values must use #RRGGBB format"
    ),
    secondaryColor: optionalText(16).refine(
      value => value === undefined || /^#[0-9a-fA-F]{6}$/.test(value),
      "Color values must use #RRGGBB format"
    ),
    accentColor: optionalText(16).refine(
      value => value === undefined || /^#[0-9a-fA-F]{6}$/.test(value),
      "Color values must use #RRGGBB format"
    ),
    colorsNotFinal: z.boolean().optional().default(false),
    brandingInstructions: optionalText(10000),
    storefrontType: z.enum(storefrontTypeOptions).optional(),
    ownsDomain: z.enum(domainOptions).optional(),
    domain: optionalText(253),
    migration: z.enum(migrationOptions).optional(),
    migrationUrl: optionalText(2048),
    features: z
      .array(z.enum(storefrontFeatureOptions))
      .max(storefrontFeatureOptions.length)
      .refine(
        values => new Set(values).size === values.length,
        "Features must not contain duplicates"
      )
      .optional(),
    featuresOther: optionalText(1000),
    dropshipMode: z.enum(dropshipModeOptions).optional(),
    ecommerce: z.enum(ecommerceOptions).optional(),
    platform: z.enum(platformOptions).optional(),
    fulfillmentServices: z
      .array(z.enum(fulfillmentServiceOptions))
      .max(fulfillmentServiceOptions.length)
      .refine(
        values => new Set(values).size === values.length,
        "Fulfillment services must not contain duplicates"
      )
      .optional(),
    fulfillmentOther: optionalText(1000),
    ownInventory: z.enum(ownInventoryOptions).optional(),
    purchaseMode: z.enum(purchaseModeOptions).optional(),
    initialSize: z.enum(initialSizeOptions).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.hasWebsite === "Yes" && !isHttpUrl(data.website)) {
      addRequiredIssue(
        ctx,
        "website",
        "A valid existing website URL is required"
      );
    }
    if (data.businessTypes.includes("Other") && !data.businessOther) {
      addRequiredIssue(
        ctx,
        "businessOther",
        "Describe the other business type"
      );
    }
    if (
      data.partnerships.includes("Other Partnership Opportunity") &&
      !data.partnershipOther
    ) {
      addRequiredIssue(
        ctx,
        "partnershipOther",
        "Describe the partnership opportunity"
      );
    }

    if (needsStorefront(data)) {
      if (!data.storefrontType)
        addRequiredIssue(ctx, "storefrontType", "Select a storefront type");
      if (!data.ownsDomain)
        addRequiredIssue(ctx, "ownsDomain", "Select whether you own a domain");
      if (data.ownsDomain === "Yes" && !isDomain(data.domain)) {
        addRequiredIssue(
          ctx,
          "domain",
          "Enter a valid domain name without a protocol"
        );
      }
      if (!data.migration)
        addRequiredIssue(
          ctx,
          "migration",
          "Select whether a migration is needed"
        );
      if (data.migration === "Yes" && !isHttpUrl(data.migrationUrl)) {
        addRequiredIssue(
          ctx,
          "migrationUrl",
          "Enter a valid website URL to migrate"
        );
      }
      if (data.features?.includes("Other") && !data.featuresOther) {
        addRequiredIssue(
          ctx,
          "featuresOther",
          "Describe the other storefront feature"
        );
      }
    }

    if (needsDropship(data)) {
      if (!data.dropshipMode)
        addRequiredIssue(ctx, "dropshipMode", "Select a fulfillment approach");
      if (!data.ecommerce)
        addRequiredIssue(ctx, "ecommerce", "Select your ecommerce status");
      if (data.ecommerce === "Yes" && !data.platform) {
        addRequiredIssue(ctx, "platform", "Select your ecommerce platform");
      }
    }

    if (needsFulfillment(data)) {
      if (!data.fulfillmentServices?.length) {
        addRequiredIssue(
          ctx,
          "fulfillmentServices",
          "Select at least one fulfillment service"
        );
      }
      if (
        data.fulfillmentServices?.includes("Other") &&
        !data.fulfillmentOther
      ) {
        addRequiredIssue(
          ctx,
          "fulfillmentOther",
          "Describe the other fulfillment service"
        );
      }
      if (!data.ownInventory)
        addRequiredIssue(
          ctx,
          "ownInventory",
          "Select whether you will supply inventory"
        );
    }

    if (needsWholesale(data)) {
      if (!data.purchaseMode)
        addRequiredIssue(ctx, "purchaseMode", "Select a purchase approach");
      if (!data.initialSize)
        addRequiredIssue(ctx, "initialSize", "Select an initial order size");
    }
  });

export type PartnerInquiryData = z.infer<typeof partnerInquiryDataSchema>;

export const partnerSubmissionSchema = z
  .object({
    requestId: z.string().uuid("requestId must be a UUID"),
    data: partnerInquiryDataSchema,
    logoId: z.string().min(43).max(96).nullable(),
    assetIds: z.array(z.string().min(43).max(96)).max(10),
    confirmed: z.literal(true, {
      error: "You must confirm that the submitted information is accurate",
    }),
  })
  .strict()
  .superRefine((value, ctx) => {
    const ids = value.logoId
      ? [value.logoId, ...value.assetIds]
      : value.assetIds;
    if (ids.length > 10) {
      ctx.addIssue({
        code: "custom",
        path: ["assetIds"],
        message: "A maximum of 10 files may be attached",
      });
    }
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: "custom",
        path: ["assetIds"],
        message: "Each uploaded file can only be attached once",
      });
    }
  });

export type PartnerSubmission = z.infer<typeof partnerSubmissionSchema>;

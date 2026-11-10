import { describe, expect, it } from "vitest";
import {
  createEmptyPartnerForm,
  needsBrandCustomization,
  needsDropship,
  needsFulfillment,
  needsStorefront,
  needsWholesale,
  partnerInquiryDataSchema,
  partnerSubmissionSchema,
  partnershipOptions,
  toPartnerSubmissionData,
  type PartnerFormData,
} from "../shared/partner";
import { renderPartnerEmail } from "./partnerEmailTemplate";

const turnkey = "Turnkey Business";
const supply = "Product Supply and 3PL Fulfilment Only";
const wholesale = "Wholesale and Contract Manufacturing";
// The medical service title is pending; always use the configured fourth choice.
const medical = partnershipOptions[3].value;
const nonConditionalServices = [
  medical,
  "Education and Training",
  "Payment Processing",
  "Marketing and Compliance Resources",
];
const visibleServices = partnershipOptions.map(option => option.value);
const legacyServices = [
  "Wholesale Supply",
  "White-Label Products",
  "Custom-Branded Storefront",
  "Dropshipping Fulfillment",
  "3PL Warehousing & Fulfillment",
  "Wholesale + Custom Storefront",
  "Other Partnership Opportunity",
];

const brandKeys = [
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "colorsNotFinal",
  "brandingInstructions",
] as const;
const storefrontKeys = [
  "storefrontType",
  "ownsDomain",
  "domain",
  "migration",
  "migrationUrl",
  "features",
  "featuresOther",
] as const;
const dropshipKeys = ["dropshipMode", "ecommerce", "platform"] as const;
const fulfillmentKeys = [
  "fulfillmentServices",
  "fulfillmentOther",
  "ownInventory",
] as const;
const wholesaleKeys = ["purchaseMode", "initialSize"] as const;
const conditionalKeys = [
  ...brandKeys,
  ...storefrontKeys,
  ...dropshipKeys,
  ...fulfillmentKeys,
  ...wholesaleKeys,
];

function baseInquiry(partnerships: string[]) {
  return {
    company: "Clearly Labeled Test Company",
    firstName: "Test",
    lastName: "Partner",
    email: "test.partner@example.com",
    phone: "+1 212 555 0199",
    hasWebsite: "No" as const,
    businessTypes: ["Ecommerce Brand"],
    partnerships,
  };
}

function fullForm(partnerships: string[]): PartnerFormData {
  return {
    ...createEmptyPartnerForm(),
    ...baseInquiry(partnerships),
    hasWebsite: "Yes",
    website: "https://test-company.example.com",
    businessTypes: ["Ecommerce Brand", "Other"],
    businessOther: "Independent research supplier",
    partnershipOther: "A legacy regional distribution collaboration",
    products: ["Reta", "BPC-157"],
    monthlyVolume: "100–500 Orders",
    needs: "Retain the complete business needs.\nRetain this second line.",
    primaryColor: "#123456",
    secondaryColor: "#456789",
    accentColor: "#789ABC",
    brandingInstructions:
      "Retain the full branding instructions.\nSecond line.",
    storefrontType: "A fully custom ecommerce website",
    ownsDomain: "Yes",
    domain: "test-company.example.com",
    migration: "Yes",
    migrationUrl: "https://legacy.test-company.example.com/catalog",
    features: ["Custom Branding", "Ecommerce Checkout", "Other"],
    featuresOther: "A secure research portal",
    dropshipMode: "White-label packaging",
    ecommerce: "Yes",
    platform: "Shopify",
    fulfillmentServices: ["Inventory Storage", "Returns Processing", "Other"],
    fulfillmentOther: "Temperature-aware inventory reporting",
    ownInventory: "Yes",
    purchaseMode: "Bulk Wholesale Orders",
    initialSize: "Medium Initial Order",
  };
}

function flags(partnerships: string[], dropshipMode = "") {
  const data = { partnerships, dropshipMode };
  return {
    storefront: needsStorefront(data),
    dropship: needsDropship(data),
    fulfillment: needsFulfillment(data),
    wholesale: needsWholesale(data),
    brand: needsBrandCustomization(data),
  };
}

function issuePaths(data: unknown): string[] {
  const result = partnerInquiryDataSchema.safeParse(data);
  expect(result.success).toBe(false);
  if (result.success) throw new Error("Expected validation errors");
  return result.error.issues.map(issue => issue.path.join(".")).sort();
}

function escaped(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// This suite only calls shared pure functions and the pure email renderer.
// It never imports routes, opens a database, sends email, or submits an inquiry.
describe("visible partnership service choices", () => {
  it("exposes exactly seven unique services in order with a dynamic medical title", () => {
    expect(visibleServices).toEqual([
      turnkey,
      supply,
      wholesale,
      partnershipOptions[3].value,
      "Education and Training",
      "Payment Processing",
      "Marketing and Compliance Resources",
    ]);
    expect(partnershipOptions).toHaveLength(7);
    expect(new Set(visibleServices).size).toBe(7);
    for (const option of partnershipOptions) {
      expect(option.value.trim().length).toBeGreaterThan(0);
      expect(option.description.trim().length).toBeGreaterThan(0);
    }
    for (const legacy of legacyServices)
      expect(visibleServices).not.toContain(legacy);
  });

  it.each(visibleServices)(
    "accepts the new %s choice in the inquiry and submission schemas",
    service => {
      const payload = toPartnerSubmissionData(fullForm([service]));
      const parsed = partnerInquiryDataSchema.parse(payload);
      expect(parsed.partnerships).toEqual([service]);
      expect(parsed.company).toBe("Clearly Labeled Test Company");
      expect(
        partnerSubmissionSchema.safeParse({
          requestId: "7cf50cf2-a1d0-4fd4-a9d8-ca57b67a1706",
          data: payload,
          logoId: null,
          assetIds: [],
          confirmed: true,
        }).success
      ).toBe(true);
    }
  );

  it("accepts all seven choices together", () => {
    const parsed = partnerInquiryDataSchema.parse(
      toPartnerSubmissionData(fullForm(visibleServices))
    );
    expect(parsed.partnerships).toEqual(visibleServices);
  });

  it.each(["An arbitrary service", "Turnkey Business (custom)", ""])(
    "rejects an unlisted value: %j",
    service => {
      const result = partnerInquiryDataSchema.safeParse({
        ...toPartnerSubmissionData(fullForm([turnkey])),
        partnerships: [service],
      });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(
          result.error.issues.some(issue => issue.path[0] === "partnerships")
        ).toBe(true);
    }
  );

  it("rejects duplicate service selections", () => {
    expect(() =>
      partnerInquiryDataSchema.parse({
        ...toPartnerSubmissionData(fullForm([turnkey])),
        partnerships: [turnkey, turnkey],
      })
    ).toThrow(/Partnerships must not contain duplicates/);
  });

  it("requires at least one service", () => {
    expect(() => partnerInquiryDataSchema.parse(baseInquiry([]))).toThrow(
      /Select at least one partnership option/
    );
  });

  it.each(legacyServices)(
    "continues accepting the hidden legacy %s choice for an already-open session",
    service => {
      expect(visibleServices).not.toContain(service);
      const payload = toPartnerSubmissionData(fullForm([service]));
      expect(partnerInquiryDataSchema.parse(payload).partnerships).toEqual([
        service,
      ]);
      if (service === "Other Partnership Opportunity") {
        expect(payload.partnershipOther).toBe(
          "A legacy regional distribution collaboration"
        );
      }
    }
  );
});

describe("new service conditional mapping", () => {
  it("maps Turnkey to storefront, fulfillment and branding only", () => {
    expect(flags([turnkey])).toEqual({
      storefront: true,
      dropship: false,
      fulfillment: true,
      wholesale: false,
      brand: true,
    });
  });

  it.each([
    ["Direct-to-customer fulfillment", false],
    ["I am not sure yet", false],
    ["Fulfillment under my own brand", true],
    ["White-label packaging", true],
  ] as const)(
    "maps product supply to dropship and fulfillment with %s branding=%s",
    (mode, brand) => {
      expect(flags([supply], mode)).toEqual({
        storefront: false,
        dropship: true,
        fulfillment: true,
        wholesale: false,
        brand,
      });
    }
  );

  it("maps wholesale manufacturing to wholesale and branding only", () => {
    expect(flags([wholesale])).toEqual({
      storefront: false,
      dropship: false,
      fulfillment: false,
      wholesale: true,
      brand: true,
    });
  });

  it.each(nonConditionalServices)(
    "does not activate any conditional branch for %s",
    service => {
      // Even a stale branded dropship answer must not activate branding by itself.
      expect(flags([service], "White-label packaging")).toEqual({
        storefront: false,
        dropship: false,
        fulfillment: false,
        wholesale: false,
        brand: false,
      });
      expect(
        partnerInquiryDataSchema.safeParse(baseInquiry([service])).success
      ).toBe(true);
    }
  );

  it.each([turnkey, supply, wholesale])(
    "preserves the %s branch when the other four services are multi-selected",
    service => {
      expect(
        flags([service, ...nonConditionalServices], "White-label packaging")
      ).toEqual(flags([service], "White-label packaging"));
    }
  );

  it("takes the union of the three conditional services", () => {
    expect(flags(visibleServices, "White-label packaging")).toEqual({
      storefront: true,
      dropship: true,
      fulfillment: true,
      wholesale: true,
      brand: true,
    });
  });
});

describe("new service conditional schema requirements", () => {
  it.each([
    {
      service: turnkey,
      paths: [
        "storefrontType",
        "ownsDomain",
        "migration",
        "fulfillmentServices",
        "ownInventory",
      ],
    },
    {
      service: supply,
      paths: [
        "dropshipMode",
        "ecommerce",
        "fulfillmentServices",
        "ownInventory",
      ],
    },
    { service: wholesale, paths: ["purchaseMode", "initialSize"] },
  ])(
    "requires the correct missing branch fields for $service",
    ({ service, paths }) => {
      expect(issuePaths(baseInquiry([service]))).toEqual([...paths].sort());
    }
  );

  it("requires Turnkey domain, migration URL and other storefront detail when selected", () => {
    const payload = toPartnerSubmissionData(fullForm([turnkey]));
    delete payload.domain;
    delete payload.migrationUrl;
    delete payload.featuresOther;
    expect(issuePaths(payload)).toEqual([
      "domain",
      "featuresOther",
      "migrationUrl",
    ]);
  });

  it.each([turnkey, supply])(
    "requires a nonempty 3PL service selection and inventory answer for %s",
    service => {
      const payload = toPartnerSubmissionData(fullForm([service]));
      payload.fulfillmentServices = [];
      delete payload.ownInventory;
      expect(issuePaths(payload)).toEqual([
        "fulfillmentServices",
        "ownInventory",
      ]);
    }
  );

  it("requires the supply ecommerce platform and other fulfillment detail when selected", () => {
    const payload = toPartnerSubmissionData(fullForm([supply]));
    delete payload.platform;
    delete payload.fulfillmentOther;
    expect(issuePaths(payload)).toEqual(["fulfillmentOther", "platform"]);
  });

  it.each([turnkey, supply, wholesale])(
    "accepts %s with complete required answers and unfinished brand colors",
    service => {
      const form = fullForm([service]);
      form.colorsNotFinal = true;
      const payload = toPartnerSubmissionData(form);
      expect(payload.colorsNotFinal).toBe(true);
      for (const key of ["primaryColor", "secondaryColor", "accentColor"])
        expect(payload).not.toHaveProperty(key);
      expect(partnerInquiryDataSchema.safeParse(payload).success).toBe(true);
    }
  );
});

describe("form-to-payload service data selection", () => {
  const cases = [
    {
      service: turnkey,
      kept: [...brandKeys, ...storefrontKeys, ...fulfillmentKeys],
    },
    {
      service: supply,
      kept: [...brandKeys, ...dropshipKeys, ...fulfillmentKeys],
    },
    { service: wholesale, kept: [...brandKeys, ...wholesaleKeys] },
    ...nonConditionalServices.map(service => ({
      service,
      kept: [] as (typeof conditionalKeys)[number][],
    })),
  ];

  it.each(cases)(
    "sends only the active conditional data for $service",
    ({ service, kept }) => {
      const form = fullForm([service]);
      const before = structuredClone(form);
      const payload = toPartnerSubmissionData(form);
      for (const key of conditionalKeys) {
        if (kept.includes(key)) expect(payload[key], key).toEqual(form[key]);
        else expect(payload, key).not.toHaveProperty(key);
      }
      expect(payload).not.toHaveProperty("partnershipOther");
      expect(payload.needs).toBe(form.needs);
      expect(payload.products).toEqual(form.products);
      expect(partnerInquiryDataSchema.safeParse(payload).success).toBe(true);
      expect(form).toEqual(before);
    }
  );

  it.each(cases)(
    "omits deselected branches while preserving remaining data for $service and back-navigation",
    ({ service, kept }) => {
      const form = fullForm(visibleServices);
      const initialPayload = toPartnerSubmissionData(form);
      form.partnerships = [service];
      const stateAfterDeselection = structuredClone(form);
      const remainingPayload = toPartnerSubmissionData(form);
      expect(remainingPayload.partnerships).toEqual([service]);
      for (const key of conditionalKeys) {
        if (kept.includes(key))
          expect(remainingPayload[key], key).toEqual(initialPayload[key]);
        else expect(remainingPayload, key).not.toHaveProperty(key);
        expect(form[key], `preserved client state: ${key}`).toEqual(
          stateAfterDeselection[key]
        );
      }
      for (const key of [
        "company",
        "website",
        "businessOther",
        "products",
        "monthlyVolume",
        "needs",
      ] as const) {
        expect(remainingPayload[key], key).toEqual(initialPayload[key]);
      }
      expect(partnerInquiryDataSchema.safeParse(remainingPayload).success).toBe(
        true
      );
      expect(form).toEqual(stateAfterDeselection);
      form.partnerships = [...visibleServices];
      expect(toPartnerSubmissionData(form)).toEqual(initialPayload);
    }
  );

  it("drops supply branding when its branded mode is deselected but retains dropship and 3PL answers", () => {
    const form = fullForm([supply]);
    const brandedPayload = toPartnerSubmissionData(form);
    form.dropshipMode = "Direct-to-customer fulfillment";
    const payload = toPartnerSubmissionData(form);
    for (const key of brandKeys) expect(payload).not.toHaveProperty(key);
    for (const key of [...fulfillmentKeys, "ecommerce", "platform"] as const)
      expect(payload[key]).toEqual(brandedPayload[key]);
    expect(payload.dropshipMode).toBe("Direct-to-customer fulfillment");
    expect(form.primaryColor).toBe("#123456");
    expect(form.brandingInstructions).toBe(brandedPayload.brandingInstructions);
    expect(partnerInquiryDataSchema.safeParse(payload).success).toBe(true);
  });

  it("retains shared fulfillment and branding when Turnkey is removed from a Turnkey plus supply selection", () => {
    const form = fullForm([turnkey, supply]);
    const initialPayload = toPartnerSubmissionData(form);
    form.partnerships = [supply];
    const payload = toPartnerSubmissionData(form);
    for (const key of storefrontKeys) expect(payload).not.toHaveProperty(key);
    for (const key of [...brandKeys, ...fulfillmentKeys, ...dropshipKeys])
      expect(payload[key]).toEqual(initialPayload[key]);
    expect(partnerInquiryDataSchema.safeParse(payload).success).toBe(true);
  });
});

describe("new partnership names in rendered email", () => {
  it.each(visibleServices)(
    "renders the exact %s choice in HTML and text",
    service => {
      const data = partnerInquiryDataSchema.parse(
        toPartnerSubmissionData(fullForm([service]))
      );
      const email = renderPartnerEmail({
        id: "f12f60ce-b99a-4b59-bc13-8ff590dfaa31",
        submittedAt: new Date("2026-11-02T17:30:00.123Z"),
        data,
        assets: [],
        appBaseUrl: "https://partners.peplogix.example",
      });
      expect(email.html).toContain(`<li>${escaped(service)}</li>`);
      expect(email.text).toContain(`Partnership interests: - ${service}`);
      expect(email.reply_to).toBe("test.partner@example.com");
      for (const legacy of legacyServices) {
        expect(email.html).not.toContain(`<li>${escaped(legacy)}</li>`);
        expect(email.text).not.toContain(`\n- ${legacy}\n`);
      }
    }
  );

  it("retains all seven selected names and their order in both email formats", () => {
    const data = partnerInquiryDataSchema.parse(
      toPartnerSubmissionData(fullForm(visibleServices))
    );
    const email = renderPartnerEmail({
      id: "f12f60ce-b99a-4b59-bc13-8ff590dfaa31",
      submittedAt: "2026-11-02T17:30:00.123Z",
      data,
      assets: [],
      appBaseUrl: "https://partners.peplogix.example",
    });
    expect(email.text).toContain(
      `Partnership interests: ${visibleServices.map(service => `- ${service}`).join("\n")}`
    );
    expect(email.html).toContain(
      visibleServices.map(service => `<li>${escaped(service)}</li>`).join("")
    );
    expect(email.text).toContain(data.needs!);
    expect(email.text).toContain(data.brandingInstructions!);
  });
});

describe("approved medical service title", () => {
  it("uses the approved title without an additional clarification", () => {
    expect(partnershipOptions[3].value).toBe(
      "503A Compounded Medications and Medical Supplies"
    );
    expect(partnershipOptions[3]).not.toHaveProperty("clarification");
  });
});

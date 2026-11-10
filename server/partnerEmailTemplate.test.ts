import { describe, expect, it } from "vitest";
import {
  partnerInquiryDataSchema,
  partnerSubmissionSchema,
  partnershipOptions,
  type PartnerInquiryData,
} from "../shared/partner";
import {
  PARTNER_EMAIL_FIELDS,
  renderPartnerEmail,
  type RenderPartnerEmailInput,
} from "./partnerEmailTemplate";

function fullInquiry(): PartnerInquiryData {
  return {
    company: "Aurora Partner Company",
    firstName: "Alexandra",
    lastName: "Rivera",
    email: "alexandra@example.com",
    phone: "+1 212 555 0199",
    hasWebsite: "Yes",
    website: "https://aurora.example.com/our-business",
    businessTypes: ["Ecommerce Brand", "Other"],
    businessOther: "Independent research supplier",
    partnerships: partnershipOptions.map(option => option.value),
    partnershipOther: "A regional distribution collaboration",
    products: ["Reta", "BPC-157", "Custom research product"],
    monthlyVolume: "100–500 Orders",
    needs: "First line of business notes.\nSecond line with complete detail.",
    primaryColor: "#123456",
    secondaryColor: "#456789",
    accentColor: "#789ABC",
    colorsNotFinal: false,
    brandingInstructions:
      "Match the printed brand guide.\nPreserve the spacing.",
    storefrontType: "A fully custom ecommerce website",
    ownsDomain: "Yes",
    domain: "aurora.example.com",
    migration: "Yes",
    migrationUrl: "https://legacy.aurora.example.com/catalog",
    features: ["Custom Branding", "Ecommerce Checkout", "Other"],
    featuresOther: "A custom research portal",
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

function input(
  overrides: Partial<RenderPartnerEmailInput> = {}
): RenderPartnerEmailInput {
  return {
    id: "f12f60ce-b99a-4b59-bc13-8ff590dfaa31",
    submittedAt: new Date("2026-11-02T17:30:00.123Z"),
    data: fullInquiry(),
    assets: [
      { name: "aurora-logo.png", type: "image/png", size: 2048, role: "logo" },
      {
        name: "brand-guide.pdf",
        type: "application/pdf",
        size: 1050123,
        role: "asset",
      },
    ],
    appBaseUrl: "https://partners.peplogix.example",
    ...overrides,
  };
}

function escaped(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function visibleValue(value: string | boolean | string[]): string {
  if (typeof value === "boolean") return value ? "Yes (true)" : "No (false)";
  if (Array.isArray(value))
    return value.length
      ? value.map(item => `- ${item}`).join("\n")
      : "None selected";
  return value === "" ? "Not provided (empty)" : value;
}

function fieldHtml(html: string, label: string): string {
  const row = html.match(
    new RegExp(
      `<tr><th[^>]*>${escaped(label).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<\\/th><td[^>]*>([\\s\\S]*?)<\\/td><\\/tr>`
    )
  );
  expect(row, `HTML row for ${label}`).not.toBeNull();
  return row![1];
}

const inquiryKeys = Object.keys(PARTNER_EMAIL_FIELDS) as Array<
  keyof PartnerInquiryData
>;

describe("renderPartnerEmail", () => {
  it("keeps the label/section map exhaustive against the actual shared schema", () => {
    expect(Object.keys(PARTNER_EMAIL_FIELDS).sort()).toEqual(
      Object.keys(partnerInquiryDataSchema.shape).sort()
    );
    // The fixture contains every schema field, including every conditional branch.
    expect(Object.keys(fullInquiry()).sort()).toEqual(
      Object.keys(partnerInquiryDataSchema.shape).sort()
    );
    expect(partnerInquiryDataSchema.safeParse(fullInquiry()).success).toBe(
      true
    );
    expect(
      partnerSubmissionSchema.safeParse({
        requestId: "35a9ce07-287a-4f13-901a-0642694eb202",
        data: fullInquiry(),
        logoId: "L".repeat(43),
        assetIds: ["A".repeat(43)],
        confirmed: true,
      }).success
    ).toBe(true);
  });

  it.each(inquiryKeys)("renders the complete %s field in both formats", key => {
    const data = fullInquiry();
    const value = data[key]!;
    const result = renderPartnerEmail(input({ data }));
    const label = PARTNER_EMAIL_FIELDS[key].label;
    expect(result.text).toContain(`${label}: ${visibleValue(value)}`);
    const cell = fieldHtml(result.html, label);
    if (Array.isArray(value)) {
      for (const item of value)
        expect(cell).toContain(`<li>${escaped(item)}</li>`);
    } else {
      expect(cell).toBe(
        escaped(visibleValue(value)).replace(/\r\n|\r|\n/g, "<br />")
      );
    }
  });

  it("includes inquiry identity, an unambiguous UTC timestamp, and confirmed accuracy true", () => {
    const fixture = input();
    const result = renderPartnerEmail(fixture);
    expect(Object.keys(result).sort()).toEqual([
      "html",
      "reply_to",
      "subject",
      "text",
    ]);
    expect(result.subject).toBe(
      "New Peplogix Partnership Inquiry — Aurora Partner Company"
    );
    expect(result.reply_to).toBe(fixture.data.email);
    expect(result.html).toContain(fixture.id);
    expect(result.text).toContain(`Inquiry ID: ${fixture.id}`);
    expect(fieldHtml(result.html, "Submitted at (UTC)")).toBe(
      "2026-11-02T17:30:00.123Z"
    );
    expect(result.text).toContain(
      "Submitted at (UTC): 2026-11-02T17:30:00.123Z"
    );
    expect(fieldHtml(result.html, "Confirmed accuracy")).toBe("Yes (true)");
    expect(result.text).toContain("Confirmed accuracy: Yes (true)");
    expect(
      renderPartnerEmail(
        input({ submittedAt: "2026-11-02T11:30:00.123-06:00" })
      )
    ).toEqual(result);
  });

  it.each([
    "weg.partners.peplogix.com",
    "partners.peplogix.com",
    "jvega.partners.peplogix.com",
    "miked.partners.peplogix.com",
    "eric.partners.peplogix.com",
  ])("prominently attributes a submission from %s", sourceDomain => {
    const fixture = input({ sourceDomain });
    const result = renderPartnerEmail(fixture);
    expect(result.subject).toBe(
      `New Peplogix Partnership Inquiry [${sourceDomain}] — Aurora Partner Company`
    );
    expect(fieldHtml(result.html, "Submitted from domain")).toBe(
      `<strong>${sourceDomain}</strong>`
    );
    expect(result.text).toContain(`Submitted from domain: ${sourceDomain}`);
    expect(result.html.indexOf(">Submitted from domain</th>")).toBeLessThan(
      result.html.indexOf(">Inquiry ID</th>")
    );
    expect(result.text.indexOf("Submitted from domain:")).toBeLessThan(
      result.text.indexOf("Inquiry ID:")
    );
    expect(result.reply_to).toBe(fixture.data.email);
    for (const key of inquiryKeys)
      expect(result.text).toContain(`${PARTNER_EMAIL_FIELDS[key].label}:`);
    for (const asset of fixture.assets)
      expect(result.text).toContain(`Name: ${asset.name}`);
    expect(result).not.toHaveProperty("attachments");
    expect(result.text).toContain("no public file links or attachments");
  });

  it("uses the normalized canonical domain in both formats and the subject", () => {
    const result = renderPartnerEmail(
      input({ sourceDomain: "WEG.PARTNERS.PEPLOGIX.COM" })
    );
    expect(result.subject).toBe(
      "New Peplogix Partnership Inquiry [weg.partners.peplogix.com] — Aurora Partner Company"
    );
    expect(result.text).toContain(
      "Submitted from domain: weg.partners.peplogix.com"
    );
    expect(fieldHtml(result.html, "Submitted from domain")).toBe(
      "<strong>weg.partners.peplogix.com</strong>"
    );
    expect(result.html).not.toContain("WEG.PARTNERS.PEPLOGIX.COM");
  });

  it.each([
    undefined,
    null,
    "",
    "unknown.example.com",
    "unknown.partners.peplogix.com",
    " weg.partners.peplogix.com ",
    "weg.partners.peplogix.com.evil.example",
  ])("does not attribute an absent or unknown source: %j", sourceDomain => {
    const result = renderPartnerEmail(input({ sourceDomain }));
    expect(result.subject).toBe(
      "New Peplogix Partnership Inquiry — Aurora Partner Company"
    );
    expect(result.text).toContain("Submitted from domain: Not recorded");
    expect(fieldHtml(result.html, "Submitted from domain")).toBe(
      "<strong>Not recorded</strong>"
    );
    expect(result).toEqual(renderPartnerEmail(input()));
  });

  it.each([
    "weg.partners.peplogix.com\r\nBcc: attacker@example.com",
    "weg.partners.peplogix.com\nSubject: forged inquiry",
    "weg.partners.peplogix.com\u0000",
    "weg.partners.peplogix.com\u202e",
    '<img src="https://tracker.example/pixel" onerror="alert(1)">',
    'weg.partners.peplogix.com</strong><script>alert("source")</script>',
  ])(
    "rejects source injection without changing the email: %j",
    sourceDomain => {
      const result = renderPartnerEmail(input({ sourceDomain }));
      expect(result).toEqual(renderPartnerEmail(input()));
      expect(result.subject).not.toContain(sourceDomain);
      expect(result.text).not.toContain(sourceDomain);
      expect(result.html).not.toMatch(/<(?:img|script|iframe)\b/i);
    }
  );

  it.each([
    "weg.partners.peplogix.com",
    "partners.peplogix.com",
    "jvega.partners.peplogix.com",
    "miked.partners.peplogix.com",
    "eric.partners.peplogix.com",
  ])("keeps the configured dashboard canonical for source %s", sourceDomain => {
    const fixture = input({
      sourceDomain,
      appBaseUrl:
        "https://partners.peplogix.com/old-path?secret=drop-me#old-route",
    });
    const result = renderPartnerEmail(fixture);
    const url = `https://partners.peplogix.com/dashboard?inquiry=${fixture.id}`;
    expect(result.html.match(/<a\b/g)).toHaveLength(1);
    expect(result.html).toContain(`href="${url}"`);
    expect(result.text).toContain(`Open authenticated dashboard:\n${url}`);
    expect(result.html).not.toContain("drop-me");
    expect(result.text).not.toContain("drop-me");
    expect(result.html).not.toMatch(
      /href="https?:\/\/[^"\s]*\.partners\.peplogix\.com\//
    );
    for (const body of [result.html, result.text]) {
      expect(body).toContain("Private submission");
      expect(body).toContain("Authorized administrator sign-in is required");
      expect(body).toContain("file metadata only");
    }
  });

  it("shows all service sections and all supplied conditional fields regardless of selected interests", () => {
    const data = fullInquiry();
    data.partnerships = ["Other Partnership Opportunity"];
    const result = renderPartnerEmail(input({ data }));
    for (const section of new Set(
      Object.values(PARTNER_EMAIL_FIELDS).map(field => field.section)
    )) {
      expect(result.html).toContain(`>${escaped(section)}</h2>`);
      expect(result.text).toContain(section);
    }
    // Do not reapply UI branch rules and silently drop already-provided fields.
    for (const key of inquiryKeys)
      expect(result.text).toContain(`${PARTNER_EMAIL_FIELDS[key].label}:`);
  });

  it("omits only undefined conditional fields and their now-empty sections", () => {
    const data: PartnerInquiryData = {
      company: "Minimal Company",
      firstName: "Min",
      lastName: "Partner",
      email: "min@example.com",
      phone: "+1 212 555 0199",
      hasWebsite: "No",
      businessTypes: ["Ecommerce Brand"],
      partnerships: ["Other Partnership Opportunity"],
      partnershipOther: "Exploring an opportunity",
      colorsNotFinal: false,
      website: undefined,
      storefrontType: undefined,
      products: undefined,
    };
    const result = renderPartnerEmail(input({ data, assets: [] }));
    for (const key of inquiryKeys.filter(key => data[key] === undefined)) {
      const label = PARTNER_EMAIL_FIELDS[key].label;
      expect(result.text).not.toContain(`${label}:`);
      expect(result.html).not.toContain(`>${escaped(label)}</th>`);
    }
    for (const section of [
      "Custom storefront",
      "Dropshipping",
      "3PL warehousing & fulfillment",
      "Wholesale supply",
    ]) {
      expect(result.text).not.toContain(section);
      expect(result.html).not.toContain(`>${escaped(section)}</h2>`);
    }
    expect(result.text).toContain("Brand colors not finalized: No (false)");
  });

  it.each([false, true])(
    "represents the boolean %s explicitly instead of treating false as absent",
    value => {
      const data = { ...fullInquiry(), colorsNotFinal: value };
      const result = renderPartnerEmail(input({ data }));
      const expected = value ? "Yes (true)" : "No (false)";
      expect(fieldHtml(result.html, "Brand colors not finalized")).toBe(
        expected
      );
      expect(result.text).toContain(`Brand colors not finalized: ${expected}`);
    }
  );

  it("clearly represents empty provided arrays and empty provided text", () => {
    const data = {
      ...fullInquiry(),
      products: [],
      features: [],
      fulfillmentServices: [],
      needs: "",
    };
    const result = renderPartnerEmail(input({ data }));
    for (const label of [
      "Products of interest",
      "Storefront features",
      "Fulfillment services",
    ]) {
      expect(fieldHtml(result.html, label)).toBe("None selected");
      expect(result.text).toContain(`${label}: None selected`);
    }
    expect(fieldHtml(result.html, "Business needs & notes")).toBe(
      "Not provided (empty)"
    );
    expect(result.text).toContain(
      "Business needs & notes: Not provided (empty)"
    );
  });

  const unsafeFieldKeys = inquiryKeys.filter(
    key => key !== "email" && key !== "colorsNotFinal"
  );
  it.each(unsafeFieldKeys)(
    "escapes untrusted HTML in %s without altering its plain-text content",
    key => {
      const data = fullInquiry();
      const malicious = `<img src="https://tracker.example/pixel" onerror='alert(1)'> & <script>evil()</script>`;
      const mutable = data as unknown as Record<string, unknown>;
      mutable[key] = Array.isArray(data[key])
        ? [malicious, "Another <entry>"]
        : malicious;
      const result = renderPartnerEmail(input({ data }));
      expect(fieldHtml(result.html, PARTNER_EMAIL_FIELDS[key].label)).toContain(
        escaped(malicious)
      );
      expect(result.html).not.toContain(malicious);
      expect(result.html).not.toMatch(/<(?:img|script|iframe)\b/i);
      expect(result.text).toContain(malicious);
    }
  );

  it("retains multiline notes and branding instructions in full without truncating or HTML injection", () => {
    const needs = `Opening & <detail>\r\n${"A long, important sentence. ".repeat(350)}\nFinal needs line.`;
    const brandingInstructions = `First branding line.\rSecond branding line.\n${"Exact brand instructions. ".repeat(350)}Final branding line.`;
    const result = renderPartnerEmail(
      input({ data: { ...fullInquiry(), needs, brandingInstructions } })
    );
    expect(result.text).toContain(needs);
    expect(result.text).toContain(brandingInstructions);
    expect(fieldHtml(result.html, "Business needs & notes")).toBe(
      escaped(needs).replace(/\r\n|\r|\n/g, "<br />")
    );
    expect(fieldHtml(result.html, "Branding instructions")).toBe(
      escaped(brandingInstructions).replace(/\r\n|\r|\n/g, "<br />")
    );
  });

  it.each([undefined, "weg.partners.peplogix.com"])(
    "strips subject controls without truncating the entry for source %j",
    sourceDomain => {
      const company = `Aurora\r\nBcc: attacker@example.com\u0000\t\u007f\u0085\u2028\u2029\u202e${"Z".repeat(250)}`;
      const result = renderPartnerEmail(
        input({ sourceDomain, data: { ...fullInquiry(), company } })
      );
      expect(result.subject).toHaveLength(200);
      expect(
        result.subject.startsWith(
          `New Peplogix Partnership Inquiry${sourceDomain ? ` [${sourceDomain}]` : ""} — AuroraBcc:`
        )
      ).toBe(true);
      expect(result.subject).not.toMatch(/[\p{Cc}\p{Cf}\u2028\u2029]/u);
      expect(result.text).toContain(`Company: ${company}`);
      expect(result.html).toContain("Z".repeat(250));
    }
  );

  it.each([undefined, "weg.partners.peplogix.com"])(
    "bounds Unicode subjects without splitting a surrogate pair for source %j",
    sourceDomain => {
      const result = renderPartnerEmail(
        input({
          sourceDomain,
          data: { ...fullInquiry(), company: "🧬".repeat(250) },
        })
      );
      expect(result.subject.length).toBeLessThanOrEqual(200);
      expect(result.subject).not.toMatch(/[\uD800-\uDBFF]$/);
      expect(result.text).toContain("🧬".repeat(250));
    }
  );

  it.each([
    "alexandra@example.com\r\nBcc: attacker@example.com",
    "alexandra@example.com\n",
    "alexandra@example.com\r",
    "alexandra@example.com\u0000",
    "alexandra@example.com\u0085",
    "alexandra@example.com\u2028",
    "alexandra@example.com\u2029",
    "alexandra@example.com\u202e",
    "Alexandra <alexandra@example.com>",
    "alexandra@example.com,attacker@example.com",
    "not-an-email",
  ])("rejects unsafe reply-to headers: %j", email => {
    expect(() =>
      renderPartnerEmail(input({ data: { ...fullInquiry(), email } }))
    ).toThrow(/reply-to email/i);
  });

  it("returns only a validated mailbox for reply_to while preserving the original form value in the body", () => {
    const email = "  alexandra+partner@example.com  ";
    const result = renderPartnerEmail(
      input({ data: { ...fullInquiry(), email } })
    );
    expect(result.reply_to).toBe("alexandra+partner@example.com");
    expect(result.text).toContain(`Email: ${email}`);
  });

  it("includes exact logo and additional file names, types, byte sizes, and roles without links or attachments", () => {
    const fixture = input();
    const result = renderPartnerEmail(fixture);
    for (const asset of fixture.assets) {
      for (const value of [asset.name, asset.type, `${asset.size} bytes`]) {
        expect(result.html).toContain(escaped(value));
        expect(result.text).toContain(value);
      }
    }
    expect(result.text).toContain("Role: Logo");
    expect(result.text).toContain("Role: Additional file");
    expect(result.text.indexOf("Uploaded files (metadata only)")).toBeLessThan(
      result.text.indexOf("File 1\n")
    );
    expect(result.html.match(/<a\b/g)).toHaveLength(1);
    expect(result.html).not.toMatch(
      /<img\b|\bsrc=|cid:|data:|\/api\/partner\/assets\//i
    );
    expect(result).not.toHaveProperty("attachments");
    expect(result.html).toContain("no public file links or attachments");
    expect(result.text).toContain("no public file links or attachments");
  });

  it("escapes filenames, MIME types, custom roles and inquiry IDs while preserving plain-text metadata", () => {
    const malicious = `<svg onload='alert("file")'> & injected`;
    const id = `id\"/><img src='x'> & extra=1#fragment`;
    const result = renderPartnerEmail(
      input({
        id,
        assets: [
          { name: malicious, type: malicious, size: 0, role: malicious },
        ],
      })
    );
    expect(result.html).toContain(escaped(malicious));
    expect(fieldHtml(result.html, "Inquiry ID")).toBe(escaped(id));
    expect(result.html).not.toMatch(/<(?:svg|img)\b/i);
    expect(result.text).toContain(`Name: ${malicious}`);
    expect(result.text).toContain(`Type: ${malicious}`);
    expect(result.text).toContain(`Role: ${malicious}`);
    expect(result.text).toContain("Size: 0 bytes");
    const href = result.html.match(/href="([^"]+)"/)![1];
    const url = new URL(href.replace(/&amp;/g, "&"));
    expect(url.searchParams.get("inquiry")).toBe(id);
    expect([...url.searchParams.keys()]).toEqual(["inquiry"]);
    expect(url.hash).toBe("");
  });

  it.each([undefined, null, "asset"])(
    "labels role %s as an additional file",
    role => {
      const result = renderPartnerEmail(
        input({
          assets: [
            { name: "notes.pdf", type: "application/pdf", size: 512, role },
          ],
        })
      );
      expect(result.text).toContain("Role: Additional file");
      expect(result.html).toContain("Additional file");
    }
  );

  it("explicitly reports an inquiry with no uploaded files", () => {
    const result = renderPartnerEmail(input({ assets: [] }));
    expect(result.html).toContain("No files were uploaded.");
    expect(result.text).toContain(
      "Uploaded files (metadata only)\n\nNo files were uploaded."
    );
  });

  it("links only to the correct authenticated pathname dashboard and explains private access", () => {
    const fixture = input({
      appBaseUrl:
        "https://partners.peplogix.example/old-path?secret=drop-me#old-route",
    });
    const result = renderPartnerEmail(fixture);
    const url = `https://partners.peplogix.example/dashboard?inquiry=${fixture.id}`;
    expect(result.html).toContain(`href="${url}"`);
    expect(result.text).toContain(`Open authenticated dashboard:\n${url}`);
    expect(result.html).not.toContain("drop-me");
    for (const body of [result.html, result.text]) {
      expect(body).toContain("Private submission");
      expect(body).toContain("Authorized administrator sign-in is required");
      expect(body).toContain("file metadata only");
    }
  });

  it.each([
    "https://partners.peplogix.example",
    "http://localhost:3000",
    "https://partners.peplogix.example:8443/",
  ])("accepts a safe absolute web base URL: %s", appBaseUrl => {
    const fixture = input({ appBaseUrl });
    const result = renderPartnerEmail(fixture);
    expect(result.text).toContain(
      `${new URL(appBaseUrl).origin}/dashboard?inquiry=${fixture.id}`
    );
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "file:///etc/passwd",
    "ftp://partners.example",
    "//partners.example",
    "/dashboard",
    "partners.example",
    "https:",
    "https://",
    "https://user:password@partners.example",
    "https://user@partners.example",
    "https://partners.example\r\n.evil.example",
    "https://partners.example\u0000",
    "https://partners.example\u0085",
    "https://partners.example\\@evil.example",
    " https://partners.example",
    "https://partners.example/a b",
  ])("rejects unsafe or non-absolute app URLs: %j", appBaseUrl => {
    expect(() => renderPartnerEmail(input({ appBaseUrl }))).toThrow(
      /safe absolute HTTP\(S\) URL/
    );
  });

  it.each(["not a date", new Date(Number.NaN)])(
    "rejects invalid submission timestamps: %j",
    submittedAt => {
      expect(() => renderPartnerEmail(input({ submittedAt }))).toThrow(
        /valid date/
      );
    }
  );

  it("uses simple inline table styling, brand colors, and a white-on-orange CTA without tracking images", () => {
    const result = renderPartnerEmail(input());
    expect(result.html).toContain('<table role="presentation"');
    expect(result.html).toContain("#003F6A");
    expect(result.html).toContain("#D8603D");
    expect(result.html).toMatch(
      /<a href="[^"]+" style="[^"]*color:#FFFFFF;background-color:#D8603D/
    );
    expect(result.html).not.toMatch(/<img\b|<link\b|<script\b|<style\b|url\(/i);
  });
});

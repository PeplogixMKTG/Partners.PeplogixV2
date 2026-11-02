import {
  partnerInquiryDataSchema,
  type PartnerInquiryData,
  type PartnerSubmission,
} from "../shared/partner";

export type PartnerEmailAsset = {
  name: string;
  type: string;
  size: number;
  role?: string | null;
};

export type RenderPartnerEmailInput = {
  id: string;
  submittedAt: Date | string;
  data: PartnerInquiryData;
  assets: PartnerEmailAsset[];
  appBaseUrl: string;
};

export type RenderedPartnerEmail = {
  subject: string;
  html: string;
  text: string;
  reply_to: string;
};

const SECTIONS = [
  "Business information",
  "Partnership preferences",
  "Brand customization",
  "Custom storefront",
  "Dropshipping",
  "3PL warehousing & fulfillment",
  "Wholesale supply",
] as const;

type Section = (typeof SECTIONS)[number];

/** Adding a shared inquiry field requires an explicit label and section here. */
export const PARTNER_EMAIL_FIELDS = {
  company: { label: "Company", section: "Business information" },
  firstName: { label: "First name", section: "Business information" },
  lastName: { label: "Last name", section: "Business information" },
  email: { label: "Email", section: "Business information" },
  phone: { label: "Phone", section: "Business information" },
  hasWebsite: { label: "Has a website", section: "Business information" },
  website: { label: "Website", section: "Business information" },
  businessTypes: { label: "Business types", section: "Business information" },
  businessOther: {
    label: "Other business type",
    section: "Business information",
  },
  partnerships: {
    label: "Partnership interests",
    section: "Partnership preferences",
  },
  partnershipOther: {
    label: "Other partnership opportunity",
    section: "Partnership preferences",
  },
  products: {
    label: "Products of interest",
    section: "Partnership preferences",
  },
  monthlyVolume: {
    label: "Estimated monthly volume",
    section: "Partnership preferences",
  },
  needs: {
    label: "Business needs & notes",
    section: "Partnership preferences",
  },
  primaryColor: {
    label: "Primary brand color",
    section: "Brand customization",
  },
  secondaryColor: {
    label: "Secondary brand color",
    section: "Brand customization",
  },
  accentColor: { label: "Accent brand color", section: "Brand customization" },
  colorsNotFinal: {
    label: "Brand colors not finalized",
    section: "Brand customization",
  },
  brandingInstructions: {
    label: "Branding instructions",
    section: "Brand customization",
  },
  storefrontType: { label: "Storefront type", section: "Custom storefront" },
  ownsDomain: { label: "Owns a domain", section: "Custom storefront" },
  domain: { label: "Domain", section: "Custom storefront" },
  migration: {
    label: "Website migration required",
    section: "Custom storefront",
  },
  migrationUrl: { label: "Website to migrate", section: "Custom storefront" },
  features: { label: "Storefront features", section: "Custom storefront" },
  featuresOther: {
    label: "Other storefront features",
    section: "Custom storefront",
  },
  dropshipMode: { label: "Dropshipping approach", section: "Dropshipping" },
  ecommerce: { label: "Existing ecommerce store", section: "Dropshipping" },
  platform: { label: "Ecommerce platform", section: "Dropshipping" },
  fulfillmentServices: {
    label: "Fulfillment services",
    section: "3PL warehousing & fulfillment",
  },
  fulfillmentOther: {
    label: "Other fulfillment services",
    section: "3PL warehousing & fulfillment",
  },
  ownInventory: {
    label: "Supplies own inventory",
    section: "3PL warehousing & fulfillment",
  },
  purchaseMode: {
    label: "Wholesale purchase approach",
    section: "Wholesale supply",
  },
  initialSize: { label: "Initial order size", section: "Wholesale supply" },
} as const satisfies Record<
  keyof PartnerInquiryData,
  { label: string; section: Section }
>;

const FIELD_KEYS = Object.keys(PARTNER_EMAIL_FIELDS) as Array<
  keyof PartnerInquiryData
>;
const HEADER_CONTROLS = /[\p{Cc}\p{Cf}\u2028\u2029]/u;
const PRIVACY_NOTICE =
  "Private submission. Authorized administrator sign-in is required to review this inquiry and access uploaded files in the dashboard. This email contains file metadata only; no public file links or attachments are included.";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

function multilineHtml(value: string): string {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, "<br />");
}

function scalarText(value: string | boolean | number): string {
  if (typeof value === "boolean") return value ? "Yes (true)" : "No (false)";
  return value === "" ? "Not provided (empty)" : String(value);
}

function valueText(value: string | boolean | string[]): string {
  if (Array.isArray(value)) {
    return value.length
      ? value.map(item => `- ${scalarText(item)}`).join("\n")
      : "None selected";
  }
  return scalarText(value);
}

function valueHtml(value: string | boolean | string[]): string {
  if (Array.isArray(value) && value.length) {
    return `<ul style="margin:0;padding-left:18px;">${value.map(item => `<li>${multilineHtml(scalarText(item))}</li>`).join("")}</ul>`;
  }
  return multilineHtml(valueText(value));
}

function rowHtml(label: string, html: string): string {
  return `<tr><th scope="row" align="left" valign="top" style="width:34%;padding:11px 12px 11px 0;border-bottom:1px solid #E7ECEF;font-size:12px;font-weight:600;color:#526572;">${escapeHtml(label)}</th><td valign="top" style="padding:11px 0;border-bottom:1px solid #E7ECEF;font-size:14px;line-height:1.6;color:#183B50;overflow-wrap:anywhere;white-space:pre-wrap;">${html}</td></tr>`;
}

function sectionHtml(title: string, rows: string): string {
  return `<h2 style="margin:28px 0 10px;font-size:15px;font-weight:700;letter-spacing:0.02em;color:#003F6A;">${escapeHtml(title)}</h2><table width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;table-layout:fixed;">${rows}</table>`;
}

function dashboardUrl(appBaseUrl: string, id: string): string {
  // Reject browser URL normalization tricks, embedded credentials and non-web schemes.
  if (
    !/^https?:\/\//i.test(appBaseUrl) ||
    /[\s\\\p{Cc}\p{Cf}]/u.test(appBaseUrl)
  ) {
    throw new Error("appBaseUrl must be a safe absolute HTTP(S) URL");
  }
  let base: URL;
  try {
    base = new URL(appBaseUrl);
  } catch {
    throw new Error("appBaseUrl must be a safe absolute HTTP(S) URL");
  }
  if (
    !base.hostname ||
    base.username ||
    base.password ||
    !["http:", "https:"].includes(base.protocol)
  ) {
    throw new Error("appBaseUrl must be a safe absolute HTTP(S) URL");
  }
  // App.tsx uses pathname routing, not a hash router. Do not carry base queries/tokens.
  const url = new URL("/dashboard", base);
  url.searchParams.set("inquiry", id);
  return url.toString();
}

function safeReplyTo(email: string): string {
  // Do not silently turn a malicious header into a different recipient address.
  if (HEADER_CONTROLS.test(email))
    throw new Error("Invalid reply-to email address");
  const parsed = partnerInquiryDataSchema.shape.email.safeParse(email);
  if (!parsed.success) throw new Error("Invalid reply-to email address");
  return parsed.data;
}

/**
 * Pure renderer for a successfully validated PartnerSubmission (confirmed is true).
 * Raw request/upload capability IDs, file bodies and storage URLs are deliberately
 * not accepted: files remain behind the authenticated administrator dashboard.
 */
export function renderPartnerEmail(
  input: RenderPartnerEmailInput
): RenderedPartnerEmail {
  const { id, data, assets, appBaseUrl } = input;
  const link = dashboardUrl(appBaseUrl, id);
  const reply_to = safeReplyTo(data.email);
  const date =
    input.submittedAt instanceof Date
      ? input.submittedAt
      : new Date(input.submittedAt);
  if (Number.isNaN(date.getTime()))
    throw new Error("submittedAt must be a valid date");
  const submittedAt = date.toISOString();
  const confirmed: PartnerSubmission["confirmed"] = true;
  const subject = `New Peplogix Partnership Inquiry — ${data.company}`
    .replace(/[\p{Cc}\p{Cf}\u2028\u2029]/gu, "")
    .slice(0, 200)
    .replace(/[\uD800-\uDBFF]$/, "");

  let sections = sectionHtml(
    "Submission details",
    [
      rowHtml("Inquiry ID", multilineHtml(id)),
      rowHtml("Submitted at (UTC)", escapeHtml(submittedAt)),
      rowHtml("Confirmed accuracy", valueHtml(confirmed)),
    ].join("")
  );
  const textSections = [
    "PEPLOGIX | NEW PARTNERSHIP INQUIRY",
    `Inquiry ID: ${id}\nSubmitted at (UTC): ${submittedAt}\nConfirmed accuracy: ${scalarText(confirmed)}`,
  ];

  for (const section of SECTIONS) {
    // Only undefined is omitted: false, empty strings and empty arrays are meaningful.
    const keys = FIELD_KEYS.filter(
      key =>
        PARTNER_EMAIL_FIELDS[key].section === section && data[key] !== undefined
    );
    if (!keys.length) continue;
    sections += sectionHtml(
      section,
      keys
        .map(key =>
          rowHtml(PARTNER_EMAIL_FIELDS[key].label, valueHtml(data[key]!))
        )
        .join("")
    );
    textSections.push(
      `${section}\n${keys.map(key => `${PARTNER_EMAIL_FIELDS[key].label}: ${valueText(data[key]!)}`).join("\n")}`
    );
  }

  const filesHeading = "Uploaded files (metadata only)";
  textSections.push(filesHeading);
  const fileRows = assets.map((asset, index) => {
    const role =
      asset.role === "logo"
        ? "Logo"
        : asset.role === "asset" || asset.role == null
          ? "Additional file"
          : scalarText(asset.role);
    const fields = [
      ["Role", role],
      ["Name", scalarText(asset.name)],
      ["Type", scalarText(asset.type)],
      ["Size", `${asset.size} bytes`],
    ];
    textSections.push(
      `File ${index + 1}\n${fields.map(([label, value]) => `${label}: ${value}`).join("\n")}`
    );
    return rowHtml(
      `File ${index + 1}`,
      fields
        .map(
          ([label, value]) =>
            `<strong>${label}:</strong> ${multilineHtml(value)}`
        )
        .join("<br />")
    );
  });
  const noFiles = "No files were uploaded.";
  sections += sectionHtml(
    filesHeading,
    fileRows.length ? fileRows.join("") : rowHtml("Files", noFiles)
  );
  if (!assets.length) textSections.push(noFiles);
  textSections.push(`Open authenticated dashboard:\n${link}`, PRIVACY_NOTICE);

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Peplogix partnership inquiry</title></head>
<body style="margin:0;padding:0;background-color:#F3F6F7;font-family:Arial,Helvetica,sans-serif;color:#003F6A;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background-color:#F3F6F7;"><tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;border-collapse:collapse;background-color:#FFFFFF;border-top:5px solid #D8603D;">
<tr><td style="padding:32px 32px 22px;border-bottom:1px solid #E7ECEF;"><p style="margin:0 0 22px;font-size:18px;font-weight:700;letter-spacing:0.12em;color:#003F6A;">PEPLOGIX</p><p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;color:#D8603D;">PARTNER RELATIONS</p><h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;color:#003F6A;">New partnership inquiry</h1><p style="margin:0;font-size:17px;line-height:1.5;color:#003F6A;overflow-wrap:anywhere;">${multilineHtml(data.company)}</p></td></tr>
<tr><td style="padding:0 32px 28px;">${sections}</td></tr>
<tr><td style="padding:4px 32px 32px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="#D8603D" style="background-color:#D8603D;border-radius:4px;"><a href="${escapeHtml(link)}" style="display:inline-block;padding:15px 22px;color:#FFFFFF;background-color:#D8603D;font-size:14px;font-weight:700;text-decoration:none;border-radius:4px;">Open authenticated dashboard</a></td></tr></table><p style="margin:20px 0 0;font-size:12px;line-height:1.7;color:#526572;">${escapeHtml(PRIVACY_NOTICE)}</p></td></tr>
</table></td></tr></table>
</body></html>`;

  return { subject, html, text: textSections.join("\n\n"), reply_to };
}

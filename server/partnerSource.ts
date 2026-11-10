import type { Request } from "express";

/** Source attribution is informational; it is never an authentication decision. */
export const PARTNER_SOURCE_DOMAINS = [
  "weg.partners.peplogix.com",
  "partners.peplogix.com",
  "jvega.partners.peplogix.com",
  "miked.partners.peplogix.com",
  "eric.partners.peplogix.com",
] as const;

const allowedDomains = new Set<string>(PARTNER_SOURCE_DOMAINS);
const unsafeCharacters = /[\s\\\p{Cc}\p{Cf}]/u;

export function normalizePartnerSourceDomain(value: unknown): string | null {
  if (typeof value !== "string" || unsafeCharacters.test(value)) return null;
  const domain = value.toLowerCase();
  return allowedDomains.has(domain) ? domain : null;
}

function sourceFromHost(value: unknown): string | null {
  if (typeof value !== "string" || unsafeCharacters.test(value)) return null;
  // Standard web ports are accepted; delimiters, URL credentials and lists are not.
  const host = value.match(/^([a-zA-Z0-9.-]+)(?::(?:80|443))?$/)?.[1];
  return normalizePartnerSourceDomain(host);
}

function sourceFromUrl(value: unknown, isOrigin: boolean): string | null {
  if (
    typeof value !== "string" ||
    value.length > 8192 ||
    unsafeCharacters.test(value) ||
    !/^https:\/\//i.test(value)
  )
    return null;
  try {
    const url = new URL(value);
    if (
      url.username ||
      url.password ||
      url.port ||
      (isOrigin && (url.pathname !== "/" || url.search || url.hash))
    )
      return null;
    return normalizePartnerSourceDomain(url.hostname);
  } catch {
    return null;
  }
}

/**
 * Relative form API calls retain their public Host on Vercel. Prefer it over
 * caller-controlled Origin/Referer. Only when a proxy supplies another Host do
 * we fall back to an exact allowlisted HTTPS page origin or referrer. Deliberately
 * ignore X-Forwarded-Host and never derive dashboard/file links from this metadata.
 */
export function partnerSourceDomain(
  req: Pick<Request, "headers">
): string | null {
  const headers = req.headers ?? {};
  return (
    sourceFromHost(headers.host) ??
    sourceFromUrl(headers.origin, true) ??
    sourceFromUrl(headers.referer, false)
  );
}

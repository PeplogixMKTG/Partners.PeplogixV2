import { describe, expect, it } from "vitest";
import {
  PARTNER_SOURCE_DOMAINS,
  normalizePartnerSourceDomain,
  partnerSourceDomain,
} from "./partnerSource";

describe("partner submission source domain", () => {
  it.each(PARTNER_SOURCE_DOMAINS)(
    "captures %s from the actual Host",
    domain => {
      expect(partnerSourceDomain({ headers: { host: domain } })).toBe(domain);
      expect(
        partnerSourceDomain({
          headers: { host: domain.toUpperCase() + ":443" },
        })
      ).toBe(domain);
      expect(normalizePartnerSourceDomain(domain.toUpperCase())).toBe(domain);
    }
  );

  it.each(PARTNER_SOURCE_DOMAINS)(
    "can recover %s when an internal proxy Host is present",
    domain => {
      expect(
        partnerSourceDomain({
          headers: {
            host: "deployment.vercel.app",
            origin: `https://${domain}`,
          },
        })
      ).toBe(domain);
      expect(
        partnerSourceDomain({
          headers: {
            host: "localhost:3000",
            referer: `https://${domain}/?utm_source=example#inquiry`,
          },
        })
      ).toBe(domain);
    }
  );

  it("prefers the actual known Host over conflicting origin/referrer and ignores forwarded host", () => {
    expect(
      partnerSourceDomain({
        headers: {
          host: "weg.partners.peplogix.com",
          origin: "https://eric.partners.peplogix.com",
          referer: "https://jvega.partners.peplogix.com/",
          "x-forwarded-host": "miked.partners.peplogix.com",
        },
      })
    ).toBe("weg.partners.peplogix.com");
    expect(
      partnerSourceDomain({
        headers: {
          host: "unknown.example",
          "x-forwarded-host": "weg.partners.peplogix.com",
        },
      })
    ).toBeNull();
  });

  it.each([
    "partners.peplogix.com.attacker.example",
    "attacker.partners.peplogix.com",
    "partners.peplogix.com,weg.partners.peplogix.com",
    "partners.peplogix.com\r\nBcc: attacker@example.com",
    "https://partners.peplogix.com",
    "user@partners.peplogix.com",
    "partners.peplogix.com/path",
    "partners.peplogix.com:1234",
    " partners.peplogix.com",
    "partners.peplogix.com\\evil",
    "<script>alert(1)</script>",
  ])("does not attribute unsafe or unknown host %j", host => {
    expect(partnerSourceDomain({ headers: { host } })).toBeNull();
    expect(normalizePartnerSourceDomain(host)).toBeNull();
  });

  it.each([
    "http://partners.peplogix.com",
    "https://partners.peplogix.com.attacker.example",
    "https://user:password@partners.peplogix.com",
    "https://partners.peplogix.com:444",
    "https://partners.peplogix.com,https://weg.partners.peplogix.com",
    "https://partners.peplogix.com\r\nBcc: attacker@example.com",
    "https://partners.peplogix.com\\@attacker.example",
  ])("rejects unsafe URL attribution %j", value => {
    expect(
      partnerSourceDomain({ headers: { origin: value, referer: value } })
    ).toBeNull();
  });

  it("does not treat a non-origin URL as an Origin", () => {
    expect(
      partnerSourceDomain({
        headers: { origin: "https://partners.peplogix.com/path" },
      })
    ).toBeNull();
    expect(
      partnerSourceDomain({
        headers: { origin: "https://partners.peplogix.com/?token=secret" },
      })
    ).toBeNull();
    expect(
      partnerSourceDomain({
        headers: { origin: "https://partners.peplogix.com/#fragment" },
      })
    ).toBeNull();
  });

  it("records unknown/missing source as unavailable rather than inventing a source", () => {
    expect(partnerSourceDomain({ headers: {} })).toBeNull();
    expect(normalizePartnerSourceDomain(undefined)).toBeNull();
    expect(normalizePartnerSourceDomain(["partners.peplogix.com"])).toBeNull();
  });
});

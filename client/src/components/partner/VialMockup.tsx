import { useState, type CSSProperties } from "react";
import { FlaskConical, Pill } from "lucide-react";
import { DEFAULT_BRAND_COLORS } from "@shared/brand";
import "./product-preview.css";

interface VialMockupProps {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  colorsNotFinal: boolean;
}

const packaging = {
  vial: {
    image: "/manus-storage/reference-vial-transparent-v5_18d10a91.webp",
    width: 858,
    height: 1832,
    name: "Clinical vial",
    sampleProduct: "BPC-157",
  },
  capsules: {
    image: "/manus-storage/capsule-bottle-preview-v2_41946d5a.webp",
    width: 1000,
    height: 1250,
    name: "Capsule bottle",
    sampleProduct: "DIHEXA",
  },
} as const;

function readableInk(hex: string) {
  const channels = [1, 3, 5].map(offset => {
    const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = channels.reduce(
    (sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index],
    0
  );
  return luminance > 0.179 ? "#101C27" : "#FFFFFF";
}

/** The reference label is illustrative only, not an approved product specification. */
export function VialMockup({
  logoUrl,
  primaryColor,
  secondaryColor,
  accentColor,
  colorsNotFinal,
}: VialMockupProps) {
  const [format, setFormat] = useState<keyof typeof packaging>("vial");
  const colors = colorsNotFinal
    ? DEFAULT_BRAND_COLORS
    : { primaryColor, secondaryColor, accentColor };
  const product = packaging[format];
  const customProductColors =
    colors.primaryColor.toLowerCase() !==
      DEFAULT_BRAND_COLORS.primaryColor.toLowerCase() ||
    colors.secondaryColor.toLowerCase() !==
      DEFAULT_BRAND_COLORS.secondaryColor.toLowerCase();
  const customAccent =
    colors.accentColor.toLowerCase() !==
    DEFAULT_BRAND_COLORS.accentColor.toLowerCase();

  return (
    <div className="product-preview">
      <div
        className="packaging-switch"
        role="group"
        aria-label="Packaging preview"
      >
        <button
          type="button"
          aria-pressed={format === "vial"}
          onClick={() => setFormat("vial")}
        >
          <FlaskConical aria-hidden="true" /> Clinical vial
        </button>
        <button
          type="button"
          aria-pressed={format === "capsules"}
          onClick={() => setFormat("capsules")}
        >
          <Pill aria-hidden="true" /> Capsule bottle
        </button>
      </div>
      <figure
        className="vial-mockup product-mockup"
        data-package={format}
        style={
          {
            "--vial-primary": colors.primaryColor,
            "--vial-secondary": colors.secondaryColor,
            "--vial-accent": colors.accentColor,
            "--vial-on-primary": readableInk(colors.primaryColor),
          } as CSSProperties
        }
        aria-label={`Live visual branding mockup on a ${product.name.toLowerCase()}`}
      >
        <div className="product-stage">
          <div
            className={format === "vial" ? "reference-vial" : "capsule-scene"}
          >
            <img
              className="product-photo"
              src={product.image}
              alt={
                format === "vial"
                  ? "Reference-matched clinical vial with broad gray cap, silver crimp, clear glass, BPC-157 example label, and a blank white logo area"
                  : "Reference-matched capsule bottle with a customizable white label"
              }
              width={product.width}
              height={product.height}
              loading="lazy"
              decoding="async"
            />
            {format === "vial" ? (
              <>
                {logoUrl && (
                  <img
                    className="reference-vial__logo vial-mockup__logo"
                    src={logoUrl}
                    alt="Your uploaded logo printed in the clinical vial's white logo area"
                  />
                )}
                {customProductColors && (
                  <div className="reference-vial__band">
                    {product.sampleProduct}
                  </div>
                )}
                {customAccent && (
                  <div className="reference-vial__detail">10 MG</div>
                )}
              </>
            ) : (
              <div className="product-label">
                <div
                  className="product-label__logo-wrap"
                  data-empty={!logoUrl}
                  aria-label={!logoUrl ? "Blank white logo area" : undefined}
                >
                  {logoUrl && (
                    <img
                      className="vial-mockup__logo"
                      src={logoUrl}
                      alt="Your uploaded logo on the capsule bottle label"
                    />
                  )}
                </div>
                <div className="product-label__collection">
                  {product.sampleProduct}
                </div>
                <div className="product-label__detail">LABEL CONCEPT</div>
                <div className="product-label__research">RESEARCH USE ONLY</div>
                <div className="product-label__footer">Visual concept only</div>
              </div>
            )}
          </div>
        </div>
        <figcaption aria-live="polite">
          <span className="vial-mockup__live-dot" /> {product.name} · live
          concept
        </figcaption>
      </figure>
    </div>
  );
}

export default VialMockup;

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
    image: "/manus-storage/clinical-vial-preview-v2_b0774c91.webp",
    name: "Clinical vial",
    sampleProduct: "BPC-157",
  },
  capsules: {
    image: "/manus-storage/capsule-bottle-preview-v2_41946d5a.webp",
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

/** Live branding layout, not a dosage, purity claim, or approved product specification. */
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
          <img
            className="product-photo"
            src={product.image}
            alt={`Reference-matched ${product.name.toLowerCase()} packaging with a customizable white label`}
            width={1000}
            height={1250}
            loading="lazy"
            decoding="async"
          />
          <div className="product-label">
            <div className="product-label__logo-wrap">
              {logoUrl ? (
                <img
                  className="vial-mockup__logo"
                  src={logoUrl}
                  alt={`Your uploaded logo on the ${product.name.toLowerCase()} label`}
                />
              ) : (
                <span
                  className="vial-mockup__placeholder"
                  aria-label="Your logo here"
                >
                  YOUR
                  <br />
                  LOGO HERE
                </span>
              )}
            </div>
            <div className="product-label__collection">
              {product.sampleProduct}
            </div>
            <div className="product-label__detail">LABEL CONCEPT</div>
            <div className="product-label__research">RESEARCH USE ONLY</div>
            <div className="product-label__footer">Visual concept only</div>
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

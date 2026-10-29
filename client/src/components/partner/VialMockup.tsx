import { useState, type CSSProperties } from "react";
import { FlaskConical, Pill } from "lucide-react";
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
    collection: "VIAL COLLECTION",
  },
  capsules: {
    image: "/manus-storage/capsule-bottle-preview-v2_41946d5a.webp",
    name: "Capsule bottle",
    collection: "CAPSULE COLLECTION",
  },
} as const;

/** Interactive branding concepts based on the owner's actual packaging references. */
export function VialMockup({
  logoUrl,
  primaryColor,
  secondaryColor,
  accentColor,
  colorsNotFinal,
}: VialMockupProps) {
  const [format, setFormat] = useState<keyof typeof packaging>("vial");
  const colors = colorsNotFinal
    ? { primary: "#101849", secondary: "#217f8c", accent: "#d2654a" }
    : { primary: primaryColor, secondary: secondaryColor, accent: accentColor };
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
            "--vial-primary": colors.primary,
            "--vial-secondary": colors.secondary,
            "--vial-accent": colors.accent,
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
                <span className="vial-mockup__placeholder">YOUR BRAND</span>
              )}
            </div>
            <div className="product-label__collection">
              {product.collection}
            </div>
            <div className="product-label__detail">
              YOUR IDENTITY. YOUR COLLECTION.
            </div>
            <div className="product-label__footer">BRANDING CONCEPT</div>
            <div className="product-label__stripe" />
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

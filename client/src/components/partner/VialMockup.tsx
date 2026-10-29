interface VialMockupProps {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  colorsNotFinal: boolean;
}

/** A visual-only concept preview, intentionally not a packaging specification. */
export function VialMockup({
  logoUrl,
  primaryColor,
  secondaryColor,
  accentColor,
  colorsNotFinal,
}: VialMockupProps) {
  const colors = colorsNotFinal
    ? { primary: "#101849", secondary: "#217f8c", accent: "#d2654a" }
    : { primary: primaryColor, secondary: secondaryColor, accent: accentColor };

  return (
    <figure
      className="vial-mockup"
      style={
        {
          "--vial-primary": colors.primary,
          "--vial-secondary": colors.secondary,
          "--vial-accent": colors.accent,
        } as React.CSSProperties
      }
      aria-label="Live visual branding mockup"
    >
      <div className="vial-mockup__glow" aria-hidden="true" />
      <div className="vial-mockup__vial" aria-hidden="true">
        <div className="vial-mockup__cap">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="vial-mockup__glass-highlight" />
        <div className="vial-mockup__solution" />
        <div className="vial-mockup__label">
          <div className="vial-mockup__label-top">
            <span className="vial-mockup__dot" />
            <span>RESEARCH SERIES</span>
          </div>
          <div className="vial-mockup__logo-wrap">
            {logoUrl ? (
              <img
                className="vial-mockup__logo"
                src={logoUrl}
                alt="Your uploaded logo on the vial label"
              />
            ) : (
              <span className="vial-mockup__placeholder">YOUR BRAND</span>
            )}
          </div>
          <div className="vial-mockup__label-rule" />
          <div className="vial-mockup__label-bottom">
            <span>BRAND CONCEPT</span>
            <span>VISUAL ONLY</span>
          </div>
        </div>
        <div className="vial-mockup__base" />
      </div>
      <figcaption>
        <span className="vial-mockup__live-dot" /> Live label concept
      </figcaption>
    </figure>
  );
}

export default VialMockup;

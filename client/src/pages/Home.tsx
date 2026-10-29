import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Check,
  FlaskConical,
  Globe2,
  Layers3,
  LockKeyhole,
  PackageCheck,
  Palette,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import PartnerInquiry from "@/components/partner/PartnerInquiry";
import "./hero-products.css";

const opportunities = [
  {
    icon: Boxes,
    title: "Wholesale supply",
    text: "The products you need. The flexibility to grow. Supply your business with Peplogix research products.",
    tag: "SUPPLY YOUR BUSINESS",
  },
  {
    icon: Palette,
    title: "Your label. Our products.",
    text: "Put your identity front and center with white-label products made to carry your brand.",
    tag: "MAKE IT YOURS",
  },
  {
    icon: Globe2,
    title: "A storefront of your own",
    text: "Bring your brand online with a custom-branded storefront, product catalog, and connected experience.",
    tag: "BUILD YOUR PLATFORM",
  },
  {
    icon: Truck,
    title: "Dropshipping, simplified",
    text: "Focus on building your business. Explore direct-to-customer fulfillment without holding inventory.",
    tag: "SELL WITHOUT THE STORAGE",
  },
  {
    icon: PackageCheck,
    title: "Fulfillment that fits",
    text: "From inventory storage to pick, pack, and shipping, find the operational support your business needs.",
    tag: "STREAMLINE YOUR OPERATIONS",
  },
  {
    icon: Layers3,
    title: "One connected solution",
    text: "Combine wholesale supply and your own storefront for a partnership built around the bigger picture.",
    tag: "BRING IT ALL TOGETHER",
  },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#inquiry">
        Skip to partnership inquiry
      </a>
      <header className="site-header">
        <div className="page-wrap nav-inner">
          <a
            className="brand-lockup"
            href="#"
            aria-label="Peplogix Partners home"
          >
            <img src="/brand/peplogix-logo.webp" alt="Peplogix peptides" />
            <span className="brand-separator" />
            <span className="partner-word">PARTNERS</span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#opportunities">Partnership opportunities</a>
            <a href="#how-it-works">How it works</a>
          </nav>
          <a className="button button-small" href="#inquiry">
            Let’s build together <ArrowUpRight size={16} />
          </a>
        </div>
      </header>

      <main>
        <section className="hero-section hero-section--branded">
          <div className="page-wrap hero-layout">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="little-line" /> THE PEPLOGIX PARTNER EXPERIENCE
              </div>
              <h1>
                Build Your Brand
                <br />
                With <span>Peplogix.</span>
              </h1>
              <p className="hero-tagline">
                Your products. Your brand. Your platform.
              </p>
              <p className="hero-description">
                From wholesale supply and custom-branded products to your own
                storefront and seamless fulfillment. Let’s build a partnership
                around your business.
              </p>
              <a className="button hero-button" href="#inquiry">
                Start Your Partnership Inquiry <ArrowUpRight size={18} />
              </a>
              <div className="hero-note">
                <LockKeyhole size={13} /> A simple inquiry. A conversation about
                what’s possible.
              </div>
              <div className="hero-proof">
                <span>
                  <Check size={15} /> Built around your brand
                </span>
                <span>
                  <Check size={15} /> Designed to grow with you
                </span>
              </div>
            </div>
            <div className="hero-product-visual">
              <div className="hero-product-kicker">
                <span className="teal-dot" /> YOUR VISION. OUR FOUNDATION.
              </div>
              <img
                className="hero-product-artwork"
                src="/manus-storage/ClinicalPeptideProductTrioMockup_52aebc52.webp"
                alt="Your-logo-here Peplogix packaging: clinical peptide vial, white capsule bottle, and glass serum bottle with dropper"
                width={1672}
                height={941}
                fetchPriority="high"
                decoding="async"
              />
              <div className="hero-product-callout">
                <div className="callout-icon">
                  <Palette size={18} />
                </div>
                <div>
                  <span>YOUR IDENTITY. REIMAGINED.</span>
                  <strong>Your brand belongs here.</strong>
                </div>
                <ArrowUpRight size={16} aria-hidden="true" />
              </div>
              <p className="hero-product-caption">
                VIALS. CAPSULES. SERUMS. ALL YOURS TO REIMAGINE.
              </p>
            </div>
          </div>
        </section>
        <div className="capability-band">
          <div className="page-wrap capability-inner">
            <span className="band-intro">
              Your ambition.
              <br />
              <strong>Our capabilities.</strong>
            </span>
            <span>
              <FlaskConical /> Research products
            </span>
            <span>
              <Palette /> Custom branding
            </span>
            <span>
              <ShoppingBag /> Branded storefronts
            </span>
            <span>
              <PackageCheck /> Connected fulfillment
            </span>
          </div>
        </div>

        <section id="opportunities" className="opportunities section-space">
          <div className="page-wrap">
            <div className="section-heading">
              <div>
                <div className="eyebrow">MORE WAYS TO BUILD TOGETHER</div>
                <h2>
                  A partnership that
                  <br />
                  fits <span>your next move.</span>
                </h2>
              </div>
              <p>
                One starting point. Multiple possibilities.
                <br />
                Choose the support you need today, with room
                <br className="desktop-break" /> for where you want to go
                tomorrow.
              </p>
            </div>
            <div className="opportunity-grid">
              {opportunities.map(({ icon: Icon, title, text, tag }, i) => (
                <a href="#inquiry" className="opportunity-card" key={title}>
                  <div className="opportunity-top">
                    <div className="opportunity-icon">
                      <Icon size={23} strokeWidth={1.5} />
                    </div>
                    <span className="opportunity-number">0{i + 1}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <div className="opportunity-bottom">
                    <span>{tag}</span>
                    <ArrowUpRight size={17} />
                  </div>
                </a>
              ))}
            </div>
            <div className="other-partnership">
              <span>
                Have something else in mind?{" "}
                <strong>We’re open to the conversation.</strong>
              </span>
              <a href="#inquiry">
                Tell us your idea <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="process-section">
          <div className="page-wrap process-layout">
            <div className="process-intro">
              <div className="eyebrow">A CLEAR PATH FORWARD</div>
              <h2>
                Big possibilities.
                <br />
                Simple first steps.
              </h2>
              <p>
                You bring the vision.
                <br />
                We’ll help explore the way forward.
              </p>
            </div>
            <div className="process-steps">
              {[
                [
                  "01",
                  "Tell us about your business",
                  "Share a little about your business, your goals, and what you’re looking to build.",
                ],
                [
                  "02",
                  "Shape your partnership",
                  "Choose the services you need and explore how your own branding could look.",
                ],
                [
                  "03",
                  "Let’s start a conversation",
                  "Our team reviews your inquiry and reaches out to discuss the next steps.",
                ],
              ].map(([num, title, text]) => (
                <div className="process-step" key={num}>
                  <span className="step-index">{num}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                  {num !== "03" && <div className="step-connector" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="inquiry" className="inquiry-section section-space">
          <div className="page-wrap">
            <div className="inquiry-intro">
              <div className="eyebrow">
                <span className="little-line" /> LET’S BUILD SOMETHING TOGETHER
              </div>
              <h2>
                Your next chapter
                <br />
                starts <span>right here.</span>
              </h2>
              <p>Tell us what you have in mind. We’ll take it from there.</p>
            </div>
            <PartnerInquiry />
            <div className="inquiry-security">
              <ShieldCheck size={15} /> Your information is shared securely with
              the Peplogix team.
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="page-wrap">
          <div className="footer-main">
            <a href="#" className="footer-logo">
              <img src="/brand/peplogix-logo.webp" alt="Peplogix peptides" />
            </a>
            <p>Your products. Your brand. Your platform.</p>
            <a
              href="https://peplogixpeptide.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore Peplogix <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} Peplogix. All rights reserved.
            </span>
            <span>For business partnership inquiries. Research use only.</span>
            <a href="/dashboard">
              Team access <LockKeyhole size={12} />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

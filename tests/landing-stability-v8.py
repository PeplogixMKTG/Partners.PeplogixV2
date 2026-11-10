from pathlib import Path
from playwright.sync_api import expect, sync_playwright

BASE = "http://localhost:3000"
LOGO = "/brand/peplogix-logo.webp"
HERO = "/brand/peplogix-partner-hero.webp"


def fill_step_one(page, suffix):
    for field, value in {
        "company": f"PEPLOGIX_LANDING_QA_{suffix}",
        "firstName": "Landing",
        "lastName": "Quality",
        "email": f"landing-{suffix.lower()}@example.com",
        "phone": "2025550188",
    }.items():
        page.locator(f"#{field}").fill(value)
    page.locator('input[name="hasWebsite"][value="No"]').check(force=True)
    page.locator('input[name="businessTypes"][value="Ecommerce Brand"]').check(force=True)


with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path="/usr/bin/chromium", headless=True, args=["--no-sandbox"]
    )
    for name, viewport, expected_logo_width, expected_header_height in [
        ("desktop", {"width": 1440, "height": 1000}, 151, 98),
        ("mobile", {"width": 390, "height": 844}, 116, 80),
    ]:
        page = browser.new_page(viewport=viewport, is_mobile=name == "mobile", has_touch=name == "mobile")
        page.add_init_script(
            """
            window.__landingQa = { errors: [], layouts: [] };
            window.addEventListener('error', event => window.__landingQa.errors.push(event.message));
            """
        )
        page.goto(BASE, wait_until="commit")
        page.wait_for_function("document.querySelector('.boot-brand img, .brand-lockup img') !== null")
        first_paint = page.evaluate(
            """() => {
              const logo = document.querySelector('.boot-brand img, .brand-lockup img');
              const header = document.querySelector('.boot-header, .site-header');
              return {
                logo: logo?.getBoundingClientRect().toJSON(),
                header: header?.getBoundingClientRect().toJSON(),
                src: logo?.getAttribute('src'),
              };
            }"""
        )
        assert first_paint["src"] == LOGO, first_paint
        assert first_paint["logo"]["width"] <= expected_logo_width + 1, first_paint
        assert abs(first_paint["header"]["height"] - expected_header_height) < 1, first_paint

        page.wait_for_selector(".site-header")
        expect(page.locator(".brand-lockup img")).to_have_attribute("src", LOGO)
        expect(page.locator(".brand-lockup img")).to_have_attribute("width", "1600")
        expect(page.locator(".brand-lockup img")).to_have_attribute("height", "684")
        final = page.evaluate(
            """() => {
              const logo = document.querySelector('.brand-lockup img').getBoundingClientRect().toJSON();
              const header = document.querySelector('.site-header').getBoundingClientRect().toJSON();
              return {logo, header, images: [...document.images].map(image => ({src: new URL(image.src).pathname, complete: image.complete}))};
            }"""
        )
        assert abs(final["logo"]["width"] - expected_logo_width) < 1, final
        assert abs(final["header"]["height"] - expected_header_height) < 1, final
        assert abs(first_paint["logo"]["width"] - final["logo"]["width"]) < 1, {
            "first": first_paint,
            "final": final,
        }
        assert any(image["src"] == HERO and image["complete"] for image in final["images"]), final

        # Header and hero CTAs remain functional at both viewports.
        page.get_by_role("link", name="Let’s build together").click()
        expect(page.locator("#partner-form-title")).to_be_visible()
        page.evaluate("window.scrollTo(0, 0)")
        page.get_by_role("link", name="Start Your Partnership Inquiry").click()
        expect(page.locator("#partner-form-title")).to_be_visible()
        fill_step_one(page, name)
        page.get_by_role("button", name="Continue", exact=True).click()
        expect(page.locator("#partner-form-title")).to_have_text("How Would You Like to Partner With Peplogix?")
        page.locator(".partner-option-card", has_text="Wholesale and Contract Manufacturing").locator("input").check(force=True)
        page.locator('input[name="purchaseMode"][value="Bulk Wholesale Orders"]').check(force=True)
        page.locator('input[name="initialSize"][value="Small Initial Order"]').check(force=True)
        page.locator("#productSearch").fill("KLOW")
        expect(page.locator(".partner-product-option")).to_have_count(1)
        page.locator(".partner-product-option", has_text="KLOW").locator("input").check(force=True)
        expect(page.locator(".partner-product-chip")).to_contain_text("KLOW")
        page.get_by_role("button", name="Continue", exact=True).click()
        expect(page.locator("#partner-form-title")).to_have_text("Make It Your Brand.")
        page.get_by_role("button", name="Capsule bottle", exact=True).click()
        expect(page.locator(".product-mockup")).to_have_attribute("data-package", "capsules")
        page.get_by_role("button", name="Clinical vial", exact=True).click()
        expect(page.locator(".product-mockup")).to_have_attribute("data-package", "vial")
        page.get_by_label("Primary Brand Color", exact=True).fill("#D8603D")
        expect(page.locator(".vial-mockup")).to_have_css("--vial-primary", "#d8603d")
        page.get_by_role("button", name="Reset mockup", exact=True).click()
        expect(page.get_by_label("Primary Brand Color", exact=True)).to_have_value("#003f6a")
        page.get_by_role("button", name="Back", exact=True).click()
        expect(page.locator("#partner-form-title")).to_have_text("How Would You Like to Partner With Peplogix?")
        assert page.evaluate("document.documentElement.scrollWidth") == viewport["width"]
        assert not page.evaluate("window.__landingQa.errors"), page.evaluate("window.__landingQa.errors")
        page.close()
    browser.close()

print("Landing first-paint logo stability and responsive form interactions passed.")

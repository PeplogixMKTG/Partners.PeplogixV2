"""Safe UI checks: no real inquiry, upload, database write or email is created."""
import json
from pathlib import Path
from playwright.sync_api import expect, sync_playwright

BASE = "http://localhost:3000"
NAMES = [
    "Turnkey Business",
    "Product Supply and 3PL Fulfilment Only",
    "Wholesale and Contract Manufacturing",
    "503a FDA Approved Products and Medical Supplies",
    "Education and Training",
    "Payment Processing",
    "Marketing and Compliance Resources",
]
DESCRIPTIONS = [
    "Get a custom-branded e-commerce website with a full storefront and built-in merchant processing. Our inventory and 3PL logistics support your brand behind the scenes. Add our optional marketing package, led by a marketing professional with 15 years of experience, to leverage your existing network and drive revenue compliantly.",
    "Already have a website but need products? We can supply your products and handle all of your fulfillment. Our inventory and 3PL logistics team stores, packs, and ships every order on your behalf, so you can focus on growing your brand.",
    "Stock your clinic, spa, or retail shelves with our full product line at tiered wholesale pricing. Ready to launch your own formulas? Our contract manufacturing service takes your product from formulation to finished, labeled goods, with private-label packaging and quality-controlled production, all at scale.",
    "Give your patients access to compounded medications prepared by licensed 503A pharmacy partners and dispensed under valid, patient-specific prescriptions. Pair them with the medical supplies your practice relies on, such as syringes, alcohol prep pads, and other clinical essentials, all ordered through one convenient portal and shipped directly to you or your patients.",
    "Learn the business from people who have built it. Our education hub includes quick-start guides, video training, and live onboarding sessions covering product knowledge, dosing protocols for licensed providers, compliant marketing, and sales best practices. Ongoing courses and certifications keep you and your team current as the industry evolves.",
    "Get reliable merchant processing built for our industry. We connect you with processing partners who understand your products, so you can accept cards and online payments with fewer holds, freezes, and declined applications.",
    "Grow without the guesswork. Get ready-to-use marketing assets, social media templates, email campaigns, and compliance guidance that helps your messaging stay within FDA and FTC guidelines.",
]


def radio(page, name, value):
    page.locator(f'input[name="{name}"][value="{value}"]').check(force=True)


def next_step(page):
    page.get_by_role("button", name="Continue", exact=True).click()


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/usr/bin/chromium", headless=True, args=["--no-sandbox"])
    for name, width, height in [("desktop", 1440, 1000), ("tablet", 768, 1024), ("mobile", 375, 812)]:
        page = browser.new_page(viewport={"width": width, "height": height})
        errors = []
        submitted = []
        page.on("pageerror", lambda error: errors.append(str(error)))

        def mock_submission(route):
            assert route.request.method == "POST"
            submitted.append(route.request.post_data_json)
            route.fulfill(status=201, content_type="application/json", body=json.dumps({"id": "ui-check-not-persisted", "submittedAt": "2026-11-10T22:00:00.000Z"}))

        page.route("**/api/partner/inquiries", mock_submission)
        page.goto(BASE, wait_until="domcontentloaded")
        page.wait_for_selector("#company")
        for field, value in {"company": f"UI CHECK ONLY {name}", "firstName": "UI", "lastName": "Check", "email": "ui-check@example.com", "phone": "2025550147"}.items():
            page.locator(f"#{field}").fill(value)
        radio(page, "hasWebsite", "No")
        page.locator('input[name="businessTypes"][value="Ecommerce Brand"]').check(force=True)
        next_step(page)

        cards = page.locator(".partner-option-card")
        expect(cards).to_have_count(7)
        assert cards.locator("strong").all_text_contents() == NAMES
        assert cards.locator(".partner-option-card__content > span:first-of-type").all_text_contents() == DESCRIPTIONS
        expect(page.locator(".partner-option-card__clarification")).to_contain_text("503A compounded medications are not FDA-approved")
        assert cards.locator(".partner-option-card__icon svg").count() == 7
        boxes = [cards.nth(i).bounding_box() for i in range(7)]
        for i, box in enumerate(boxes):
            assert abs(box["x"] - boxes[0]["x"]) < 1
            assert abs(box["width"] - boxes[0]["width"]) < 1
            if i:
                assert box["y"] >= boxes[i - 1]["y"] + boxes[i - 1]["height"], boxes
        assert page.evaluate("document.documentElement.scrollWidth") == width

        # A general-only service proceeds to review without irrelevant requirements.
        page.get_by_role("checkbox", name="Education and Training", exact=True).check(force=True)
        next_step(page)
        expect(page.locator("#partner-form-title")).to_have_text("You're One Step Closer.")
        expect(page.locator(".partner-summary-card").filter(has_text="Partnership Preferences")).to_contain_text("Education and Training")
        page.get_by_role("button", name="Back", exact=True).click()
        expect(page.get_by_role("checkbox", name="Education and Training", exact=True)).to_be_checked()

        # Choose every new service and exercise all relevant pre-existing questions.
        for service in NAMES:
            page.get_by_role("checkbox", name=service, exact=True).check(force=True)
        next_step(page)
        expect(page.locator("#partner-form-title")).to_have_text("How Would You Like to Partner With Peplogix?")
        expect(page.locator("#storefrontType-error")).to_be_visible()
        radio(page, "storefrontType", "A fully custom ecommerce website")
        radio(page, "ownsDomain", "No")
        radio(page, "migration", "No")
        page.locator('input[name="features"][value="Ecommerce Checkout"]').check(force=True)
        radio(page, "dropshipMode", "White-label packaging")
        radio(page, "ecommerce", "Yes")
        radio(page, "platform", "Shopify")
        page.locator('input[name="fulfillmentServices"][value="Pick & Pack"]').check(force=True)
        radio(page, "ownInventory", "No")
        radio(page, "purchaseMode", "Bulk Wholesale Orders")
        radio(page, "initialSize", "Small Initial Order")
        page.locator("#needs").fill("All seven current partnership interests")
        next_step(page)
        expect(page.locator("#partner-form-title")).to_have_text("Make It Your Brand.")
        page.get_by_role("button", name="Capsule bottle", exact=True).click()
        expect(page.locator(".product-mockup")).to_have_attribute("data-package", "capsules")
        page.get_by_role("button", name="Clinical vial", exact=True).click()
        expect(page.locator(".product-mockup")).to_have_attribute("data-package", "vial")
        next_step(page)
        expect(page.locator("#partner-form-title")).to_have_text("You're One Step Closer.")
        summary = page.locator(".partner-summary-card").filter(has_text="Partnership Preferences")
        for service in NAMES:
            expect(summary).to_contain_text(service)
        page.get_by_role("button", name="Back", exact=True).click()
        page.get_by_role("button", name="Back", exact=True).click()
        for service in NAMES:
            expect(page.get_by_role("checkbox", name=service, exact=True)).to_be_checked()
        assert page.locator('input[name="platform"][value="Shopify"]').is_checked()
        next_step(page)
        next_step(page)
        page.get_by_role("checkbox").last.check(force=True)
        page.get_by_role("button", name="Submit Partnership Inquiry", exact=True).click()
        expect(page.locator(".partner-success")).to_be_visible()
        assert len(submitted) == 1, submitted
        payload = submitted[0]
        assert len(payload["data"]["partnerships"]) == 7
        assert set(payload["data"]["partnerships"]) == set(NAMES)
        assert payload["data"]["storefrontType"] == "A fully custom ecommerce website"
        assert payload["data"]["platform"] == "Shopify"
        assert payload["data"]["fulfillmentServices"] == ["Pick & Pack"]
        assert payload["data"]["purchaseMode"] == "Bulk Wholesale Orders"
        assert payload["confirmed"] is True
        assert payload["logoId"] is None and payload["assetIds"] == []
        assert page.evaluate("document.documentElement.scrollWidth") == width
        assert not errors, errors
        print(f"{name}: seven exact options/full descriptions, one column, general skip, all conditionals, state preservation and intercepted submit passed", flush=True)
        page.close()
    browser.close()
print("No actual submission, upload or email was created.")

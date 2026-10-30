from playwright.sync_api import expect, sync_playwright

BASE = "http://localhost:3000"
EXPECTED = [
    "Reta",
    "Tirz",
    "Sema",
    "KLOW",
    "GLOW",
    "Tesamorelin",
    "TESAMORELIN/IPAMORELIN",
    "CJC-1295 no DAC/IPAMORELIN",
    "BPC-157",
    "TB500",
    "WOLVERINE",
    "GHK-Cu",
    "KPV",
    "Epithalon",
    "NAD+",
    "SEMAX",
    "SELANK",
    "MOTS-C",
    "Capsules",
    "Nasals",
    "Serums",
]
LEGACY = [
    "Reta (GLP-3)",
    "Sema (GLP-1)",
    "Tirz (GLP-2)",
    "Glow",
    "Glutathione",
    "Research Peptides",
    "Nasal Sprays",
    "Other / Not Sure Yet",
]

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path="/usr/bin/chromium", headless=True, args=["--no-sandbox"]
    )
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(BASE, wait_until="domcontentloaded")
    page.wait_for_selector("#company")

    for field, value in {
        "company": "PEPLOGIX_CATALOG_OPTIONS_CHECK",
        "firstName": "Catalog",
        "lastName": "Check",
        "email": "catalog-check@example.com",
        "phone": "2025550147",
    }.items():
        page.locator(f"#{field}").fill(value)
    page.locator('input[name="hasWebsite"][value="No"]').check(force=True)
    page.locator('input[name="businessTypes"][value="Ecommerce Brand"]').check(force=True)
    page.get_by_role("button", name="Continue", exact=True).click()

    names = page.locator(".partner-product-option").evaluate_all(
        "elements => elements.map(element => element.lastElementChild.textContent.trim())"
    )
    assert names == EXPECTED, {"expected": EXPECTED, "actual": names}
    assert all(legacy not in names for legacy in LEGACY), names

    page.locator("#productSearch").fill("CJC-1295 no DAC")
    expect(page.locator(".partner-product-option")).to_have_count(1)
    option = page.locator(
        ".partner-product-option", has_text="CJC-1295 no DAC/IPAMORELIN"
    )
    option.locator("input").check(force=True)
    expect(page.locator(".partner-product-chip")).to_contain_text(
        "CJC-1295 no DAC/IPAMORELIN"
    )

    page.locator("#productSearch").fill("MOTS-C")
    expect(page.locator(".partner-product-option")).to_have_count(1)
    page.locator(".partner-product-option", has_text="MOTS-C").locator("input").check(
        force=True
    )
    selected = page.locator(".partner-product-chip").all_text_contents()
    assert any("CJC-1295 no DAC/IPAMORELIN" in item for item in selected), selected
    assert any("MOTS-C" in item for item in selected), selected

    page.locator("#productSearch").fill("Other / Not Sure Yet")
    expect(page.locator(".partner-product-picker__empty")).to_be_visible()
    assert page.evaluate("document.documentElement.scrollWidth") == 1280
    assert not errors, errors
    browser.close()

print("Catalog replacement, search, selection, and legacy-option removal passed.")

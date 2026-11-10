from playwright.sync_api import sync_playwright, expect
from pathlib import Path
import json

BASE='http://localhost:3000'
OUT=Path('tests/evidence')
OUT.mkdir(parents=True,exist_ok=True)
results=[]


def radio(page,name,value):
    page.locator(f'input[type="radio"][name="{name}"]').filter(has=page.locator(':scope')).count() if False else None
    page.locator(f'input[type="radio"][name="{name}"][value="{value}"]').check(force=True)


def business(page,company):
    for key,value in {'company':company,'firstName':'Portal','lastName':'Test','email':'portal-test@example.com','phone':'+1 202 555 0136'}.items():
        page.locator('#'+key).fill(value)
    radio(page,'hasWebsite','Yes')
    expect(page.locator('#website')).to_be_visible()
    page.locator('#website').fill('https://example.com')
    page.locator('input[name="businessTypes"][value="Ecommerce Brand"]').check(force=True)
    page.locator('input[name="businessTypes"][value="Other"]').check(force=True)
    page.locator('#businessOther').fill('Browser verification business')
    page.get_by_role('button',name='Continue',exact=True).click()
    expect(page.locator('#partner-form-title')).to_contain_text('How Would You Like')


def select_service(page,name):
    page.locator('.partner-option-card').filter(has=page.locator('strong',has_text=name)).filter(has_text=name).first.locator('input').check(force=True)


with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':1000})
    js_errors=[]
    page.on('pageerror',lambda e:js_errors.append(str(e)))
    uploads=[];submissions=[]
    def observe(response):
        if response.url.endswith('/api/partner/upload') and response.status==201:
            uploads.append(response.json()['id'])
        if response.url.endswith('/api/partner/inquiries') and response.request.method=='POST':
            submissions.append({'status':response.status,'body':response.json(),'payload':response.request.post_data_json})
    page.on('response',observe)
    page.goto(BASE)
    page.wait_for_selector('#company')
    page.get_by_role('button',name='Continue',exact=True).click()
    expect(page.locator('#company')).to_have_attribute('aria-invalid','true')
    business(page,'PEPLOGIX_BROWSER_TEST_DESKTOP')
    for s in ['Turnkey Business','Product Supply and 3PL Fulfilment Only','Wholesale and Contract Manufacturing','Marketing and Compliance Resources']:
        select_service(page,s)
    page.locator('#productSearch').fill('BPC')
    page.locator('.partner-product-option',has_text='BPC-157').locator('input').check(force=True)
    page.locator('#productSearch').fill('')
    page.locator('#monthlyVolume').select_option('100–500 Orders')
    page.locator('#needs').fill('Full desktop and mobile workflow verification. Not a real inquiry.')
    radio(page,'storefrontType','A fully custom ecommerce website')
    radio(page,'ownsDomain','Yes')
    page.locator('#domain').fill('example.com')
    radio(page,'migration','Yes')
    page.locator('#migrationUrl').fill('https://example.com')
    page.locator('input[name="features"][value="Custom Branding"]').check(force=True)
    page.locator('input[name="features"][value="Other"]').check(force=True)
    page.locator('#featuresOther').fill('Business account tools')
    radio(page,'dropshipMode','Fulfillment under my own brand')
    radio(page,'ecommerce','Yes')
    radio(page,'platform','Shopify')
    page.locator('input[name="fulfillmentServices"][value="Pick & Pack"]').check(force=True)
    page.locator('input[name="fulfillmentServices"][value="Other"]').check(force=True)
    page.locator('#fulfillmentOther').fill('Custom packing slip')
    radio(page,'ownInventory','Yes')
    radio(page,'purchaseMode','Bulk Wholesale Orders')
    radio(page,'initialSize','Small Initial Order')
    page.get_by_role('button',name='Back',exact=True).click()
    expect(page.locator('#company')).to_have_value('PEPLOGIX_BROWSER_TEST_DESKTOP')
    page.get_by_role('button',name='Continue',exact=True).click()
    expect(page.locator('#domain')).to_have_value('example.com')
    page.get_by_role('button',name='Continue',exact=True).click()
    expect(page.locator('#partner-form-title')).to_have_text('Make It Your Brand.')
    logo=Path('client/public/brand/favicon-64.png')
    page.get_by_label('Upload a logo',exact=True).set_input_files(str(logo))
    expect(page.get_by_text('Uploaded securely',exact=True)).to_be_visible(timeout=15000)
    expect(page.locator('.vial-mockup__logo')).to_be_visible()
    page.get_by_label('Primary Brand Color',exact=True).fill('#6131a6')
    expect(page.locator('.vial-mockup')).to_have_css('--vial-primary','#6131a6')
    page.get_by_label('My brand colors are not finalized yet.',exact=True).check(force=True)
    expect(page.get_by_label('Primary Brand Color',exact=True)).to_be_disabled()
    page.get_by_label('My brand colors are not finalized yet.',exact=True).uncheck(force=True)
    pdf=b'%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n'
    page.get_by_label('Upload additional brand assets',exact=True).set_input_files({'name':'test-brand-guidelines.pdf','mimeType':'application/pdf','buffer':pdf})
    expect(page.locator('.partner-asset-list small')).to_contain_text('Uploaded',timeout=15000)
    page.locator('#brandingInstructions').fill('Use the selected colors. Verification only.')
    page.screenshot(path=str(OUT/'desktop-branding.png'),full_page=True)
    page.get_by_role('button',name='Continue',exact=True).click()
    expect(page.locator('#partner-form-title')).to_have_text("You're One Step Closer.")
    page.get_by_role('button',name='Submit Partnership Inquiry',exact=True).click()
    expect(page.get_by_text('Please confirm that the information is accurate before submitting.',exact=True)).to_be_visible()
    page.locator('.partner-confirm input').check(force=True)
    with page.expect_response(lambda r:r.url.endswith('/api/partner/inquiries') and r.request.method=='POST') as r:
        page.get_by_role('button',name='Submit Partnership Inquiry',exact=True).click()
    assert r.value.status==201,r.value.text()
    expect(page.get_by_text('Your partnership inquiry has been successfully submitted.',exact=True)).to_be_visible()
    assert len(submissions)==1,submissions
    response=page.request.post(BASE+'/api/partner/inquiries',data=submissions[0]['payload'])
    assert response.status==200,response.text()
    assert response.json()==submissions[0]['body']
    assert page.request.get(BASE+'/api/partner/inquiries').status==401
    for asset in uploads:
        assert page.request.get(BASE+'/api/partner/assets/'+asset).status==401
    page.screenshot(path=str(OUT/'desktop-success.png'),full_page=True)
    results.append({'viewport':'desktop','company':'PEPLOGIX_BROWSER_TEST_DESKTOP','inquiry':submissions[0]['body'],'uploads':uploads,'jsErrors':js_errors,'checks':'all conditional services, back preservation, required errors, logo, color, assets, consent, persistence, idempotency, private downloads'})
    page.close()

    page=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    page.goto(BASE);page.wait_for_selector('#company')
    business(page,'PEPLOGIX_BROWSER_TEST_MOBILE')
    select_service(page,'Marketing and Compliance Resources')
    page.locator('.partner-product-option',has_text='Capsules').locator('input').check(force=True)
    page.get_by_role('button',name='Continue',exact=True).click()
    expect(page.locator('#partner-form-title')).to_have_text("You're One Step Closer.")
    expect(page.get_by_text('Brand customization was skipped',exact=False)).to_be_visible()
    assert page.evaluate('document.documentElement.scrollWidth')==390
    page.get_by_role('button',name='Back',exact=True).click()
    expect(page.locator('.partner-option-card',has_text='Marketing and Compliance Resources').locator('input')).to_be_checked()
    page.get_by_role('button',name='Continue',exact=True).click()
    page.locator('.partner-confirm input').check(force=True)
    with page.expect_response(lambda r:r.url.endswith('/api/partner/inquiries') and r.request.method=='POST') as r:
        page.get_by_role('button',name='Submit Partnership Inquiry',exact=True).click()
    assert r.value.status==201,r.value.text()
    expect(page.get_by_text('Your partnership inquiry has been successfully submitted.',exact=True)).to_be_visible()
    page.screenshot(path=str(OUT/'mobile-success.png'),full_page=True)
    results.append({'viewport':'mobile','company':'PEPLOGIX_BROWSER_TEST_MOBILE','inquiry':r.value.json(),'uploads':[],'checks':'touch viewport, branding skip, back preservation, full submission'})
    page.close();browser.close()

(OUT/'results.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))

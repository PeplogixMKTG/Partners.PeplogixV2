from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import json

BASE='https://8328-i9ryv51qk32493ufz3uux-12c66107.us5.manus.computer'
OUT=Path('tests/evidence/v4')
OUT.mkdir(parents=True,exist_ok=True)
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    for name,width,height in [('desktop',1440,1000),('mobile',390,844)]:
        page=browser.new_page(viewport={'width':width,'height':height})
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.goto(BASE,wait_until='domcontentloaded')
        page.wait_for_selector('#company')
        expect(page.locator('.hero-product-artwork')).to_have_attribute('src','/manus-storage/ClinicalPeptideProductTrioMockup_52aebc52.webp')
        for key,value in {'company':'Reference preview check','firstName':'Vial','lastName':'Preview','email':'reference@example.com','phone':'2025550136'}.items():
            page.locator('#'+key).fill(value)
        page.locator('input[name="hasWebsite"][value="No"]').check(force=True)
        page.locator('input[name="businessTypes"][value="Ecommerce Brand"]').check(force=True)
        page.get_by_role('button',name='Continue',exact=True).click()
        page.locator('.partner-option-card',has_text='White-Label Products').locator('input').check(force=True)
        page.get_by_role('button',name='Continue',exact=True).click()
        expect(page.locator('#partner-form-title')).to_have_text('Make It Your Brand.')
        expect(page.locator('.vial-mockup__placeholder')).to_have_count(0)
        expect(page.locator('.reference-vial')).to_have_count(1)
        page.locator('.product-mockup').scroll_into_view_if_needed()
        page.wait_for_function('document.querySelector(".product-photo").complete && document.querySelector(".product-photo").naturalWidth>0')
        expect(page.locator('.reference-vial__logo')).to_have_count(0)
        expect(page.locator('.reference-vial__band')).to_have_count(0)
        image=page.locator('.product-photo').evaluate('(i)=>({natural:i.naturalWidth/i.naturalHeight,rendered:i.clientWidth/i.clientHeight})')
        assert abs(image['natural']-image['rendered'])<.01,image
        page.locator('.partner-mockup-card').screenshot(path=str(OUT/f'{name}-blank-reference-vial.png'))
        page.get_by_label('Primary Brand Color',exact=True).fill('#663399')
        expect(page.locator('.reference-vial__band')).to_have_css('color','rgb(102, 51, 153)')
        if name=='mobile':
            with page.expect_response(lambda response:response.url.endswith('/api/partner/upload') and response.request.method=='POST') as uploaded:
                page.get_by_label('Upload a logo',exact=True).set_input_files('client/public/brand/favicon-64.png')
            assert uploaded.value.status==201
            expect(page.locator('.reference-vial__logo')).to_be_visible()
            page.locator('.partner-mockup-card').screenshot(path=str(OUT/'mobile-uploaded-logo.png'))
            page.get_by_role('button',name='Capsule bottle',exact=True).click()
            expect(page.locator('.vial-mockup__logo')).to_be_visible()
            expect(page.locator('.vial-mockup__placeholder')).to_have_count(0)
            page.get_by_role('button',name='Clinical vial',exact=True).click()
            expect(page.locator('.reference-vial__logo')).to_be_visible()
            with page.expect_response(lambda response:response.request.method=='DELETE' and '/api/partner/upload/' in response.url) as deleted:
                page.get_by_role('button',name='Reset mockup',exact=True).click()
            assert deleted.value.status==204
            expect(page.locator('.reference-vial__logo')).to_have_count(0)
        else:
            page.get_by_role('button',name='Reset mockup',exact=True).click()
        expect(page.locator('.reference-vial__band')).to_have_count(0)
        page.get_by_role('button',name='Capsule bottle',exact=True).click()
        expect(page.locator('.vial-mockup__placeholder')).to_have_count(0)
        expect(page.locator('.product-label__logo-wrap')).to_have_css('border-top-style','none')
        expect(page.locator('.product-label__logo-wrap')).to_have_css('background-color','rgb(255, 255, 255)')
        assert page.evaluate('document.documentElement.scrollWidth')==width
        assert not errors,errors
        results.append({'viewport':name,'sourceAspectPreserved':image,'blankLogoArea':True,'hero':'unchanged','liveColors':'preserved','errors':errors})
        print(name,'passed',flush=True)
        page.close()
    browser.close()
(OUT/'results.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))

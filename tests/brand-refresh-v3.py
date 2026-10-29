from pathlib import Path
import json
from playwright.sync_api import sync_playwright, expect

BASE='https://8328-i9ryv51qk32493ufz3uux-12c66107.us5.manus.computer'
OUT=Path('tests/evidence/v3')
OUT.mkdir(parents=True, exist_ok=True)
results=[]
BLUE='rgb(0, 63, 106)'
ORANGE='rgb(216, 96, 61)'
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    for name,width,height in [('desktop',1440,1000),('tablet',768,1000),('mobile',390,844),('small-mobile',320,844)]:
        page=browser.new_page(viewport={'width':width,'height':height})
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(BASE,wait_until='domcontentloaded')
        page.wait_for_selector('#company')
        page.wait_for_function('document.querySelector(".hero-product-artwork").complete && document.querySelector(".hero-product-artwork").naturalWidth>0')
        page.evaluate('document.fonts.ready')
        expect(page.locator('.hero-product-artwork')).to_have_attribute('src','/manus-storage/ClinicalPeptideProductTrioMockup_52aebc52.webp')
        expect(page.locator('.hero-copy h1')).to_have_css('color',BLUE)
        expect(page.locator('.hero-button')).to_have_css('background-color',ORANGE)
        expect(page.locator('.process-section')).to_have_css('background-color',BLUE)
        expect(page.locator('.capability-band')).to_have_css('background-color',BLUE)
        expect(page.get_by_text('Before you begin.',exact=True)).to_have_count(0)
        metrics=page.evaluate('''() => {
          const image=document.querySelector('.hero-product-artwork');
          const style=getComputedStyle(image);
          const font=s=>parseFloat(getComputedStyle(document.querySelector(s)).fontSize);
          const a=document.querySelector('.inquiry-intro').getBoundingClientRect();
          const b=document.querySelector('.partner-workflow').getBoundingClientRect();
          return {
            scrollWidth:document.documentElement.scrollWidth,
            heroParagraph:font('.hero-description'),
            opportunityParagraph:font('.opportunity-card p'),
            processParagraph:font('.process-step p'),
            inquiryParagraph:font('.partner-form__heading p'),
            heroAspect:image.clientWidth/image.clientHeight,
            sourceAspect:image.naturalWidth/image.naturalHeight,
            heroFit:style.objectFit,
            formGap:b.top-a.bottom,
            opportunitiesBackground:getComputedStyle(document.querySelector('.opportunities')).backgroundColor,
            inquiryBackground:getComputedStyle(document.querySelector('.inquiry-section')).backgroundColor
          };
        }''')
        assert metrics['scrollWidth']==width,metrics
        assert metrics['heroParagraph']>=16,metrics
        assert metrics['opportunityParagraph']>=15,metrics
        assert metrics['processParagraph']>=15,metrics
        assert metrics['inquiryParagraph']>=15,metrics
        assert abs(metrics['heroAspect']-metrics['sourceAspect'])<.01,metrics
        assert metrics['heroFit']=='contain',metrics
        assert metrics['formGap']<=40,metrics
        assert metrics['opportunitiesBackground']!='rgb(255, 255, 255)',metrics
        assert metrics['inquiryBackground']!='rgb(255, 255, 255)',metrics
        if name in ['desktop','mobile']:
            page.screenshot(path=str(OUT/f'{name}-hero.png'))
            page.locator('.opportunities').screenshot(path=str(OUT/f'{name}-opportunities.png'))
            page.locator('.process-section').screenshot(path=str(OUT/f'{name}-process.png'))
        for key,value in {'company':'Visual styling check','firstName':'Brand','lastName':'Preview','email':'styling@example.com','phone':'2025550136'}.items():
            page.locator('#'+key).fill(value)
        page.locator('input[name="hasWebsite"][value="No"]').check(force=True)
        page.locator('input[name="businessTypes"][value="Ecommerce Brand"]').check(force=True)
        page.get_by_role('button',name='Continue',exact=True).click()
        page.locator('.partner-option-card',has_text='White-Label Products').locator('input').check(force=True)
        page.get_by_role('button',name='Continue',exact=True).click()
        expect(page.locator('#partner-form-title')).to_have_text('Make It Your Brand.')
        expect(page.get_by_label('Primary Brand Color',exact=True)).to_have_value('#003f6a')
        expect(page.get_by_label('Accent Color',exact=True)).to_have_value('#d8603d')
        expect(page.locator('.vial-mockup__placeholder')).to_have_count(0)
        expect(page.locator('.reference-vial')).to_have_count(1)
        expect(page.locator('.reference-vial__band')).to_have_count(0)
        page.locator('.product-mockup').scroll_into_view_if_needed()
        page.wait_for_function('document.querySelector(".product-photo").complete && document.querySelector(".product-photo").naturalWidth>0')
        if name in ['desktop','mobile']:
            page.locator('.partner-mockup-card').screenshot(path=str(OUT/f'{name}-vial.png'))
        page.get_by_role('button',name='Capsule bottle',exact=True).click()
        expect(page.locator('.product-label__collection')).to_have_text('DIHEXA')
        expect(page.locator('.product-label__collection')).to_have_css('background-color',BLUE)
        expect(page.locator('.product-label__research')).to_have_css('border-top-color',ORANGE)
        page.wait_for_function('document.querySelector(".product-photo").complete && document.querySelector(".product-photo").naturalWidth>0')
        page.get_by_label('Primary Brand Color',exact=True).fill('#ffd966')
        expect(page.locator('.product-mockup')).to_have_css('--vial-primary','#ffd966')
        expect(page.locator('.product-label__collection')).to_have_css('color','rgb(16, 28, 39)')
        page.get_by_role('button',name='Reset mockup',exact=True).click()
        expect(page.get_by_label('Primary Brand Color',exact=True)).to_have_value('#003f6a')
        if name in ['desktop','mobile']:
            page.locator('.partner-mockup-card').screenshot(path=str(OUT/f'{name}-capsule.png'))
        if name=='mobile':
            with page.expect_response(lambda r:r.url.endswith('/api/partner/upload') and r.request.method=='POST') as uploaded:
                page.get_by_label('Upload a logo',exact=True).set_input_files('client/public/brand/favicon-64.png')
            assert uploaded.value.status==201,uploaded.value.text()
            expect(page.locator('.vial-mockup__logo')).to_be_visible()
            page.get_by_role('button',name='Clinical vial',exact=True).click()
            expect(page.locator('.vial-mockup__logo')).to_be_visible()
            page.locator('.partner-mockup-card').screenshot(path=str(OUT/'mobile-uploaded-logo.png'))
            with page.expect_response(lambda r:r.request.method=='DELETE' and '/api/partner/upload/' in r.url) as deleted:
                page.get_by_role('button',name='Reset mockup',exact=True).click()
            assert deleted.value.status==204
            expect(page.locator('.vial-mockup__placeholder')).to_have_count(0)
        assert page.evaluate('document.documentElement.scrollWidth')==width
        assert not errors,errors
        results.append({'viewport':name,'metrics':metrics,'colors':'exact blue/orange','liveLabels':'reference matched, switch and reset passed','consoleErrors':errors})
        print(name,'passed',flush=True)
        page.close()
    browser.close()
(OUT/'results.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))

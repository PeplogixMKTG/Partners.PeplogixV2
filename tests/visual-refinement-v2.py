from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import json

BASE='https://8328-i9ryv51qk32493ufz3uux-12c66107.us5.manus.computer'
OUT=Path('tests/evidence/v2')
OUT.mkdir(parents=True,exist_ok=True)
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for label,width,height in [('desktop',1440,1000),('mobile',390,844)]:
  page=browser.new_page(viewport={'width':width,'height':height})
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(BASE,wait_until='domcontentloaded');page.wait_for_selector('#company',timeout=30000)
  expect(page.get_by_text('A LITTLE MORE CLARITY',exact=True)).to_have_count(0)
  expect(page.get_by_text('Before you begin.',exact=True)).to_have_count(0)
  expect(page.locator('.partner-inquiry__intro')).to_have_count(0)
  assert page.locator('.hero-product-artwork').evaluate('(i)=>i.complete && i.naturalWidth>0')
  assert page.evaluate('document.documentElement.scrollWidth')==width
  spacing=page.evaluate('''() => {
    const a=document.querySelector('.inquiry-intro').getBoundingClientRect();
    const b=document.querySelector('.partner-workflow').getBoundingClientRect();
    const s=getComputedStyle(document.querySelector('.partner-inquiry'));
    return {introToFormGap:b.top-a.bottom,formTopPadding:s.paddingTop};
  }''')
  assert spacing['introToFormGap']<=40,spacing
  assert spacing['formTopPadding']=='0px',spacing
  page.screenshot(path=str(OUT/f'{label}-hero.png'))
  page.locator('#inquiry').scroll_into_view_if_needed();page.screenshot(path=str(OUT/f'{label}-form.png'))
  for k,v in {'company':'Visual preview only','firstName':'Layout','lastName':'Check','email':'preview@example.com','phone':'2025550136'}.items():page.locator('#'+k).fill(v)
  page.locator('input[name="hasWebsite"][value="No"]').check(force=True)
  page.locator('input[name="businessTypes"][value="Ecommerce Brand"]').check(force=True)
  page.get_by_role('button',name='Continue',exact=True).click()
  page.locator('.partner-option-card',has_text='White-Label Products').locator('input').check(force=True)
  page.get_by_role('button',name='Continue',exact=True).click()
  expect(page.locator('#partner-form-title')).to_have_text('Make It Your Brand.')
  page.locator('.product-mockup').scroll_into_view_if_needed()
  page.wait_for_function('document.querySelector(".product-photo").complete && document.querySelector(".product-photo").naturalWidth>0')
  expect(page.locator('.vial-mockup__placeholder')).to_have_text('YOUR BRAND')
  page.get_by_label('Primary Brand Color',exact=True).fill('#33206b')
  expect(page.locator('.product-mockup')).to_have_css('--vial-primary','#33206b')
  page.screenshot(path=str(OUT/f'{label}-vial.png'))
  page.get_by_role('button',name='Capsule bottle',exact=True).click()
  expect(page.locator('.product-mockup')).to_have_attribute('data-package','capsules')
  page.wait_for_function('document.querySelector(".product-photo").complete && document.querySelector(".product-photo").naturalWidth>0')
  expect(page.locator('.product-label__collection')).to_have_text('CAPSULE COLLECTION')
  expect(page.locator('.product-mockup')).to_have_css('--vial-primary','#33206b')
  with page.expect_response(lambda r:r.url.endswith('/api/partner/upload') and r.request.method=='POST') as upload:
   page.get_by_label('Upload a logo',exact=True).set_input_files('client/public/brand/favicon-64.png')
  assert upload.value.status==201,upload.value.text()
  expect(page.locator('.vial-mockup__logo')).to_be_visible(timeout=15000)
  page.locator('.product-mockup').scroll_into_view_if_needed()
  page.screenshot(path=str(OUT/f'{label}-capsule-logo.png'))
  page.get_by_role('button',name='Clinical vial',exact=True).click()
  expect(page.locator('.vial-mockup__logo')).to_be_visible()
  with page.expect_response(lambda r:r.request.method=='DELETE' and '/api/partner/upload/' in r.url) as deleted:
   page.get_by_role('button',name='Reset mockup',exact=True).click()
  assert deleted.value.status==204
  expect(page.locator('.vial-mockup__placeholder')).to_have_text('YOUR BRAND')
  expect(page.get_by_label('Primary Brand Color',exact=True)).to_have_value('#101849')
  assert page.evaluate('document.documentElement.scrollWidth')==width
  assert not errors,errors
  results.append({'viewport':label,'spacing':spacing,'hero':'loaded','faq':'absent','packaging':'vial and capsule rendered','logo':'retained on switching, removed on reset','colors':'live update and reset passed','consoleErrors':errors})
  page.close()
 browser.close()
(OUT/'results.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))

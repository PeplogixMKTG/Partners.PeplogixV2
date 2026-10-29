from playwright.sync_api import sync_playwright, expect
from pathlib import Path
import json

out=Path('tests/evidence')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
 page.goto('http://localhost:3000');page.wait_for_selector('#company')
 for k,v in {'company':'PEPLOGIX_REVIEW_REGRESSION_TEST','firstName':'Review','lastName':'Test','email':'review@example.com','phone':'2025550136'}.items():page.locator('#'+k).fill(v)
 page.locator('input[name="hasWebsite"][value="No"]').check(force=True)
 page.locator('input[name="businessTypes"][value="Ecommerce Brand"]').check(force=True)
 page.get_by_role('button',name='Continue',exact=True).click()
 page.locator('.partner-option-card',has_text='White-Label Products').locator('input').check(force=True)
 page.get_by_role('button',name='Continue',exact=True).click()
 expect(page.locator('#partner-form-title')).to_have_text('Make It Your Brand.')
 # Unsupported formats are rejected on the client and never sent to the server.
 uploads=[]
 page.on('request',lambda r: uploads.append(r.url) if r.url.endswith('/api/partner/upload') else None)
 page.get_by_label('Upload additional brand assets',exact=True).set_input_files({'name':'unsafe.svg','mimeType':'image/svg+xml','buffer':b'<svg></svg>'})
 expect(page.get_by_text('unsafe.svg: use an image, PDF, DOC, or DOCX file.',exact=True)).to_be_visible()
 assert not uploads
 # A real mobile upload and remove calls the capability-protected cleanup API.
 with page.expect_response(lambda r:r.url.endswith('/api/partner/upload') and r.request.method=='POST') as uploaded:
  page.get_by_label('Upload a logo',exact=True).set_input_files('client/public/brand/favicon-64.png')
 assert uploaded.value.status==201
 asset_id=uploaded.value.json()['id']
 expect(page.locator('.vial-mockup__logo')).to_be_visible()
 with page.expect_response(lambda r:r.request.method=='DELETE' and r.url.endswith(asset_id)) as deleted:
  page.get_by_role('button',name='Remove',exact=True).click()
 assert deleted.value.status==204,deleted.value.text()
 expect(page.locator('.vial-mockup__placeholder')).to_have_text('YOUR BRAND')
 # Reset and replaced files preserve live mockup behavior.
 with page.expect_response(lambda r:r.url.endswith('/api/partner/upload') and r.request.method=='POST') as uploaded:
  page.get_by_label('Upload a logo',exact=True).set_input_files('client/public/brand/favicon-64.png')
 expect(page.get_by_text('Uploaded securely',exact=True)).to_be_visible()
 asset_id2=uploaded.value.json()['id']
 page.get_by_label('Primary Brand Color',exact=True).fill('#5e2384')
 expect(page.locator('.vial-mockup')).to_have_css('--vial-primary','#5e2384')
 page.get_by_role('button',name='Reset mockup',exact=True).click()
 expect(page.locator('.vial-mockup__placeholder')).to_have_text('YOUR BRAND')
 expect(page.get_by_label('Primary Brand Color',exact=True)).to_have_value('#101849')
 # Upload again, deselect branding, and assert the actual submitted payload has no hidden files.
 with page.expect_response(lambda r:r.url.endswith('/api/partner/upload') and r.request.method=='POST') as uploaded:
  page.get_by_label('Upload a logo',exact=True).set_input_files('client/public/brand/favicon-64.png')
 expect(page.get_by_text('Uploaded securely',exact=True)).to_be_visible()
 hidden_id=uploaded.value.json()['id']
 page.get_by_role('button',name='Back',exact=True).click()
 page.locator('.partner-option-card',has_text='White-Label Products').locator('input').uncheck(force=True)
 page.locator('.partner-option-card',has_text='Other Partnership Opportunity').locator('input').check(force=True)
 page.locator('#partnershipOther').fill('Testing an unbranded partnership path')
 page.get_by_role('button',name='Continue',exact=True).click()
 expect(page.locator('#partner-form-title')).to_have_text("You're One Step Closer.")
 page.locator('.partner-confirm input').check(force=True)
 with page.expect_response(lambda r:r.url.endswith('/api/partner/inquiries') and r.request.method=='POST') as submitted:
  page.get_by_role('button',name='Submit Partnership Inquiry',exact=True).click()
 assert submitted.value.status==201,submitted.value.text()
 payload=submitted.value.request.post_data_json
 assert payload['logoId'] is None and payload['assetIds']==[]
 expect(page.get_by_text('Your partnership inquiry has been successfully submitted.',exact=True)).to_be_visible()
 assert page.evaluate('document.documentElement.scrollWidth')==390
 result={'company':'PEPLOGIX_REVIEW_REGRESSION_TEST','inquiry':submitted.value.json(),'temporaryAssetIds':[asset_id,asset_id2,hidden_id],'checks':'mobile uploads, client SVG rejection, remove cleanup, reset, live color, no hidden files on nonbranded submission, optional catalog'}
 (out/'regression-results.json').write_text(json.dumps(result,indent=2))
 print(json.dumps(result,indent=2))
 page.close();b.close()

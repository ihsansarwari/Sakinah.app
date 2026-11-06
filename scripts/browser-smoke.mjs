/**
 * Meaningful browser checks for the static GitHub Pages deployment.
 * No npm dependencies are added to the application. Install Playwright separately:
 *   npm install --prefix /tmp/sakinah-browser playwright --no-package-lock
 *   node scripts/browser-smoke.mjs
 * Optional: PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs
 *           CHROMIUM_PATH=/usr/bin/chromium
 * Default photo and map responses are simulated so results do not imply that
 * third-party services are reachable. --live-images removes the photo simulation.
 */
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {resolve, sep} from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const mount='/Sakinah.app/';
const modulePath=process.env.PLAYWRIGHT_MODULE || '/tmp/sakinah-browser/node_modules/playwright/index.mjs';
const {chromium}=await import(pathToFileURL(modulePath).href);
const catalog=JSON.parse(await readFile(resolve(root,'data/restaurants.osm.json'),'utf8'));
assert.ok(catalog.restaurants.length>0,'The browser smoke test requires a nonempty real catalog.');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(!pathname.startsWith(mount)) {res.writeHead(404).end();return;}
    const relative=pathname.slice(mount.length) || 'index.html';
    if(relative.split('/').some(segment=>segment.startsWith('.'))) {res.writeHead(404).end();return;}
    const file=resolve(root,relative);
    if(!file.startsWith(root.endsWith(sep)?root:root+sep)) {res.writeHead(404).end();return;}
    const extension=file.slice(file.lastIndexOf('.'));
    if(!types[extension] || !(await stat(file)).isFile()) {res.writeHead(404).end();return;}
    res.writeHead(200,{'Content-Type':types[extension]+'; charset=utf-8'});
    res.end(await readFile(file));
  } catch {res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}${mount}`;
let browser;
try {
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const page=await browser.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  let failImages=false;
  const live=process.argv.includes('--live-images');
  if(!live) {
    await page.route('https://images.unsplash.com/**',route=>failImages
      ? route.fulfill({status:404,body:''})
      : route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="#dae1c9"/></svg>'}));
  }
  await page.route('https://www.openstreetmap.org/export/**',route=>route.fulfill({contentType:'text/html',body:'<p>Simulated map response</p>'}));
  await page.goto(base);
  await page.locator('.restaurant').first().waitFor();
  assert.ok(await page.locator('.restaurant').count()>0,'The GitHub Pages subpath must load restaurant cards.');
  assert.equal(await page.locator('body').evaluate(element=>getComputedStyle(element).backgroundColor)!=='rgba(0, 0, 0, 0)',true,'Stylesheet must load under a repository subpath.');
  assert.ok(await page.locator('header .brand-logo').evaluate(img=>img.complete && img.naturalWidth>0),'The new logo must load under the Pages subpath.');
  for (const hiddenName of ['4050 SDU - Near By Coffee 1','Blommenslyst Kro']) {
    await page.locator('#query').fill(hiddenName);
    assert.equal(await page.locator('.restaurant').count(),0,'Review-only records must not appear in search: '+hiddenName);
  }
  await page.locator('#query').fill('');
  const favorite=page.locator('[data-favorite]').first();
  if(await favorite.count()) {
    const id=await favorite.getAttribute('data-favorite');
    await favorite.click();
    assert.equal(await page.locator(`[data-favorite="${id}"]`).getAttribute('aria-pressed'),'true','A favorite must visibly change state.');
    await page.reload();
    await page.locator(`[data-favorite="${id}"]`).waitFor();
    assert.equal(await page.locator(`[data-favorite="${id}"]`).getAttribute('aria-pressed'),'true','Favorites must survive a reload.');
    await page.locator('#saved-only').check();
    assert.equal(await page.locator('.restaurant').count(),1,'Saved-only filter must show the saved restaurant.');
    await page.locator('#saved-only').uncheck();
  }
  const pizza=page.locator('[data-category="pizza"]');
  if(await pizza.count()) {
    await pizza.click();
    const pizzaNames=await page.locator('.restaurant h3').allTextContents();
    assert.ok(pizzaNames.length>0,'Real dataset needs restaurants in the pizza category.');
    assert.ok(await page.locator('#count').textContent()!==`${catalog.restaurants.length} spisesteder · 2 valgte kriterier`,'Category filter must reduce the dataset.');
    await page.locator('[data-category="all"]').click();
  }
  if(await page.locator('#sort').count()) {
    await page.locator('#sort').selectOption('name');
    const names=await page.locator('.restaurant h3').allTextContents();
    assert.deepEqual(names,[...names].sort((a,b)=>a.localeCompare(b,'da')),'Default name sorting must be deterministic and Danish.');
    await page.locator('#sort').selectOption('saved');
    assert.equal(await page.locator('[data-favorite]').first().getAttribute('aria-pressed'),'true','Saved-first sorting must put a saved card first.');
    await page.locator('#sort').selectOption('name');
  }
  if(catalog.restaurants.every(r=>r.halal===null && r.alcohol===null)) {
    const evidence=await page.locator('.profile').first().innerText();
    assert.doesNotMatch(evidence,/0 af 2/,'Missing evidence must not be presented as a failed score.');
  }
  const firstName=catalog.restaurants[0].name;
  await page.locator('#query').fill(firstName);
  await page.waitForFunction(name=>document.querySelector('.restaurant')?.textContent.includes(name),firstName);
  const matchingCards=await page.locator('.restaurant h3').allTextContents();
  assert.ok(matchingCards.length>0 && matchingCards.every(name=>name.toLocaleLowerCase('da').includes(firstName.toLocaleLowerCase('da'))),'Search must filter names rather than only change the result count.');

  const opener=page.locator('.profile').first();
  await opener.click();
  const dialog=page.locator('dialog');
  assert.equal(await dialog.isVisible(),true,'A restaurant profile must open.');
  const titleId=await dialog.getAttribute('aria-labelledby');
  assert.ok(titleId && await page.locator(`[id="${titleId}"]`).count()===1,'Dialog needs a real accessible title.');
  assert.ok(await dialog.locator('a[href^="https://www.openstreetmap.org/"]').count()>0,'Real restaurant profiles must expose their source.');
  assert.equal(await dialog.locator('iframe').count(),0,'No third-party map should be embedded before the user asks.');
  if(await dialog.locator('#copy-checklist').count()) {
    await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined}));
    await dialog.locator('#copy-checklist').click();
    await page.waitForFunction(()=>document.querySelector('#copy-status')?.textContent.includes('Kunne ikke'));
    await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copiedChecklist=text;}}}));
    await dialog.locator('#copy-checklist').click();
    await page.waitForFunction(()=>document.querySelector('#copy-status')?.textContent.includes('kopieret'));
    assert.ok(await page.evaluate(()=>window.__copiedChecklist?.length>0),'The checklist copy action must contain actual questions.');
  }
  const mapButton=dialog.locator('#show-map');
  if(await mapButton.count()) {
    await mapButton.click();
    assert.equal(await dialog.locator('iframe[title]').count(),1,'The map control should create an accessible frame.');
  }
  const reportURL=await dialog.locator('#report-link').inputValue();
  assert.ok(new URL(reportURL).hash.startsWith('#restaurant='),'Report link must identify the restaurant.');
  assert.match(await dialog.innerText(),/Restaurantens svar: ikke indhentet/,'Imported profiles must not imply restaurant participation.');
  assert.equal(await dialog.locator('.evidence-detail').count(),5,'Every criterion needs its evidence status.');
  const direct=await browser.newPage();
  await direct.route('https://images.unsplash.com/**',route=>route.fulfill({status:404,body:''}));
  await direct.goto(reportURL);
  await direct.locator('dialog[open]').waitFor();
  assert.equal(await direct.locator('#dialog-title').innerText(),await dialog.locator('#dialog-title').innerText(),'A scanned report link must open the same restaurant after a fresh load.');
  await direct.close();
  await page.keyboard.press('Escape');
  assert.equal(await dialog.isVisible(),false,'Escape must dismiss the restaurant profile.');

  await page.locator('#query').fill('tayyibah-no-such-restaurant-unique-test');
  await page.waitForFunction(()=>document.querySelectorAll('.restaurant').length===0);
  assert.ok(await page.locator('#results').innerText(),'A zero-result search must explain what happened.');
  const reset=page.locator('#reset');
  if(await reset.count()) await reset.click();
  else await page.locator('#query').fill('');
  await page.locator('.restaurant').first().waitFor();

  if(await page.locator('#strict').count() && catalog.restaurants.every(r=>r.halal===null)) {
    await page.locator('#strict').check();
    await page.waitForFunction(()=>document.querySelectorAll('.restaurant').length===0);
    await page.locator('#reset').click();
    await page.locator('.restaurant').first().waitFor();
    assert.equal(await page.locator('#strict').isChecked(),false,'Reset must clear strict filtering.');
  }

  const more=page.locator('#load-more');
  if(await more.count()) {
    const before=await page.locator('.restaurant').count();
    await more.click();
    assert.ok(await page.locator('.restaurant').count()>before,'Load more must add real results.');
  }
  for(const width of [360,390,768,1365]) {
    await page.setViewportSize({width,height:900});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`No horizontal overflow at ${width}px.`);
  }
  const unnamed=await page.locator('button').evaluateAll(buttons=>buttons.filter(button=>!button.disabled && !(button.innerText.trim() || button.getAttribute('aria-label') || button.getAttribute('aria-labelledby'))).length);
  assert.equal(unnamed,0,'Every enabled button needs an accessible name.');
  assert.deepEqual(errors,[],'Application JavaScript must not throw.');

  // Storage can be unavailable in private/restricted browser contexts. A saved
  // restaurant must still work for the session, with an honest status message.
  if(await page.locator('[data-favorite]').count()) {
    const restricted=await browser.newPage();
    await restricted.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage blocked','SecurityError');}}));
    await restricted.route('https://images.unsplash.com/**',route=>route.fulfill({status:404,body:''}));
    await restricted.goto(base);
    await restricted.locator('[data-favorite]').first().waitFor();
    await restricted.locator('[data-favorite]').first().click();
    assert.match(await restricted.locator('#saved-message').innerText(),/session|lagring/i,'Unavailable storage should give a clear session-only message.');
    await restricted.close();
  }

  if(!live) {
    failImages=true;
    await page.reload();
    await page.waitForFunction(()=>document.querySelector('.photo-unavailable'));
    assert.ok(await page.locator('.restaurant').count()>0,'A failed image service must not remove the restaurant list.');
  } else {
    const loaded=await page.locator('.food-photo').evaluateAll(images=>images.filter(image=>image.complete && image.naturalWidth>0).length);
    console.log(`Live image observation: ${loaded} currently visible/loaded images. This is not a license or subject-matter verification.`);
  }
  await page.route('**/data/restaurants.osm.json',route=>route.fulfill({status:503,body:'Unavailable'}));
  await page.reload();
  await page.waitForFunction(()=>document.querySelector('.demo-notice')?.textContent.includes('kunne ikke indlæses'));
  assert.equal(await page.locator('.restaurant').count(),0,'Data failure must not leave stale snapshot restaurant cards presented as current data.');
  console.log(`PASS: static subpath, ${catalog.restaurants.length} catalog records, search/category/sort, persistent and session-only favorites, sourced accessible profile, checklist copy/fallback, map opt-in, Escape, empty search, pagination, unknown evidence, named buttons, four viewport widths, and data/image failure states.`);
  console.log(live?'Images used live external requests; map response was simulated.':'Photo and map responses were simulated. Third-party image availability is NOT verified by this run.');
} finally {
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}

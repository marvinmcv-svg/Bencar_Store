// End-to-end check of every link and button on the Bencar site.
// Usage: BASE=http://127.0.0.1:5173 node tests/e2e.cjs
const { chromium, devices } = require('playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const problems = [];
const ok = [];
const fail = (where, msg) => { problems.push(`${where}: ${msg}`); };
const pass = (msg) => ok.push(msg);

async function collectLinks(page) {
  return page.$$eval('a', (as) => as.map((a) => ({
    href: a.getAttribute('href'), abs: a.href, text: (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 40),
    target: a.target, visible: !!(a.offsetWidth || a.offsetHeight || a.getClientRects().length),
  })));
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`${page.url()} → ${e.message}`));

  // Product ids from the catalogue module
  await page.goto(BASE + '/');
  const ids = await page.evaluate(async () => (await import('/src/data/catalog.js')).products.map((p) => p.id));
  const pages = ['/', '/tienda.html', '/servicios.html', ...ids.map((id) => `/producto.html?id=${id}`)];

  // 1) Every link on every page
  const seen = new Map(); // abs url -> from page
  for (const path of pages) {
    await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(path === '/' ? 600 : 300);
    for (const l of await collectLinks(page)) {
      if (l.href == null || l.href === '' || l.href === '#') { fail(path, `link "${l.text}" has no destination (href="${l.href}")`); continue; }
      if (!seen.has(l.abs)) seen.set(l.abs, { from: path, text: l.text });
    }
    // Images that failed to load
    const broken = await page.$$eval('img', (imgs) => imgs.filter((i) => i.complete && i.naturalWidth === 0 && i.src && !i.loading?.includes('lazy')).map((i) => i.src));
    broken.forEach((src) => fail(path, `broken image ${src}`));
  }
  const domCache = new Map();
  for (const [abs, { from, text }] of seen) {
    const u = new URL(abs);
    if (u.protocol === 'tel:') { /^tel:\+591\d{8}$/.test(abs) ? pass(`tel ${abs}`) : fail(from, `bad phone link ${abs}`); continue; }
    if (u.hostname === 'wa.me') { /^\/591\d{8}$/.test(u.pathname) ? pass('whatsapp') : fail(from, `bad WhatsApp link ${abs}`); continue; }
    if (u.hostname.endsWith('instagram.com')) { pass('instagram'); continue; }
    if (u.origin !== new URL(BASE).origin) { fail(from, `unexpected external link ${abs} ("${text}")`); continue; }
    const key = u.pathname + u.search;
    if (!domCache.has(key)) {
      const r = await page.goto(BASE + key, { waitUntil: 'load' });
      await page.waitForTimeout(250);
      const status = r ? r.status() : 0;
      const info = await page.evaluate(() => ({ ids: [...document.querySelectorAll('[id]')].map((e) => e.id), title: document.title, h1: document.querySelector('h1')?.textContent || '' }));
      domCache.set(key, { status, ...info });
    }
    const d = domCache.get(key);
    if (d.status !== 200) { fail(from, `"${text}" → ${key} returned ${d.status}`); continue; }
    if (u.pathname === '/producto.html') {
      const id = u.searchParams.get('id');
      if (!ids.includes(id)) fail(from, `"${text}" → unknown product id "${id}" (page falls back to iPhone 18)`);
    }
    if (u.hash && !d.ids.includes(decodeURIComponent(u.hash.slice(1)))) fail(from, `"${text}" → ${key}${u.hash}: anchor ${u.hash} does not exist`);
    else pass(`link ${key}${u.hash}`);
  }

  const step = async (name, fn) => { try { await fn(); } catch (e) { fail(name, 'step crashed: ' + e.message.split('\n')[0]); } };
  await step('nav click', async () => {
  // 2) Clicking a real link navigates (page-transition curtain must not swallow it)
  await page.goto(BASE + '/');
  await page.waitForTimeout(500);
  await page.mouse.wheel(0, 50); // skip intro
  await page.waitForTimeout(400);
  await page.click('.gnav__links a[href="/tienda.html"]');
  await page.waitForURL('**/tienda.html', { timeout: 5000 }).then(() => pass('nav click navigates')).catch(() => fail('/', 'nav "Tienda" click did not navigate'));

  });
  await step('intro', async () => {
  // 3) Home intro: after skipping, nav + Kleber are visible (intro-lock removed)
  for (const mode of ['wait', 'scroll-early', 'key-early']) {
    await page.goto(BASE + '/');
    if (mode === 'scroll-early') { await page.waitForTimeout(200); await page.mouse.wheel(0, 300); }
    if (mode === 'key-early') { await page.waitForTimeout(200); await page.keyboard.press('ArrowDown'); }
    await page.waitForTimeout(mode === 'wait' ? 6000 : 2500);
    const st = await page.evaluate(() => ({
      locked: document.body.classList.contains('intro-lock'),
      klOpacity: getComputedStyle(document.querySelector('.kl')).opacity,
      klScale: getComputedStyle(document.querySelector('.kl__launch')).transform,
      nav: getComputedStyle(document.querySelector('.gnav')).opacity,
    }));
    if (st.locked || st.klOpacity !== '1' || st.nav !== '1') fail('/', `intro (${mode}): nav/Kleber hidden ${JSON.stringify(st)}`); else pass(`intro ${mode}`);
  }

  });
  await step('store', async () => {
  // 4) Global chrome: search, bag, Kleber
  await page.goto(BASE + '/tienda.html');
  await page.waitForTimeout(800);
  await page.click('[data-open-search]');
  await page.waitForTimeout(400);
  if (await page.isVisible('.search input')) {
    await page.fill('.search input', 'airpods');
    await page.waitForTimeout(400);
    const n = await page.$$eval('.search__results a', (a) => a.length);
    n > 0 ? pass('search results') : fail('/tienda.html', 'search for "airpods" shows no results');
    await page.keyboard.press('Escape');
  } else fail('/tienda.html', 'search button does not open search');
  await page.waitForTimeout(300);

  // filters
  await page.click('.chip[data-f="mac"]');
  await page.waitForTimeout(500);
  const visibleSecs = await page.$$eval('.store-sec', (s) => s.filter((x) => !x.hidden).map((x) => x.id));
  JSON.stringify(visibleSecs) === '["mac"]' ? pass('filter chips') : fail('/tienda.html', `filter "Mac" shows ${visibleSecs}`);
  await page.click('.chip[data-f="all"]');

  // shelf next button scrolls
  await page.waitForTimeout(400);
  const shelfOk = await page.evaluate(async () => {
    const w = [...document.querySelectorAll('.shelf-wrap')].find((x) => !x.querySelector('.shelf-nav').hidden);
    if (!w) return 'no scrollable shelf';
    const s = w.querySelector('.shelf'); const before = s.scrollLeft;
    w.querySelector('[data-dir="1"]').click();
    await new Promise((r) => setTimeout(r, 900));
    return s.scrollLeft > before ? 'ok' : 'did not scroll';
  });
  shelfOk === 'ok' ? pass('shelf arrows') : fail('/tienda.html', `shelf arrow: ${shelfOk}`);

  });
  await step('product', async () => {
  // Product page: model, colour, gallery, add to bag, checkout
  await page.goto(BASE + '/producto.html?id=iphone-18');
  await page.waitForTimeout(1200);
  const img0 = await page.$eval('#stage img:last-child', (i) => i.getAttribute('src'));
  await page.click('[data-color="1"]');
  await page.waitForTimeout(900);
  const img1 = await page.$eval('#stage img:last-child', (i) => i.getAttribute('src'));
  img1 !== img0 && /burgundy/.test(img1) ? pass('colour swaps photos') : fail('/producto.html?id=iphone-18', `colour click did not swap photo (${img0} → ${img1})`);
  const thumbs = await page.$$('#thumbs button');
  if (thumbs.length > 1) { await thumbs[2].click(); await page.waitForTimeout(800); pass('thumb click'); } else fail('/producto.html?id=iphone-18', 'no gallery thumbnails');
  await page.click('[data-model="1"]');
  await page.click('[data-opt="1"]');
  const price = await page.$eval('.summary__price', (e) => e.textContent);
  /1,975/.test(price) ? pass('model + option price') : fail('/producto.html?id=iphone-18', `18 Pro Max 512GB should be $1,975, shows "${price.trim()}"`);
  await page.click('[data-add]');
  await page.waitForTimeout(1200);
  const count = await page.$eval('.bag-count', (e) => e.textContent);
  count === '1' ? pass('add to bag') : fail('/producto.html?id=iphone-18', `bag count after add = ${count}`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.mouse.wheel(0, -200);
  await page.waitForTimeout(800);
  await page.click('.gnav .bag-btn');
  await page.waitForTimeout(600);
  const co = await page.$eval('[data-checkout]', (a) => a.href);
  /wa\.me\/591\d+\?text=/.test(co) && decodeURIComponent(co).includes('iPhone 18') ? pass('checkout link') : fail('bag', `checkout link wrong: ${co}`);
  await page.click('.drawer [data-close-bag] >> nth=-1').catch(() => {});

  });
  await step('kleber', async () => {
  // Kleber
  await page.goto(BASE + '/servicios.html');
  await page.waitForTimeout(2500);
  if (await page.isVisible('.kl__launch')) {
    await page.click('.kl__launch');
    await page.waitForTimeout(500);
    await page.fill('.kl__form input', '¿cuánto cuesta el macbook air?');
    await page.press('.kl__form input', 'Enter');
    await page.waitForTimeout(2500);
    const last = await page.$$eval('.kl__msg--bot', (m) => m[m.length - 1].textContent);
    /MacBook Air/.test(last) && /\$1,575/.test(last) ? pass('Kleber answers') : fail('Kleber', `unexpected answer: ${last.slice(0, 120)}`);
    const link = await page.$$eval('.kl__msg--bot a', (a) => a.map((x) => x.getAttribute('href')));
    link.some((h) => h.includes('macbook-air')) ? pass('Kleber product link') : fail('Kleber', 'no product link in answer');
    await page.click('.kl__quick button >> nth=0').catch(() => {});
  } else fail('/servicios.html', 'Kleber launcher not visible');

  });
  await step('mobile', async () => {
  // Mobile menu
  const m = await browser.newContext({ ...devices['iPhone 13'] });
  const mp = await m.newPage();
  mp.on('pageerror', (e) => errors.push(`mobile ${mp.url()} → ${e.message}`));
  await mp.goto(BASE + '/servicios.html');
  await mp.waitForTimeout(1200);
  await mp.click('[data-open-menu]');
  await mp.waitForTimeout(600);
  (await mp.isVisible('.mmenu a[href="/tienda.html#mac"]')) ? pass('mobile menu') : fail('mobile', 'burger menu does not open');
  await mp.click('.mmenu a[href="/tienda.html#mac"]');
  await mp.waitForURL('**/tienda.html#mac', { timeout: 5000 }).then(() => pass('mobile menu link')).catch(() => fail('mobile', 'menu link "Mac" did not navigate'));
  await mp.waitForTimeout(1500);
  const macTop = await mp.evaluate(() => document.getElementById('mac').getBoundingClientRect().top);
  macTop < 300 ? pass('hash scroll on arrival') : fail('mobile /tienda.html#mac', `did not scroll to Mac section (top=${Math.round(macTop)})`);

  });
  errors.forEach((e) => fail('JS error', e));
  console.log(`\n${ok.length} checks passed, ${problems.length} problems`);
  [...new Set(problems)].forEach((p) => console.log(' ✗', p));
  await browser.close();
  process.exit(problems.length ? 1 : 0);
})();

// Real-click end-to-end journeys for the Bencar site.
//
// Unlike e2e.cjs (which checks that every href points somewhere valid), this
// test drives the site the way a shopper does: it scrolls each button into
// view, clicks it with the mouse at the spot a person would click, follows the
// navigation, and checks that the page you land on is the product (and model)
// the button was advertising.
//
// Usage:  npm run dev   (in another terminal)
//         BASE=http://127.0.0.1:5173 node tests/journeys.cjs
//         ONLY=desktop|mobile  to run one viewport; STEPS=search,bag  to run some steps
const { chromium, devices } = require('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const ONLY = process.env.ONLY || '';
const problems = [];
let passed = 0;
const fail = (where, msg) => problems.push(`${where}: ${msg}`);
const pass = () => { passed++; };

// Words that tie a link's surroundings to a product when the name itself is not written out.
const ALIASES = { 'mac-seminuevos': /seminuev/i };

async function settle(page, ms = 350) { await page.waitForTimeout(ms); }

/** Run a click and wait for the page it starts loading (the exit curtain delays it ~0.6s). */
async function clickNav(page, click, timeout = 8000) {
  const nav = page.waitForEvent('framenavigated', { predicate: (f) => f === page.mainFrame(), timeout });
  await click();
  await nav;
  await page.waitForLoadState('load');
}

async function open(page, path) {
  await page.goto(BASE + path, { waitUntil: 'load' });
  if (path === '/' || path.startsWith('/#')) {
    await settle(page, 300);
    await page.mouse.wheel(0, 20); // skip the logo intro, as a visitor scrolling would
    await page.evaluate(() => { window.__bencarIntro && window.__bencarIntro.progress(1); });
  }
  await settle(page, 500);
}

/** Describe every product link on the page: target product, model, and what surrounds it. */
async function productLinks(page) {
  return page.evaluate(async () => {
    const { products } = await import('/src/data/catalog.js');
    const byId = Object.fromEntries(products.map((p) => [p.id, p]));
    return [...document.querySelectorAll('a[href*="producto.html"]')].map((a, i) => {
      a.dataset.qa = String(i);
      const u = new URL(a.href);
      const id = u.searchParams.get('id');
      const p = byId[id];
      const model = u.searchParams.get('model');
      const box = a.closest('.pcard, .tile, .story__panel, .search__hits li, .kl__msg, .hero__stage, .ribbon, .lid__sticky, .bento article, .drawer__items > *');
      const heading = box?.querySelector('h3, strong, .eyebrow')?.textContent.trim() || '';
      return {
        qa: String(i), id, model: model == null ? null : Number(model),
        name: p?.name || null,
        modelName: p && model != null ? p.models[Number(model)]?.name : null,
        text: (a.textContent || a.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' '),
        aria: a.getAttribute('aria-label') || '',
        where: box ? box.className.split(' ')[0] : 'page',
        heading,
        context: (box?.textContent || a.textContent || '').replace(/\s+/g, ' ').trim(),
        inStory: !!a.closest('.story__panel'),
        inHidden: !!a.closest('[hidden]'),
      };
    });
  });
}

/** Does what the shopper reads around the link match the product it opens? */
function contextMatches(l) {
  if (!l.name) return false;
  const hay = `${l.heading} ${l.text} ${l.aria} ${l.context}`.toLowerCase();
  // Cards: the card's heading must be the product itself.
  if (l.where === 'pcard') return l.heading === l.name;
  if (l.where === 'tile') return hay.includes(l.name.toLowerCase()) || (l.heading && l.name.toLowerCase().startsWith(l.heading.toLowerCase().split(' ')[0]));
  if (l.modelName) return hay.includes(l.modelName.replace(/^18 /, '').toLowerCase());
  if (ALIASES[l.id] && ALIASES[l.id].test(hay)) return true;
  return hay.includes(l.name.toLowerCase());
}

/** Bring a link on screen and return the point a person would click, or why they can't. */
async function aim(page, qa) {
  return page.evaluate(async (qa) => {
    const a = document.querySelector(`[data-qa="${qa}"]`);
    if (!a) return { err: 'link vanished' };
    // Open the shelf / section it lives in.
    const sec = a.closest('.store-sec[hidden]');
    if (sec) return { err: 'inside a hidden section' };
    // Scroll through Lenis when it is running, or it animates the page back to where it was.
    const { lenis } = await import('/src/js/core.js');
    const go = (y) => { lenis ? lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y); };
    const docTop = (el) => el.getBoundingClientRect().top + scrollY;
    const story = a.closest('.story__panel');
    if (story) {
      // Scroll the pinned lineup to the middle of this model's panel.
      const s = document.querySelector('.story');
      const i = Number(story.dataset.panel), n = document.querySelectorAll('.story__panel').length;
      go(docTop(s) + (s.offsetHeight - innerHeight) * ((i + 0.5) / n));
    } else if (a.closest('.hero__stage')) {
      // The hero's buttons fade in at the end of the scroll-scrubbed hero.
      const h = document.querySelector('.hero');
      go(docTop(h) + h.offsetHeight - innerHeight - 2);
    } else {
      const shelf = a.closest('.shelf');
      if (shelf) { const card = a.closest('[role=listitem]'); shelf.scrollLeft = card.offsetLeft - (shelf.clientWidth - card.offsetWidth) / 2; }
      const sticky = a.closest('.lid__sticky');
      go(sticky ? docTop(sticky.parentElement) + sticky.parentElement.offsetHeight - innerHeight - 2 : docTop(a) - innerHeight / 2 + a.offsetHeight / 2);
    }
    await new Promise((r) => setTimeout(r, 900));
    const rc = a.getBoundingClientRect();
    if (rc.width < 2 || rc.height < 2) return { err: 'not visible (zero size)' };
    if (rc.bottom < 0 || rc.top > innerHeight || rc.right < 0 || rc.left > innerWidth) return { err: `off screen (${Math.round(rc.left)},${Math.round(rc.top)})` };
    // Click near the middle, nudged clear of rounded corners.
    const x = rc.left + rc.width / 2, y = rc.top + Math.min(rc.height / 2, 20);
    const hit = document.elementFromPoint(x, y);
    const target = hit && hit.closest('a, button');
    const desc = (e) => (e ? `${e.tagName.toLowerCase()}.${(e.className && typeof e.className === 'string' ? e.className.split(' ')[0] : '')}${e.getAttribute('href') ? `[${e.getAttribute('href')}]` : ''} "${(e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30)}"` : 'nothing');
    const op = (() => { let e = a, o = 1; while (e) { o *= +getComputedStyle(e).opacity; e = e.parentElement; } return o; })();
    if (op < 0.3) return { err: `nearly invisible (opacity ${op.toFixed(2)})` };
    if (target !== a && !(target && target.getAttribute('href') === a.getAttribute('href'))) {
      return { x, y, covered: desc(target || hit) };
    }
    return { x, y };
  }, qa);
}

async function landedOn(page) {
  await page.waitForFunction(() => document.querySelector('#pdp-head h1')?.textContent.trim().length > 0, null, { timeout: 8000 });
  await settle(page, 250);
  return page.evaluate(() => ({
    url: location.pathname + location.search,
    h1: document.querySelector('#pdp-head h1').textContent.replace(/\s+/g, ' ').trim(),
    model: document.querySelector('[data-model][aria-checked="true"] strong')?.textContent.trim() || null,
    summary: document.querySelector('.summary__price small')?.textContent.trim() || '',
  }));
}

/** Click every product link on a page for real and check where it lands (spread over a few tabs). */
async function productJourneys(page, path, label, { workers = 3 } = {}) {
  await open(page, path);
  const links = (await productLinks(page)).filter((l) => !l.inHidden);
  // One real click per distinct (destination, place) — e.g. a card's image link and its "Comprar" button are both clicked.
  const seen = new Set();
  const todo = links.filter((l) => { const k = `${l.id}|${l.model}|${l.where}|${l.text}|${l.heading}`; if (seen.has(k)) return false; seen.add(k); return true; });
  const queue = [...todo];
  const tabs = [page, ...(await Promise.all(Array.from({ length: Math.min(workers, todo.length) - 1 }, () => page.context().newPage())))];
  await Promise.all(tabs.map(async (tab) => {
    let fresh = tab === page;
    while (queue.length) {
      const l = queue.shift();
      if (!fresh) {
        // A slow page load is retried rather than abandoning the remaining links.
        let ready = false;
        for (let k = 0; k < 3 && !ready; k++) {
          try { await open(tab, path); await productLinks(tab); ready = true; } catch { await settle(tab, 1000); }
        }
        if (!ready) { fail(`${label} ${path} "${l.text}"`, `page ${path} would not load`); continue; }
      }
      fresh = false;
      await clickProduct(tab, path, label, l).catch((e) => fail(`${label} ${path} "${l.text}"`, 'crashed: ' + e.message.split('\n')[0]));
    }
  }));
  await Promise.all(tabs.filter((t) => t !== page).map((t) => t.close()));
  return todo.length;
}

async function clickProduct(page, path, label, l) {
  const tag = `${label} ${path} "${l.text || l.aria}"${l.heading ? ` (${l.where}: ${l.heading})` : ` (${l.where})`}`;
  if (!l.name) return fail(tag, `points to unknown product id "${l.id}"`);
  if (!contextMatches(l)) return fail(tag, `says "${l.heading || l.text}" but opens ${l.name}${l.modelName ? ' ' + l.modelName : ''}`);
  const at = await aim(page, l.qa);
  if (at.err) return fail(tag, `cannot be clicked: ${at.err}`);
  if (at.covered) return fail(tag, `click lands on ${at.covered} instead`);
  try { await clickNav(page, () => page.mouse.click(at.x, at.y)); } catch { return fail(tag, 'click did not navigate'); }
  let got;
  try { got = await landedOn(page); } catch { return fail(tag, `landed on ${page.url()} but the product page never rendered`); }
  if (got.h1 !== `Comprar ${l.name}`) return fail(tag, `opened "${got.h1}" (${got.url}), expected ${l.name}`);
  if (l.modelName && got.model && !got.model.endsWith(l.modelName)) return fail(tag, `opened ${l.name} with model "${got.model}" selected, expected "${l.modelName}"`);
  if (l.modelName && !got.summary.includes(l.modelName)) return fail(tag, `summary shows "${got.summary}", expected model ${l.modelName}`);
  pass();
}

async function sectionJourneys(page, label) {
  // Nav / footer / tile "Ver más" / rail links into store sections must show that section.
  for (const from of ['/', '/servicios.html', '/tienda.html']) {
    await open(page, from);
    const anchors = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="/tienda.html#"], .rail a[href^="#"]')]
      .map((a) => a.getAttribute('href')))]);
    for (const href of anchors) {
      const cat = href.split('#')[1];
      const tag = `${label} ${from} link ${href}`;
      await open(page, from);
      const at = await page.evaluate(async (href) => {
        const a = [...document.querySelectorAll(`a[href="${href}"]`)].find((x) => x.offsetWidth && !x.closest('.mmenu'));
        if (!a) return { err: 'not visible at this size' };
        a.dataset.qa = 'sec';
        const { lenis } = await import('/src/js/core.js');
        const ty = a.getBoundingClientRect().top + scrollY - innerHeight / 2;
        lenis ? lenis.scrollTo(Math.max(0, ty), { immediate: true, force: true }) : a.scrollIntoView({ block: 'center' });
        await new Promise((r) => setTimeout(r, 700));
        const rc = a.getBoundingClientRect();
        const x = rc.left + rc.width / 2, y = rc.top + rc.height / 2;
        const hit = document.elementFromPoint(x, y)?.closest('a,button');
        if (rc.bottom < 0 || rc.top > innerHeight) return { covered: `off screen (top=${Math.round(rc.top)})` };
        if (hit !== a) return { covered: hit ? `${hit.tagName.toLowerCase()} "${hit.textContent.trim().slice(0, 30)}"` : 'nothing' };
        return { x, y };
      }, href);
      if (at.err) continue; // e.g. desktop nav hidden on mobile — covered by the menu test
      if (at.covered) { fail(tag, `click lands on ${at.covered}`); continue; }
      if (from === '/tienda.html') await page.mouse.click(at.x, at.y);
      else await clickNav(page, () => page.mouse.click(at.x, at.y));
      await settle(page, 1500);
      const st = await page.evaluate((cat) => {
        const s = document.getElementById(cat);
        if (!s) return { err: `no #${cat} on ${location.pathname}` };
        const r = s.getBoundingClientRect();
        return { path: location.pathname, hidden: s.hidden, top: Math.round(r.top), h: innerHeight };
      }, cat);
      if (st.err) fail(tag, st.err);
      else if (st.path !== '/tienda.html') fail(tag, `ended on ${st.path}`);
      else if (st.hidden) fail(tag, `#${cat} section is hidden by a filter`);
      else if (st.top > st.h * 0.5 || st.top < -200) fail(tag, `did not bring #${cat} into view (top=${st.top})`);
      else pass();
    }
  }
}

async function storeFilters(page, label) {
  await open(page, '/tienda.html');
  const cats = await page.$$eval('.chip[data-f]', (b) => b.map((x) => x.dataset.f));
  for (const f of cats) {
    await page.click(`.chip[data-f="${f}"]`);
    await settle(page, 700);
    const st = await page.evaluate(() => ({
      shown: [...document.querySelectorAll('.store-sec')].filter((s) => !s.hidden).map((s) => s.id),
      pressed: document.querySelector('.chip[aria-pressed="true"]')?.dataset.f,
    }));
    const want = f === 'all' ? null : [f];
    if (st.pressed !== f) fail(`${label} filter ${f}`, `chip not marked as selected (${st.pressed})`);
    else if (want && JSON.stringify(st.shown) !== JSON.stringify(want)) fail(`${label} filter ${f}`, `shows sections ${st.shown}`);
    else pass();
    // After filtering, a card from that category must open its own product.
    if (f !== 'all') {
      const first = await page.evaluate((f) => {
        const c = document.querySelector(`#${f} .pcard`);
        return c ? { name: c.querySelector('h3').textContent.trim(), href: c.querySelector('.btn').getAttribute('href') } : null;
      }, f);
      if (!first) { fail(`${label} filter ${f}`, 'no products in section'); continue; }
      const btn = page.locator(`#${f} .pcard .btn`).first();
      await btn.scrollIntoViewIfNeeded();
      await settle(page, 400);
      try {
        await clickNav(page, () => btn.click());
        const got = await landedOn(page);
        got.h1 === `Comprar ${first.name}` ? pass() : fail(`${label} filter ${f}`, `first card "${first.name}" opened "${got.h1}"`);
      } catch { fail(`${label} filter ${f}`, `first card "${first.name}" did not open a product page`); }
      await open(page, '/tienda.html');
    }
  }
}

async function configurator(page, label) {
  // Every model / option / colour button on every product updates what goes into the bag.
  await open(page, '/');
  const ids = await page.evaluate(async () => (await import('/src/data/catalog.js')).products.map((p) => p.id));
  for (const id of ids) {
    await open(page, `/producto.html?id=${id}`);
    const tag = `${label} product ${id}`;
    const n = await page.evaluate(() => ({
      models: document.querySelectorAll('[data-model]').length,
      opts: document.querySelectorAll('[data-opt]').length,
      colors: document.querySelectorAll('[data-color]').length,
    }));
    const groups = [['model', n.models], ['opt', n.opts], ['color', n.colors]];
    for (const [kind, count] of groups) {
      for (let i = count - 1; i >= 0; i--) {
        const sel = `[data-${kind}="${i}"]`;
        const disabled = await page.$eval(sel, (b) => b.disabled).catch(() => null);
        if (disabled === null) continue; // option list changed after a model switch
        if (disabled) continue;
        const btn = page.locator(sel);
        await btn.scrollIntoViewIfNeeded();
        try { await btn.click({ timeout: 3000 }); } catch (e) {
          fail(tag, `${kind} button ${i} cannot be clicked: ${e.message.split('\n')[0].slice(0, 140)}`); continue;
        }
        await settle(page, 150);
        const ok = await page.evaluate(([kind, i]) => {
          const b = document.querySelector(`[data-${kind}="${i}"]`);
          if (!b || b.getAttribute('aria-checked') !== 'true') return `button ${i} not selected after click`;
          const label = kind === 'color' ? b.getAttribute('aria-label') : b.querySelector('strong').textContent.trim().replace(/^iPhone /, '');
          const summary = document.querySelector('.summary__price small').textContent;
          return summary.includes(label) ? true : `summary "${summary}" does not mention "${label}"`;
        }, [kind, i]);
        ok === true ? pass() : fail(tag, `${kind}: ${ok}`);
      }
    }
  }
}

async function bagJourney(page, label) {
  // Pick a specific configuration, add it, and check the bag + WhatsApp order carry exactly that.
  await page.evaluate(() => localStorage.clear()).catch(() => {});
  const cases = [
    { id: 'iphone-18', model: 2, opt: 1, color: 1, expect: ['iPhone 18', 'Duo', '512GB', 'Blanco estrella', '2,750'] },
    { id: 'macbook-air', model: 1, opt: 2, expect: ['MacBook Air', '15"', '2TB', '2,600'] },
    { id: 'iphone-17', model: 1, opt: 2, color: 2, expect: ['iPhone 17', '17 Pro Max', '1TB', 'Plata', '1,780'] },
  ];
  await open(page, '/tienda.html');
  await page.evaluate(() => localStorage.clear());
  for (const c of cases) {
    const tag = `${label} bag ${c.id}`;
    await open(page, `/producto.html?id=${c.id}`);
    for (const [k, v] of [['model', c.model], ['opt', c.opt], ['color', c.color]]) {
      if (v == null) continue;
      const b = page.locator(`[data-${k}="${v}"]`);
      await b.scrollIntoViewIfNeeded(); await b.click(); await settle(page, 200);
    }
    const add = page.locator('[data-add]');
    await add.scrollIntoViewIfNeeded(); await add.click();
    await settle(page, 1300);
    await page.evaluate(() => window.scrollTo(0, 0)); await settle(page, 600);
    await page.locator('.gnav .bag-btn').click();
    await settle(page, 700);
    const st = await page.evaluate(() => ({
      items: document.querySelector('.drawer__items').textContent.replace(/\s+/g, ' '),
      checkout: decodeURIComponent(document.querySelector('[data-checkout]').href),
      count: document.querySelector('.bag-count').textContent,
    }));
    const missing = c.expect.filter((s) => !st.items.includes(s));
    const missingWa = c.expect.filter((s) => !st.checkout.includes(s));
    if (missing.length) fail(tag, `bag drawer missing ${missing.join(', ')}: ${st.items.slice(0, 160)}`);
    else if (missingWa.length) fail(tag, `WhatsApp order missing ${missingWa.join(', ')}`);
    else pass();
    await page.keyboard.press('Escape');
  }
  const count = await page.$eval('.bag-count', (e) => e.textContent);
  count === String(cases.length) ? pass() : fail(`${label} bag`, `bag count is ${count}, expected ${cases.length}`);
  // Bag items link back to their own product?
  await page.locator('.gnav .bag-btn').click(); await settle(page, 600);
  const back = await page.$$eval('.drawer__items a[href*="producto.html"]', (as) => as.map((a) => a.getAttribute('href')));
  for (const h of back) if (!cases.some((c) => h.includes(`id=${c.id}`))) fail(`${label} bag`, `item links to ${h}`);
  await page.keyboard.press('Escape');
}

async function searchJourneys(page, label) {
  const queries = [['airpods pro', 'AirPods Pro 3'], ['macbook pro', 'MacBook Pro'], ['ipad mini', 'iPad mini'], ['airwrap', 'Dyson'], ['ultra', 'Apple Watch Ultra 3']];
  for (const [q, want] of queries) {
    const tag = `${label} search "${q}"`;
    await open(page, '/tienda.html');
    await page.locator('.gnav [data-open-search]').click();
    await settle(page, 400);
    await page.fill('.search input', q);
    await settle(page, 400);
    const hits = await page.$$eval('.search__hits a', (as) => as.map((a) => ({ name: a.querySelector('strong').textContent.trim(), href: a.getAttribute('href') })));
    const idx = hits.findIndex((h) => h.name.includes(want));
    if (idx < 0) { fail(tag, `no "${want}" in results (${hits.map((h) => h.name).join(', ')})`); continue; }
    try {
      await clickNav(page, () => page.locator('.search__hits a').nth(idx).click());
      const got = await landedOn(page);
      got.h1 === `Comprar ${hits[idx].name}` ? pass() : fail(tag, `clicked "${hits[idx].name}", opened "${got.h1}"`);
    } catch { fail(tag, `clicking "${hits[idx].name}" did not open its product page`); }
  }
}

async function kleberJourneys(page, label) {
  const asks = [['¿cuánto cuesta el macbook air?', 'MacBook Air'], ['precio de los airpods pro 3', 'AirPods Pro 3'], ['quiero un ipad air', 'iPad Air']];
  for (const [q, want] of asks) {
    const tag = `${label} Kleber "${q}"`;
    await open(page, '/servicios.html');
    await settle(page, 1500);
    if (!(await page.isVisible('.kl__launch'))) { fail(tag, 'launcher not visible'); continue; }
    await page.click('.kl__launch'); await settle(page, 500);
    // The chat keeps its history between pages, so only look at the answer to this question.
    const before = await page.$$eval('.kl__msg--bot', (m) => m.length);
    await page.fill('.kl__form input', q); await page.press('.kl__form input', 'Enter');
    await page.waitForFunction((n) => document.querySelectorAll('.kl__msg--bot').length > n && !document.querySelector('.kl__msg--bot .kl__dots'), before, { timeout: 20000 }).catch(() => {});
    await settle(page, 600);
    const links = page.locator(`.kl__msg--bot >> nth=${before}`).locator('a[href*="producto.html"]');
    if (!(await links.count())) { fail(tag, `answer has no product link: ${(await page.locator('.kl__msg--bot').last().textContent()).slice(0, 100)}`); continue; }
    try {
      await clickNav(page, () => links.last().click());
      const got = await landedOn(page);
      got.h1 === `Comprar ${want}` ? pass() : fail(tag, `product link opened "${got.h1}", expected ${want}`);
    } catch { fail(tag, 'product link did not open a product page'); }
  }
}

async function mobileMenu(page, label) {
  await open(page, '/servicios.html');
  const items = await page.evaluate(() => [...document.querySelectorAll('.mmenu ul a')].map((a) => a.getAttribute('href')));
  for (const href of items) {
    await open(page, '/servicios.html');
    await page.click('[data-open-menu]'); await settle(page, 600);
    const sameDoc = href.startsWith('/servicios.html');
    if (sameDoc) await page.locator(`.mmenu a[href="${href}"]`).click();
    else await clickNav(page, () => page.locator(`.mmenu a[href="${href}"]`).click());
    await settle(page, 1500);
    const st = await page.evaluate((href) => {
      const [path, hash] = href.split('#');
      if (location.pathname !== path) return `ended on ${location.pathname}`;
      if (!hash) return true;
      const s = document.getElementById(hash);
      if (!s) return `no #${hash}`;
      const t = s.getBoundingClientRect().top;
      return t < innerHeight * 0.5 && t > -200 ? true : `#${hash} not in view (top=${Math.round(t)})`;
    }, href);
    st === true ? pass() : fail(`${label} menu ${href}`, st);
  }
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const runs = [
    ['desktop', { viewport: { width: 1440, height: 900 } }],
    ['mobile', { ...devices['iPhone 13'] }],
  ].filter(([n]) => !ONLY || ONLY === n);

  for (const [label, opts] of runs) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(`${page.url()} → ${e.message}`));
    page.on('popup', (p) => p.close().catch(() => {}));
    const t0 = Date.now();
    const step = async (name, fn) => {
      if (process.env.STEPS && !process.env.STEPS.split(',').some((k) => name.includes(k))) return;
      const before = problems.length, ps = passed, s = Date.now();
      try { await fn(); } catch (e) { fail(`${label} ${name}`, 'crashed: ' + e.message.split('\n')[0]); }
      console.log(`  ${label.padEnd(7)} ${name.padEnd(22)} ${passed - ps} ok, ${problems.length - before} problems  (${((Date.now() - s) / 1000).toFixed(0)}s)`);
    };
    await step('home product links', () => productJourneys(page, '/', label));
    await step('store product links', () => productJourneys(page, '/tienda.html', label));
    await step('related product links', async () => {
      for (const id of ['iphone-18', 'macbook-air', 'airpods-pro-3', 'dyson-airwrap', 'funda-silicone-17']) await productJourneys(page, `/producto.html?id=${id}`, label);
    });
    await step('section links', () => sectionJourneys(page, label));
    await step('store filters', () => storeFilters(page, label));
    await step('search', () => searchJourneys(page, label));
    await step('Kleber', () => kleberJourneys(page, label));
    if (label === 'mobile') await step('mobile menu', () => mobileMenu(page, label));
    await step('configurator', () => configurator(page, label));
    await step('bag + checkout', () => bagJourney(page, label));
    errors.forEach((e) => fail(`${label} JS error`, e));
    console.log(`  ${label} done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    await ctx.close();
  }

  console.log(`\n${passed} checks passed, ${problems.length} problems`);
  [...new Set(problems)].forEach((p) => console.log(' ✗', p));
  await browser.close();
  process.exit(problems.length ? 1 : 0);
})();

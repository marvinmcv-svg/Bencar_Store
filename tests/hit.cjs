// For every visible link/button at many scroll positions, check the element a user
// would actually click (elementFromPoint at its centre) is that link/button.
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const bad = new Map();
  for (const path of ['/', '/tienda.html', '/servicios.html', '/producto.html?id=iphone-18']) {
    await p.goto(BASE + path); await p.waitForTimeout(800); await p.mouse.wheel(0, 10); await p.waitForTimeout(300);
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 450) {
      await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(700);
      const r = await p.evaluate(() => {
        const out = [];
        const vis = (el) => { let e = el; while (e && e !== document.body) { const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.5) return false; e = e.parentElement; } return true; };
        document.querySelectorAll('a[href], button').forEach((el) => {
          const rc = el.getBoundingClientRect();
          if (rc.width < 4 || rc.height < 4 || rc.bottom < 60 || rc.top > innerHeight - 10 || rc.right < 0 || rc.left > innerWidth) return;
          if (!vis(el)) return;
          const x = rc.left + rc.width / 2, yy = rc.top + rc.height / 2;
          const hit = document.elementFromPoint(x, yy);
          if (!hit || el.contains(hit) || hit.contains(el)) return;
          const desc = (e) => `${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : ''}${e.getAttribute && e.getAttribute('href') ? `[${e.getAttribute('href')}]` : ''}`;
          const hitLink = hit.closest('a,button');
          out.push(`"${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${desc(el)} covered by ${desc(hit)}${hitLink ? ' → clicks ' + desc(hitLink) : ''}`);
        });
        return out;
      });
      r.forEach((x) => bad.set(path + ' ' + x, 1));
    }
  }
  [...bad.keys()].forEach((k) => console.log('✗', k));
  console.log(bad.size, 'covered buttons');
  await b.close();
})();

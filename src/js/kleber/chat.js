// Kleber chat widget: floating launcher with his animated face, a chat panel,
// quick replies and a WhatsApp hand-off. Answers come from /api/kleber (Claude)
// when the site is deployed with an API key; otherwise from the built-in
// catalogue answers below, so the receptionist always works.
import { gsap } from 'gsap';
import { kleberSVG } from './avatar.js';
import { products, categories, fmt, fromPrice } from '../../data/catalog.js';
import { CONFIG, waLink } from '../../config.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const STORE_KEY = 'bencar.kleber.v1';
const QUICK = ['¿Cuánto cuesta el iPhone 18?', 'Quiero dar mi iPhone como parte de pago', 'Servicio técnico', '¿Tienen seminuevos?'];

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// Plain text -> safe HTML: line breaks, and in-site product links become links.
const rich = (s) => esc(s)
  .replace(/\[?(\/producto\.html\?id=[a-z0-9-]+(?:&amp;model=\d)?)\]?/g, (_, href) => {
    const id = href.match(/id=([a-z0-9-]+)/)[1];
    const p = products.find((x) => x.id === id);
    return `<a href="${href.replace(/&amp;/g, '&')}">${p ? `Ver ${esc(p.name)} ›` : 'Ver producto ›'}</a>`;
  })
  .replace(/(^|\s)(\/servicios\.html#[a-z-]+)/g, (_, pre, href) => `${pre}<a href="${href}">Ver servicio ›</a>`)
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/\n/g, '<br>');

// ── Built-in answers (no API key needed) ──────────────────────────────────
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const ALIASES = { airpod: 'airpods', macbook: 'mac', ipad: 'ipad', watch: 'watch', reloj: 'watch', cargador: 'cubo', funda: 'funda', case: 'funda', protector: 'protector', mica: 'protector' };

function findProducts(q) {
  const words = norm(q).replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 1).map((w) => ALIASES[w] || w);
  const scored = products.map((p) => {
    const hay = norm(`${p.name} ${p.id.replace(/-/g, ' ')} ${p.cat}`);
    let s = 0;
    words.forEach((w) => { if (hay.includes(w)) s += /\d/.test(w) ? 3 : 1; });
    if (norm(q).includes(norm(p.name))) s += 4;
    return { p, s };
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
  if (!scored.length) return [];
  return scored.filter((x) => x.s === scored[0].s).slice(0, 3).map((x) => x.p);
}

function priceLines(p) {
  return p.models.filter((m) => !m.soldOut).slice(0, 4).map((m) => {
    const opts = m.options.map((o) => (o.price == null ? `${o.label}: consultar` : `${o.label} ${fmt(o.price, p.currency)}`)).join(', ');
    return `- ${p.models.length > 1 ? `${m.name}: ` : ''}${opts}`;
  }).join('\n');
}

function localReply(text) {
  const t = norm(text);
  const has = (...k) => k.some((w) => t.includes(w));
  if (has('hola', 'buenas', 'hey', 'hello') && t.length < 25) return `¡Hola! Soy Kleber 👋 ¿Buscas algún equipo en especial? Te paso precios del catálogo al toque.`;
  if (has('parte de pago', 'trade', 'recib', 'cambiar mi', 'vender mi', 'dar mi')) return `¡Claro! Recibimos tu iPhone, iPad, Mac o Apple Watch como parte de pago, y te ayudamos a venderlo gratis por tu compra. Mándanos modelo, capacidad y estado por WhatsApp y te cotizamos.`;
  if (has('tecnic', 'repar', 'pantalla rota', 'bateria', 'arregl')) return `Nuestro servicio técnico es puerta a puerta: cotizamos, recogemos tu equipo, lo reparamos y te lo devolvemos. Cuéntame qué le pasa por WhatsApp y te damos el costo exacto.`;
  if (has('seminuev', 'usado')) return `Tenemos más de 50 Mac seminuevas (MacBooks, iMacs) desde $200, y consultas por iPhone, iPad y Watch. /producto.html?id=mac-seminuevos`;
  if (has('dinamica', 'sorteo', 'grupo', 'ganar')) return `En las Dinámicas Bencar puedes ganar accesorios, iPhones, Dysons y más. Únete al grupo desde la página de servicios: /servicios.html#dinamicas`;
  if (has('entrega', 'envio', 'delivery', 'donde estan', 'ubicacion', 'direccion', 'horario')) return `Coordinamos entrega o retiro por WhatsApp, en tiempo récord. Escríbenos y te confirmamos la mejor opción para ti.`;
  if (has('pago', 'tarjeta', 'credito', 'cuotas', 'presupuesto', 'financ')) return `Aceptamos pagos en dólares y en bolivianos, y si tienes un presupuesto ajustado armamos un plan a tu medida. Coordinemos los detalles por WhatsApp.`;
  if (has('repuesto', 'auto', 'vehiculo', 'carro')) return `También vemos repuestos y venta de vehículos: te cotizamos el repuesto exacto o dejamos tu auto impecable para venderlo rápido. Detalles en /servicios.html#repuestos`;
  const found = findProducts(text);
  if (found.length) {
    return found.map((p) => {
      const from = fromPrice(p);
      return `**${p.name}** — ${from != null ? `desde ${fmt(from, p.currency)}` : 'precio a consultar'}\n${priceLines(p)}\n/producto.html?id=${p.id}`;
    }).join('\n\n');
  }
  const cat = categories.find((c) => t.includes(norm(c.name)) || t.includes(c.id));
  if (cat) return `En ${cat.name} tenemos: ${products.filter((p) => p.cat === cat.id).map((p) => p.name).join(', ')}. ¿Cuál te interesa?`;
  return `Mmm, esa no me la sé todavía 😅 Pero un asesor de Bencar te responde al instante por WhatsApp. ¿Quieres que te pase con ellos?`;
}

async function aiReply(history) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch('/api/kleber', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }), signal: ctrl.signal });
    if (!r.ok) return null;
    const { reply } = await r.json();
    return reply || null;
  } catch { return null; } finally { clearTimeout(timer); }
}

// ── Widget ────────────────────────────────────────────────────────────────
export function mountKleber() {
  let history = [];
  try { history = JSON.parse(sessionStorage.getItem(STORE_KEY) || '[]'); } catch { history = []; }
  const save = () => { try { sessionStorage.setItem(STORE_KEY, JSON.stringify(history.slice(-30))); } catch { /* private mode */ } };

  const root = document.createElement('div');
  root.className = 'kl';
  root.innerHTML = `
    <button class="kl__launch" type="button" aria-expanded="false" aria-controls="kl-panel" aria-label="Habla con Kleber, el recepcionista de Bencar">
      ${kleberSVG({ cls: 'kl__face' })}
      <span class="kl__bubble" aria-hidden="true">¡Hola! Soy Kleber 👋</span>
    </button>
    <section class="kl__panel" id="kl-panel" role="dialog" aria-label="Chat con Kleber" hidden>
      <header class="kl__head">
        <div class="kl__avatar">${kleberSVG({ cls: 'kl__face kl__face--head' })}</div>
        <div><strong>Kleber</strong><span><i></i> Recepcionista IA de ${CONFIG.brand}</span></div>
        <button class="kl__close" type="button" aria-label="Cerrar chat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
      </header>
      <div class="kl__log" aria-live="polite"></div>
      <div class="kl__quick"></div>
      <form class="kl__form">
        <input type="text" name="q" placeholder="Pregúntale a Kleber…" autocomplete="off" aria-label="Escribe tu mensaje" maxlength="600"/>
        <button type="submit" aria-label="Enviar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h14M12 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </form>
      <a class="kl__wa" target="_blank" rel="noopener">Seguir por WhatsApp con un asesor ›</a>
    </section>`;
  document.body.append(root);

  const launch = root.querySelector('.kl__launch');
  const panel = root.querySelector('.kl__panel');
  const log = root.querySelector('.kl__log');
  const quick = root.querySelector('.kl__quick');
  const form = root.querySelector('.kl__form');
  const input = form.elements.q;
  const wa = root.querySelector('.kl__wa');
  const faces = root.querySelectorAll('.kleber');

  const updateWa = () => {
    const last = [...history].reverse().find((m) => m.role === 'user');
    wa.href = waLink(`¡Hola Bencar! Kleber me mandó con ustedes.${last ? ` Consulta: ${last.content}` : ''}`);
  };
  const bubble = (role, html) => {
    const el = document.createElement('div');
    el.className = `kl__msg kl__msg--${role}`;
    el.innerHTML = html;
    log.append(el);
    log.scrollTop = log.scrollHeight;
    if (!reduced) gsap.from(el, { y: 14, opacity: 0, scale: 0.96, duration: 0.45, ease: 'back.out(1.6)' });
    return el;
  };
  const talk = (on) => faces.forEach((f) => f.classList.toggle('is-talking', on));
  const drawQuick = () => { quick.innerHTML = history.length > 2 ? '' : QUICK.map((q) => `<button type="button">${q}</button>`).join(''); };

  const greet = `¡Hola! Soy <strong>Kleber</strong>, el recepcionista de Bencar 😄 Pregúntame precios, modelos, parte de pago o servicio técnico.`;
  bubble('bot', greet);
  history.forEach((m) => bubble(m.role === 'user' ? 'me' : 'bot', m.role === 'user' ? esc(m.content) : rich(m.content)));
  drawQuick(); updateWa();

  let busy = false;
  async function send(text) {
    text = text.trim();
    if (!text || busy) return;
    busy = true;
    bubble('me', esc(text));
    history.push({ role: 'user', content: text });
    drawQuick();
    const typing = bubble('bot', '<span class="kl__dots"><i></i><i></i><i></i></span>');
    talk(true);
    const [reply] = await Promise.all([
      aiReply(history).then((r) => r || localReply(text)),
      new Promise((r) => setTimeout(r, 650)), // a beat, so it reads like typing
    ]);
    typing.remove();
    bubble('bot', rich(reply));
    history.push({ role: 'assistant', content: reply });
    save(); updateWa();
    setTimeout(() => talk(false), Math.min(2600, 500 + reply.length * 18));
    busy = false;
  }

  const open = (state) => {
    const isOpen = state ?? panel.hidden;
    panel.hidden = !isOpen;
    launch.setAttribute('aria-expanded', String(isOpen));
    root.classList.toggle('is-open', isOpen);
    if (isOpen) {
      if (!reduced) gsap.fromTo(panel, { y: 24, opacity: 0, scale: 0.94, transformOrigin: '100% 100%' }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)' });
      setTimeout(() => input.focus(), 50);
      log.scrollTop = log.scrollHeight;
    }
  };
  launch.addEventListener('click', () => open());
  root.querySelector('.kl__close').addEventListener('click', () => { open(false); launch.focus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) open(false); });
  quick.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) send(b.textContent); });
  form.addEventListener('submit', (e) => { e.preventDefault(); const v = input.value; input.value = ''; send(v); });

  // Eyes follow the pointer; random blinks; a hello wave once the page settles.
  const pupils = root.querySelectorAll('.k-pupils');
  window.addEventListener('pointermove', (e) => {
    const r = launch.getBoundingClientRect();
    const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 300));
    const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / 300));
    pupils.forEach((p) => { p.style.transform = `translate(${dx * 6}px, ${dy * 5}px)`; });
  }, { passive: true });
  const blink = () => {
    faces.forEach((f) => { f.classList.add('is-blink'); setTimeout(() => f.classList.remove('is-blink'), 140); });
    setTimeout(blink, 2200 + Math.random() * 3200);
  };
  setTimeout(blink, 1800);
  if (!reduced) {
    gsap.from(launch, { scale: 0, rotation: -40, duration: 1, ease: 'elastic.out(1, .5)', delay: 1.4 });
    gsap.fromTo(root.querySelector('.kl__bubble'), { opacity: 0, x: 10 }, { opacity: 1, x: 0, duration: 0.6, delay: 2.4, ease: 'back.out(2)',
      onComplete: () => gsap.to(root.querySelector('.kl__bubble'), { opacity: 0, x: 10, duration: 0.4, delay: 4 }) });
  }
}

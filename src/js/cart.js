// Bag state (per-viewer, browser storage) + WhatsApp checkout.
import { CONFIG, waLink } from '../config.js';
import { fmt } from '../data/catalog.js';

const KEY = 'bencar.bag.v1';
let items = load();
const subs = new Set();

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage unavailable: bag lives in memory */ }
  subs.forEach((fn) => fn(items));
}

export const bag = {
  get items() { return items; },
  get count() { return items.reduce((n, i) => n + i.qty, 0); },
  subscribe(fn) { subs.add(fn); fn(items); return () => subs.delete(fn); },
  add(item) {
    const key = [item.id, item.model, item.option, item.color].join('|');
    const found = items.find((i) => i.key === key);
    if (found) found.qty += 1; else items.push({ ...item, key, qty: 1 });
    save();
  },
  setQty(key, qty) {
    items = qty <= 0 ? items.filter((i) => i.key !== key) : items.map((i) => (i.key === key ? { ...i, qty } : i));
    save();
  },
  clear() { items = []; save(); },
  totals() {
    const t = { USD: 0, BOB: 0, quote: 0 };
    items.forEach((i) => { if (i.price == null) t.quote += i.qty; else t[i.currency] += i.price * i.qty; });
    return t;
  },
  totalLabel() {
    const t = this.totals();
    const parts = [];
    if (t.USD) parts.push(fmt(t.USD, 'USD'));
    if (t.BOB) parts.push(fmt(t.BOB, 'BOB'));
    if (!parts.length) return t.quote ? 'A cotizar' : fmt(0, 'USD');
    return parts.join(' + ') + (t.quote ? ' + a cotizar' : '');
  },
  checkoutLink() {
    const lines = items.map((i) => {
      const spec = [i.model, i.option, i.color].filter(Boolean).join(' · ');
      return `• ${i.qty} × ${i.name}${spec ? ` (${spec})` : ''} — ${i.price == null ? 'consultar precio' : fmt(i.price * i.qty, i.currency)}`;
    });
    const msg = `¡Hola ${CONFIG.brand}! Quiero hacer este pedido:\n\n${lines.join('\n')}\n\nTotal: ${this.totalLabel()}\n\n¿Me confirman disponibilidad y entrega?`;
    return waLink(msg);
  },
};

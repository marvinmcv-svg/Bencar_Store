// Kleber, the Bencar AI receptionist — Vercel serverless function.
// POST /api/kleber  { messages: [{ role: 'user' | 'assistant', content: string }] }
// -> { reply: string }
// Uses DeepSeek through NVIDIA's OpenAI-compatible API. Needs NVIDIA_API_KEY (or api_key) in the
// Vercel project's environment variables; without it the chat widget falls back to
// its built-in catalogue answers.
import { products, categories, services, fmt, CATALOG_DATE } from '../src/data/catalog.js';
import { CONFIG } from '../src/config.js';

const API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL = process.env.KLEBER_MODEL || 'deepseek-ai/deepseek-v4.1-flash';

// The catalogue is rendered once per cold start, so the system prompt stays
// byte-identical between requests and the prompt cache can reuse it.
const catalogText = categories.map((c) => {
  const items = products.filter((p) => p.cat === c.id).map((p) => {
    const models = p.models.map((m) => {
      if (m.soldOut) return `${m.name}: agotado`;
      const opts = m.options.map((o) => `${o.label} ${fmt(o.price, p.currency)}`).join(', ');
      return `${m.name}: ${opts}`;
    }).join(' | ');
    const extra = [p.colors && `colores: ${p.colors.map((x) => x.name).join(', ')}`, p.note, p.promo].filter(Boolean).join(' ');
    return `- ${p.name} [/producto.html?id=${p.id}] — ${models}${extra ? ` (${extra})` : ''}`;
  }).join('\n');
  return `## ${c.name}\n${items}`;
}).join('\n\n');

const servicesText = services.map((s) => `- ${s.title}: ${s.body}`).join('\n');

const SYSTEM = `Eres Kleber, el recepcionista virtual de ${CONFIG.brand} (${CONFIG.tagline}), una tienda en ${CONFIG.country}. Instagram ${CONFIG.instagramHandle}. Teléfonos: ${CONFIG.phones.map((p) => p.display).join(', ')}.

Tu personalidad: un chico simpático, curioso y con buen humor, que conoce cada producto de la tienda. Hablas en español neutro y cercano (tuteas), o en el idioma en que te escriban.

Cómo responder:
- Respuestas cortas: 1 a 4 frases, máximo unas 80 palabras. Es un chat, no un correo.
- Usa solo los precios y productos del catálogo de abajo (${CATALOG_DATE}). Si algo no está, dilo y ofrece consultar por WhatsApp. Nunca inventes precios, stock, horarios ni direcciones.
- "Consultar" significa que el precio se da por mensaje.
- Cuando recomiendes un producto, incluye su enlace tal cual aparece entre corchetes, por ejemplo /producto.html?id=iphone-18.
- Para comprar, reservar, coordinar entrega o pagar, invita a escribir por WhatsApp; ahí un asesor confirma disponibilidad.
- Recuerda los diferenciales: recibimos su equipo como parte de pago, seminuevos, servicio técnico puerta a puerta, entrega rápida.
- Sin markdown pesado: nada de títulos ni tablas. Puedes usar listas cortas con guiones.

# Catálogo
${catalogText}

# Servicios
${servicesText}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  // Accept the key however it was pasted: on its own, quoted, with "Bearer", or
  // inside NVIDIA's whole sample-code snippet — pull out the nvapi-… token.
  const raw = process.env.NVIDIA_API_KEY || process.env.api_key || '';
  const key = (raw.match(/nvapi-[A-Za-z0-9_-]+/) || [raw.trim().replace(/^Bearer\s+/i, '').replace(/^["'`]|["'`]$/g, '')])[0];
  if (!key) { res.status(503).json({ error: 'not configured' }); return; }

  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch { body = {}; } }
  const history = Array.isArray(body.messages) ? body.messages : [];
  // Keep the last turns only, with plain-text content of bounded size.
  const messages = history.slice(-12)
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }));
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== 'user') { res.status(400).json({ error: 'last message must be from the user' }); return; }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const r = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: SYSTEM }, ...messages],
        temperature: 0.6,
        top_p: 0.95,
        max_tokens: 700,
        stream: false,
      }),
      signal: ctrl.signal,
    });
    if (!r.ok) {
      if (r.status === 401 || r.status === 403) {
        // Shape only, never the key itself.
        console.error(`kleber: NVIDIA rejected the key (${r.status}); length ${key.length}, starts with nvapi-: ${key.startsWith('nvapi-')}, placeholder: ${key.includes('$')}`);
      }
      res.status(r.status === 429 ? 429 : 502).json({ error: `upstream ${r.status}` }); return; }
    const data = await r.json();
    // Reasoning models may include their thinking in <think> tags: keep only the answer.
    const reply = String(data?.choices?.[0]?.message?.content || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    if (!reply) { res.status(502).json({ error: 'empty reply' }); return; }
    res.status(200).json({ reply });
  } catch (err) {
    const timedOut = err?.name === 'AbortError';
    if (!timedOut) console.error(`kleber: request failed: ${err?.name} (key length ${key.length}, nvapi- prefix: ${key.startsWith('nvapi-')})`); // never log err.message: it can echo the key
    res.status(timedOut ? 504 : 502).json({ error: timedOut ? 'timeout' : 'request failed' });
  } finally {
    clearTimeout(timer);
  }
}

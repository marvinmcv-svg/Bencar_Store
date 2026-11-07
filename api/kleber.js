// Kleber, the Bencar AI receptionist — Vercel serverless function.
// POST /api/kleber  { messages: [{ role: 'user' | 'assistant', content: string }] }
// -> { reply: string }
// Needs ANTHROPIC_API_KEY in the Vercel project's environment variables.
// Without it the chat widget falls back to its built-in answers.
import Anthropic from '@anthropic-ai/sdk';
import { products, categories, services, fmt, CATALOG_DATE } from '../src/data/catalog.js';
import { CONFIG } from '../src/config.js';

const client = new Anthropic();

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
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) { res.status(503).json({ error: 'not configured' }); return; }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const history = Array.isArray(body.messages) ? body.messages : [];
  // Keep the last turns only, with plain-text content of bounded size.
  const messages = history.slice(-12)
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }));
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== 'user') { res.status(400).json({ error: 'last message must be from the user' }); return; }

  try {
    const response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 1024,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low' },
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages,
    });
    if (response.stop_reason === 'refusal') {
      res.status(200).json({ reply: 'Eso no lo puedo responder por aquí. ¿Te ayudo con algún producto o servicio de Bencar?' });
      return;
    }
    const reply = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    res.status(200).json({ reply });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) res.status(429).json({ error: 'busy' });
    else if (error instanceof Anthropic.APIError) res.status(502).json({ error: `upstream ${error.status}` });
    else res.status(500).json({ error: 'failed' });
  }
}

// ---------------------------------------------------------------------------
// Bencar catalogue — source: Bencar Canva catalogue "Productos Apple y más",
// Octubre 2026. Prices are kept exactly as published.
//   price: number  -> priced item
//   price: null    -> "Consultar" (the catalogue says DM)
//   currency: 'USD' ($) | 'BOB' (Bs)
// To update the store, edit this file only.
// ---------------------------------------------------------------------------

import { IMAGES, COLOR_IMAGES } from './images.js';

export const CATALOG_DATE = 'Octubre 2026';

export const categories = [
  { id: 'iphone', name: 'iPhone', art: 'phone', blurb: 'iPhone 18 y 17. Precios por capacidad.' },
  { id: 'mac', name: 'Mac', art: 'laptop', blurb: 'MacBook Air y Pro con chip M5.' },
  { id: 'ipad', name: 'iPad', art: 'tablet', blurb: 'iPad, Air, Pro y mini.' },
  { id: 'watch', name: 'Apple Watch', art: 'watch', blurb: 'Series 11, Ultra 3 y SE 3.' },
  { id: 'airpods', name: 'AirPods', art: 'buds', blurb: 'AirPods 4, 5, Pro 3 y Max 2.' },
  { id: 'accesorios', name: 'Accesorios', art: 'accessory', blurb: 'Originales Apple.' },
  { id: 'anker', name: 'Anker', art: 'charger', blurb: 'Carga rápida y cables.' },
  { id: 'fundas', name: 'Fundas', art: 'case', blurb: 'Originales Apple y marcas top.' },
  { id: 'protectores', name: 'Protectores', art: 'protector', blurb: 'iPhone y iPad.' },
  { id: 'dyson', name: 'Dyson', art: 'dyson', blurb: 'Airwrap, Supersonic y Airstrait.' },
];

// Real finishes of the Pro models; each one has its own Apple photo set (COLOR_IMAGES).
const IPHONE_17_COLORS = [
  { name: 'Naranja cósmico', hex: '#e2793a' },
  { name: 'Azul profundo', hex: '#3b4660' },
  { name: 'Plata', hex: '#e3e4e6' },
];
const IPHONE_18_COLORS = [
  { name: 'Plata', hex: '#e3e4e6' },
  { name: 'Burdeos', hex: '#5e2430' },
  { name: 'Azul glaciar', hex: '#b5c9de' },
  { name: 'Negro', hex: '#2c2c2e' },
];
// iPhone Duo (the foldable) comes in its own two finishes, with its own photos.
const IPHONE_DUO_COLORS = [
  { name: 'Cielo nocturno', hex: '#353e4a' },
  { name: 'Blanco estrella', hex: '#ecebe9' },
];

const IPHONE_11_TO_17 = [
  'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max', 'iPhone 12', 'iPhone 12 Pro', 'iPhone 12 Pro Max',
  'iPhone 13', 'iPhone 13 Pro', 'iPhone 13 Pro Max', 'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
  'iPhone 15', 'iPhone 15 Pro', 'iPhone 15 Pro Max', 'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max',
  'iPhone 17', 'iPhone 17 Air', 'iPhone 17 Pro', 'iPhone 17 Pro Max',
];

const o = (label, price, extra = {}) => ({ label, price, ...extra });

export const products = [
  // ───────────── iPhone ─────────────
  {
    id: 'iphone-18', cat: 'iphone', name: 'iPhone 18', art: 'phone', tint: '#c9ccd2',
    badge: 'Nuevo', currency: 'USD', featured: true, colors: IPHONE_18_COLORS,
    tagline: 'El más nuevo. Tres modelos, hasta 2TB.',
    promo: 'Por la compra de tu iPhone 18, obtén un 50% de descuento en tu funda original Apple y llévate un protector de pantalla de regalo.',
    models: [
      { name: '18 Pro', options: [o('256GB', 1680), o('512GB', 1870), o('1TB', 2295), o('2TB', 2945)] },
      { name: '18 Pro Max', options: [o('256GB', 1770), o('512GB', 1975), o('1TB', 2395), o('2TB', 3050)] },
      { name: '18 DUO', colors: IPHONE_DUO_COLORS, imagesKey: 'iphone-duo', options: [o('256GB', 2550), o('512GB', 2750), o('1TB', 3170), o('2TB', 3780)] },
    ],
  },
  {
    id: 'iphone-17', cat: 'iphone', name: 'iPhone 17', art: 'phone', tint: '#5b7a99',
    currency: 'USD', featured: true, colors: IPHONE_17_COLORS,
    tagline: 'Pro y Pro Max disponibles. Recibimos tu iPhone en forma de pago.',
    note: 'Recibimos tu iPhone en forma de pago (servicio gratuito por compra de iPhone). ¡Seminuevos disponibles!',
    models: [
      { name: '17 Pro', options: [o('256GB', 1320), o('512GB', 1480)] },
      { name: '17 Pro Max', options: [o('256GB', 1430), o('512GB', 1650), o('1TB', 1780)] },
      { name: '17 Air', soldOut: true, options: [] },
      { name: '17', soldOut: true, options: [] },
    ],
  },

  // ───────────── Mac ─────────────
  {
    id: 'macbook-air', cat: 'mac', name: 'MacBook Air', art: 'laptop', tint: '#c7d3de',
    currency: 'USD', featured: true, badge: 'M5',
    tagline: 'Chip M5. Ligera como siempre, más potente que nunca.',
    note: 'Te ayudamos a vender tu Mac (servicio gratuito por compra de Mac).',
    models: [
      { name: '13" · M5 · 16GB RAM', options: [o('512GB', 1575), o('1TB', 1920), o('2TB', 2380)] },
      { name: '15" · M5 · 16GB RAM', options: [o('512GB', 1790), o('1TB', 2110), o('2TB', 2600)] },
      { name: '13" · M5 · 24GB RAM', options: [o('512GB', 1790), o('1TB', 2120), o('2TB', 2690)] },
      { name: '15" · M5 · 24GB RAM', options: [o('512GB', 2050), o('1TB', 2375), o('2TB', 2860)] },
    ],
  },
  {
    id: 'macbook-pro', cat: 'mac', name: 'MacBook Pro', art: 'laptop', tint: '#3a3d42',
    currency: 'USD', featured: true, badge: 'M5',
    tagline: 'M5 y M5 Pro. Potencia de verdad.',
    note: 'Te ayudamos a vender tu Mac (servicio gratuito por compra de Mac).',
    models: [
      { name: '14" · M5 · 16GB RAM', options: [o('1TB', 2440), o('2TB', 2905), o('4TB', 3850)] },
      { name: '14" · M5 · 24GB RAM', options: [o('1TB', 2630), o('2TB', null), o('4TB', null)] },
      { name: '16" · M5 Pro · 24GB RAM', options: [o('Consultar', null)] },
      { name: '16" · M5 Pro · 48GB RAM', options: [o('Consultar', null)] },
    ],
  },
  {
    id: 'mac-seminuevos', cat: 'mac', name: 'Mac seminuevos', art: 'laptop', tint: '#9aa6b2',
    currency: 'USD', badge: 'Desde $200', fromPrice: 200,
    tagline: '¡Más de 50 MacBooks, iMacs y más disponibles!',
    note: 'Equipos seminuevos en perfecto estado y al precio que estás buscando. ¡Rápidos, potentes y listos para trabajar o estudiar! (Stock limitado)',
    models: [{ name: 'Seminuevo', options: [o('Consultar stock', null)] }],
  },

  // ───────────── iPad ─────────────
  {
    id: 'ipad-11', cat: 'ipad', name: 'iPad', art: 'tablet', tint: '#d6dde6', currency: 'USD',
    tagline: '11ª generación.',
    note: 'Te ayudamos a vender tu iPad (servicio gratuito por compra de iPad). ¡Consulta por seminuevos!',
    models: [{ name: '11ª generación', options: [o('128GB', 620), o('256GB', 765), o('512GB', null)] }],
  },
  {
    id: 'ipad-air', cat: 'ipad', name: 'iPad Air', art: 'tablet', tint: '#9fb4cc', currency: 'USD', featured: true,
    tagline: 'Chip M3. En 11 y 13 pulgadas.',
    note: 'Te ayudamos a vender tu iPad (servicio gratuito por compra de iPad).',
    models: [
      { name: 'Air M3 · 11"', options: [o('128GB', 899), o('256GB', 999), o('512GB', null), o('1TB', null)] },
      { name: 'Air M3 · 13"', options: [o('Consultar', null)] },
    ],
  },
  {
    id: 'ipad-pro', cat: 'ipad', name: 'iPad Pro', art: 'tablet', tint: '#3b3e44', currency: 'USD', badge: 'M5',
    tagline: 'Chip M5. 11 y 13 pulgadas.',
    models: [
      { name: 'Pro M5 · 11"', options: [o('Consultar', null)] },
      { name: 'Pro M5 · 13"', options: [o('Consultar', null)] },
    ],
  },
  {
    id: 'ipad-mini', cat: 'ipad', name: 'iPad mini', art: 'tablet', tint: '#c9b8d8', currency: 'USD',
    tagline: '7ª generación. Megapotencia, minitamaño.',
    models: [{ name: 'mini 7ª generación', options: [o('Consultar', null)] }],
  },

  // ───────────── Apple Watch ─────────────
  {
    id: 'watch-s11', cat: 'watch', name: 'Apple Watch Series 11', art: 'watch', tint: '#2d3137', currency: 'USD', featured: true,
    tagline: 'Aluminio. 42 y 46 mm.',
    note: 'Te ayudamos a vender tu Apple Watch (servicio gratuito por compra de Apple Watch).',
    models: [{ name: 'Aluminio', options: [o('42mm', 500), o('46mm', 590)] }],
  },
  {
    id: 'watch-ultra-3', cat: 'watch', name: 'Apple Watch Ultra 3', art: 'watch', tint: '#b9b2a6', currency: 'USD', badge: 'Titanio',
    tagline: 'Titanio. 49 mm. Para todas las aventuras.',
    models: [{ name: 'Titanio', options: [o('49mm', 1070)] }],
  },
  {
    id: 'watch-se3', cat: 'watch', name: 'Apple Watch SE 3', art: 'watch', tint: '#e3ddd3', currency: 'USD',
    tagline: 'Aluminio. 40 y 44 mm.',
    models: [{ name: 'Aluminio', options: [o('40mm', 395), o('44mm', 420)] }],
  },

  // ───────────── AirPods ─────────────
  { id: 'airpods-4', cat: 'airpods', name: 'AirPods 4', art: 'buds', currency: 'USD', tagline: 'Sonido icónico.', models: [{ name: 'AirPods 4', options: [o('Estándar', null)] }] },
  { id: 'airpods-4-anc', cat: 'airpods', name: 'AirPods 4 con cancelación de ruido', art: 'buds', currency: 'USD', tagline: 'Sound Canceling.', models: [{ name: 'Sound Canceling', options: [o('Estándar', 220)] }] },
  { id: 'airpods-5', cat: 'airpods', name: 'AirPods 5', art: 'buds', currency: 'USD', badge: 'Nuevo', featured: true, tagline: 'Sound Canceling.', models: [{ name: 'Sound Canceling', options: [o('Estándar', 250)] }] },
  { id: 'airpods-pro-3', cat: 'airpods', name: 'AirPods Pro 3', art: 'buds', currency: 'USD', featured: true, tagline: 'Sound Canceling. Pro de verdad.', models: [{ name: 'Sound Canceling', options: [o('Estándar', 310)] }] },
  { id: 'airpods-max-2', cat: 'airpods', name: 'AirPods Max 2', art: 'headphones', tint: '#9fb4cc', currency: 'USD', tagline: 'Sound Canceling. Over-ear.', models: [{ name: 'Sound Canceling', options: [o('Estándar', null)] }] },

  // ───────────── Accesorios Apple ─────────────
  { id: 'magic-mouse', cat: 'accesorios', name: 'Magic Mouse', art: 'mouse', currency: 'USD', tagline: 'Lightning o USB-C.', models: [{ name: 'Conector', options: [o('Lightning', 135), o('Tipo C', 152)] }] },
  { id: 'apple-pencil', cat: 'accesorios', name: 'Apple Pencil', art: 'pencil', currency: 'USD', tagline: 'Para tu iPad.', models: [{ name: 'Apple Pencil', options: [o('Consultar', null)] }] },
  { id: 'airtag', cat: 'accesorios', name: 'AirTag', art: 'airtag', currency: 'USD', featured: true, tagline: 'Encuentra lo que importa.', models: [{ name: 'Pack', options: [o('1 unidad', 37), o('4-Pack', 142)] }] },
  { id: 'adaptador-jack', cat: 'accesorios', name: 'Adaptador a Jack 3.5mm', art: 'cable', currency: 'USD', tagline: 'Original Apple.', models: [{ name: 'Adaptador', options: [o('Estándar', 23)] }] },
  { id: 'cubo-20w', cat: 'accesorios', name: 'Cubo 20W', art: 'charger', currency: 'USD', tagline: 'Adaptador de corriente USB-C original.', models: [{ name: '20W', options: [o('Estándar', 38)] }] },
  { id: 'cable-usbc-lightning', cat: 'accesorios', name: 'Cable USB-C a Lightning', art: 'cable', currency: 'USD', tagline: 'Original Apple.', models: [{ name: 'Largo', options: [o('1m', 34), o('2m', 37)] }] },
  { id: 'cable-usbc', cat: 'accesorios', name: 'Cable USB-C', art: 'cable', currency: 'USD', tagline: 'Original Apple.', models: [{ name: 'Largo', options: [o('1m', 34), o('2m', 39)] }] },
  { id: 'cargador-watch', cat: 'accesorios', name: 'Cargador Apple Watch', art: 'charger', currency: 'USD', tagline: 'Carga magnética.', models: [{ name: 'Cargador', options: [o('Estándar', 39)] }] },
  { id: 'earpods', cat: 'accesorios', name: 'EarPods', art: 'cable', currency: 'USD', tagline: 'Los clásicos.', models: [{ name: 'EarPods', options: [o('Estándar', 35)] }] },

  // ───────────── Anker ─────────────
  { id: 'anker-nano-pd-20', cat: 'anker', name: 'Anker Nano PD 20W', art: 'charger', tint: '#2b2d31', currency: 'USD', tagline: 'Compacto y rápido.', models: [{ name: 'Cargador', options: [o('Solo cubo', 23)] }] },
  { id: 'anker-nano-pro-20', cat: 'anker', name: 'Anker Nano PRO 20W', art: 'charger', tint: '#5b7a99', currency: 'USD', tagline: 'Carga rápida en tamaño mínimo.', models: [{ name: 'Cargador', options: [o('Solo cubo', 27)] }] },
  { id: 'anker-nano-gan-30', cat: 'anker', name: 'Anker Nano GaN 30W', art: 'charger', tint: '#e3e5e8', currency: 'USD', tagline: 'Tecnología GaN.', models: [{ name: 'Cargador', options: [o('Solo cubo', 33)] }] },
  { id: 'anker-doble-20', cat: 'anker', name: 'Anker Doble Puerto 20W', art: 'charger', tint: '#2b2d31', currency: 'USD', tagline: 'Dos dispositivos a la vez.', models: [{ name: 'Cargador', options: [o('Solo cubo', 35)] }] },
  { id: 'anker-100w', cat: 'anker', name: 'Anker 100W + Cable', art: 'charger', tint: '#2b2d31', currency: 'USD', badge: '100W', tagline: 'Para tu MacBook y más.', models: [{ name: 'Kit', options: [o('Cubo + cable', 49)] }] },
  { id: 'anker-nano-pd-kit', cat: 'anker', name: 'Anker Nano PD 20W + Cable', art: 'charger', tint: '#e3e5e8', currency: 'USD', tagline: 'Cubo y cable en un solo kit.', models: [{ name: 'Kit', options: [o('Kit', 41), o('Lightning', 46), o('Tipo C', 45)] }] },
  { id: 'anker-usba-usbc', cat: 'anker', name: 'Anker cable USB-A a USB-C', art: 'cable', currency: 'USD', tagline: '2 metros.', models: [{ name: 'Largo', options: [o('2m', 19)] }] },
  { id: 'anker-usbc-usbc', cat: 'anker', name: 'Anker cable USB-C a USB-C', art: 'cable', currency: 'USD', tagline: '1 y 2 metros.', models: [{ name: 'Largo', options: [o('1m', 20), o('2m', 22)] }] },

  // ───────────── Fundas ─────────────
  { id: 'funda-techwoven-17', cat: 'fundas', name: 'Funda TechWoven', art: 'case', tint: '#4a5568', currency: 'USD', badge: 'Original Apple', tagline: 'iPhone 17, 17 Air, 17 Pro, 17 Pro Max.', models: [{ name: 'Modelo', options: ['iPhone 17', 'iPhone 17 Air', 'iPhone 17 Pro', 'iPhone 17 Pro Max'].map((m) => o(m, 70)) }] },
  { id: 'funda-silicone-17', cat: 'fundas', name: 'Funda de silicona · iPhone 17', art: 'case', tint: '#c97b63', currency: 'USD', badge: 'Original Apple', tagline: 'iPhone 17, 17 Air, 17 Pro, 17 Pro Max.', models: [{ name: 'Modelo', options: ['iPhone 17', 'iPhone 17 Air', 'iPhone 17 Pro', 'iPhone 17 Pro Max'].map((m) => o(m, 55)) }] },
  { id: 'funda-silicone-16', cat: 'fundas', name: 'Funda de silicona · iPhone 16', art: 'case', tint: '#7f9c8a', currency: 'USD', badge: 'Original Apple', tagline: 'iPhone 16, 16 Plus, 16 Pro, 16 Pro Max.', models: [{ name: 'Modelo', options: ['iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max'].map((m) => o(m, 55)) }] },
  { id: 'funda-silicone-15', cat: 'fundas', name: 'Funda de silicona · iPhone 15', art: 'case', tint: '#d9a5b3', currency: 'USD', badge: 'Original Apple', tagline: 'iPhone 15, 15 Plus, 15 Pro, 15 Pro Max.', models: [{ name: 'Modelo', options: ['iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max'].map((m) => o(m, 55)) }] },
  { id: 'funda-silicone-14', cat: 'fundas', name: 'Funda de silicona · iPhone 14', art: 'case', tint: '#8fa7c9', currency: 'USD', badge: 'Original Apple', tagline: 'iPhone 14, 14 Plus, 14 Pro, 14 Pro Max.', models: [{ name: 'Modelo', options: ['iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max'].map((m) => o(m, 45)) }] },
  { id: 'funda-silicone-13', cat: 'fundas', name: 'Funda de silicona · iPhone 13', art: 'case', tint: '#e0c178', currency: 'USD', badge: 'Original Apple', tagline: 'iPhone 13, 13 mini, 13 Pro, 13 Pro Max.', models: [{ name: 'Modelo', options: ['iPhone 13', 'iPhone 13 mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max'].map((m) => o(m, 39)) }] },
  { id: 'funda-rhode', cat: 'fundas', name: 'Funda Rhode', art: 'case', tint: '#e8cfc4', currency: 'BOB', badge: 'Más colores', tagline: 'iPhone 12 a iPhone 18 Pro Max.', models: [{ name: 'Presentación', options: [o('Funda', 260), o('Set', 370)] }], compat: [...IPHONE_11_TO_17.slice(3), 'iPhone 18 Pro', 'iPhone 18 Pro Max'] },
  { id: 'funda-gamusada', cat: 'fundas', name: 'Funda gamuzada', art: 'case', tint: '#7a5a49', currency: 'BOB', badge: 'Más colores', tagline: 'iPhone 11 a iPhone 18 Pro Max.', models: [{ name: 'Funda', options: [o('Estándar', 100)] }], compat: [...IPHONE_11_TO_17, 'iPhone 18 Pro', 'iPhone 18 Pro Max'] },
  { id: 'funda-gear4', cat: 'fundas', name: 'Gear4 MagSafe', art: 'case', tint: '#2b2d31', currency: 'BOB', tagline: 'Protección con MagSafe. iPhone 11 a 17 Pro Max.', models: [{ name: 'Funda', options: [o('Estándar', 150)] }], compat: IPHONE_11_TO_17 },
  { id: 'funda-magsafe-clear', cat: 'fundas', name: 'MagSafe transparente', art: 'case', tint: '#dfe7ef', currency: 'BOB', tagline: 'iPhone 11 a 17 Pro Max.', models: [{ name: 'Funda', options: [o('Estándar', 90)] }], compat: IPHONE_11_TO_17 },
  { id: 'funda-casetify', cat: 'fundas', name: 'Casetify', art: 'case', tint: '#b9a7e0', currency: 'BOB', tagline: 'iPhone 11 a 17 Pro Max.', models: [{ name: 'Funda', options: [o('Estándar', 70)] }], compat: IPHONE_11_TO_17 },

  // ───────────── Protectores ─────────────
  { id: 'protector-iphone', cat: 'protectores', name: 'Protector de pantalla iPhone', art: 'protector', currency: 'BOB', featured: true, tagline: 'Disponible para todos los iPhone del 7 al 17 Pro Max.', note: 'Seguro anual: 120 Bs · Cambio de protector: 25 Bs.', models: [{ name: 'Tipo', options: [o('Transparente', 70), o('Antiespía', 80)] }] },
  { id: 'seguro-protector', cat: 'protectores', name: 'Seguro anual de protector', art: 'protector', currency: 'BOB', tagline: 'Cambia tu protector cuando lo necesites durante un año.', models: [{ name: 'Plan', options: [o('Seguro anual', 120), o('Cambio de protector', 25)] }] },
  { id: 'protector-ipad', cat: 'protectores', name: 'Vidrio templado iPad', art: 'protector', currency: 'BOB', tagline: 'iPad, iPad Air, iPad Pro y iPad mini.', models: [{ name: 'Modelo', options: [
    'iPad 2/3/4', 'iPad 9,7 (2017, 2018)', 'iPad 10,2 (2019-2025)', 'iPad mini 2021', 'iPad mini (2022-2025)',
    'iPad Air 1', 'iPad Air 2', 'iPad Air 3', 'iPad Air 4', 'iPad Air 5', 'iPad Air 6', 'iPad Air 7',
    'iPad Pro 10.5', 'iPad Pro 11 (2018)', 'iPad Pro 11 (2021, 2022)', 'iPad Pro 11 (2023-2025)',
    'iPad Pro 12,9 (2015-2017)', 'iPad Pro 12,9 (2018-2022)', 'iPad Pro 13 (2023-2025)',
  ].map((m) => o(m, 110)) }] },

  // ───────────── Dyson ─────────────
  { id: 'dyson-airwrap', cat: 'dyson', name: 'Dyson Airwrap', art: 'dyson', tint: '#b3485f', currency: 'USD', featured: true, tagline: 'Rizar, ondular, alisar y secar.', models: [{ name: 'Airwrap', options: [o('Consultar', null)] }] },
  { id: 'dyson-supersonic', cat: 'dyson', name: 'Dyson Supersonic', art: 'dyson', tint: '#5b4a8a', currency: 'USD', tagline: 'Secado rápido, sin calor extremo.', models: [{ name: 'Supersonic', options: [o('Consultar', null)] }] },
  { id: 'dyson-airstrait', cat: 'dyson', name: 'Dyson Airstrait', art: 'dyson', tint: '#c06a3c', currency: 'USD', tagline: 'Seca y alisa al mismo tiempo.', models: [{ name: 'Airstrait', options: [o('Consultar', null)] }] },
];

products.forEach((p) => {
  p.images = IMAGES[p.id] || []; p.colorImages = COLOR_IMAGES[p.id] || null;
  // A model with its own finishes (iPhone Duo) carries its own photo sets.
  p.models.forEach((m) => { if (m.imagesKey) m.colorImages = COLOR_IMAGES[m.imagesKey] || null; });
});

export const services = [
  {
    id: 'servicio-tecnico', title: 'Servicio Técnico', kicker: 'Reparación puerta a puerta',
    body: 'En Bencar sabemos que tu tiempo vale. Por eso reparamos tu dispositivo en un proceso rápido y sencillo: cotizamos la reparación, lo recogemos, lo reparamos y te lo enviamos de vuelta. Llámanos y nosotros nos encargamos de todo.',
    steps: ['Cotización', 'Recolección', 'Reparación', 'Envío'],
  },
  {
    id: 'compra-venta', title: 'Compra y Venta', kicker: 'Tu dispositivo vale',
    body: 'Te ayudamos a vender tu dispositivo o te lo recibimos como parte de pago.',
    rules: ['El iPhone debe estar libre de registro (IMEI).', 'El iPhone tiene que ser 11 para arriba.', 'El uso de cubo de carga genérico viola la garantía de Apple y Bencar.'],
  },
  {
    id: 'presupuesto', title: '¿Presupuesto ajustado?', kicker: '¡No hay problema!',
    body: 'Te ayudamos a conseguir ese iPhone, iPad o Mac que quieres, al precio que puedes pagar. Además, recibimos cualquier dispositivo usado como parte de pago.',
  },
  {
    id: 'repuestos', title: 'Repuestos', kicker: 'Para tu vehículo',
    body: '¿Necesitas un repuesto para tu vehículo? Te ofrecemos la cotización exacta del repuesto que buscas y, si no estás seguro de cuál necesitas, te ayudamos a identificarlo sin compromiso. Entrega en tiempo récord.',
  },
  {
    id: 'vehiculos', title: 'Compra y Venta de vehículos', kicker: 'Ben·Car',
    body: '¿Quieres vender tu vehículo rápido y sin complicaciones? Con una comisión mínima nos encargamos de todo.',
    sell: ['Detailing completo para que luzca impecable', 'Sesión de fotos profesional', 'Promoción en redes sociales para acelerar la venta', 'Venta en tiempo récord'],
    buy: ['Revisamos el historial del vehículo', 'Hacemos un escaneo profesional para que compres con total confianza', 'Escríbenos y deja todo en nuestras manos'],
  },
  {
    id: 'dinamicas', title: 'Dinámicas Bencar', kicker: 'Grupo de WhatsApp',
    body: 'Únete a nuestro grupo de WhatsApp, donde compartimos información y dinámicas para ganar accesorios, iPhones, Dysons y mucho más.',
  },
];

export const byId = (id) => products.find((p) => p.id === id);
export const byCat = (cat) => products.filter((p) => p.cat === cat);

/** Lowest known price of a product (or null when every option is "Consultar"). */
export function fromPrice(p) {
  if (p.fromPrice) return p.fromPrice;
  const prices = p.models.flatMap((m) => m.options.map((x) => x.price)).filter((x) => typeof x === 'number');
  return prices.length ? Math.min(...prices) : null;
}

export function fmt(price, currency) {
  if (price == null) return 'Consultar';
  const n = price.toLocaleString('en-US');
  return currency === 'BOB' ? `Bs ${n}` : `$${n}`;
}

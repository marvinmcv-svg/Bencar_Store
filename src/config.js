// Store-wide settings. Edit here; every page reads from this file.
export const CONFIG = {
  brand: 'Bencar',
  tagline: 'Productos Apple y más',
  // Number published on the Canva catalogue cover.
  phoneDisplay: '3352 5231',
  phoneTel: '+59133525231',
  // Orders are sent as a pre-filled WhatsApp message (country code + number, digits only).
  // Replace with the store's WhatsApp line if it differs from the catalogue number.
  whatsapp: '59133525231',
  // Paste the WhatsApp group invite link for "Dinámicas Bencar" here.
  whatsappGroup: '',
  instagram: 'https://www.instagram.com/ben_car63/',
  instagramHandle: '@ben_car63',
  country: 'Bolivia',
};

export const waLink = (text = '') =>
  `https://wa.me/${CONFIG.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

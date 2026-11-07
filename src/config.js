// Store-wide settings. Edit here; every page reads from this file.
export const CONFIG = {
  brand: 'Bencar',
  tagline: 'Productos Apple y más',
  // Numbers printed on the official Bencar logo (mobile lines) and on the catalogue cover.
  phones: [
    { display: '7531 2300', tel: '+59175312300' },
    { display: '7804 9550', tel: '+59178049550' },
    { display: '3352 5231', tel: '+59133525231' },
  ],
  phoneDisplay: '7531 2300',
  phoneTel: '+59175312300',
  // Orders are sent as a pre-filled WhatsApp message (country code + number, digits only).
  // Uses the first mobile number on the logo; change here if the WhatsApp line differs.
  whatsapp: '59175312300',
  // Paste the WhatsApp group invite link for "Dinámicas Bencar" here.
  whatsappGroup: '',
  instagram: 'https://www.instagram.com/ben_car63/',
  instagramHandle: '@ben_car63',
  country: 'Bolivia',
};

export const waLink = (text = '') =>
  `https://wa.me/${CONFIG.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

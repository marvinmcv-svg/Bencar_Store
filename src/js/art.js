// Procedural product illustrations (inline SVG). Brand-neutral silhouettes,
// tinted per product. No external images, so the page stays light.
let uid = 0;

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const wallpaper = (id, a = '#1c1c1e', b = '#636366', c = '#a1a1a6') => `
  <linearGradient id="w${id}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/>
  </linearGradient>`;

const metal = (id, tint) => `
  <linearGradient id="m${id}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${shade(tint, -0.35)}"/><stop offset=".08" stop-color="${shade(tint, 0.35)}"/>
    <stop offset=".5" stop-color="${tint}"/><stop offset=".92" stop-color="${shade(tint, 0.3)}"/>
    <stop offset="1" stop-color="${shade(tint, -0.4)}"/>
  </linearGradient>
  <linearGradient id="g${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${shade(tint, 0.18)}"/><stop offset="1" stop-color="${shade(tint, -0.18)}"/>
  </linearGradient>
  <radialGradient id="s${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`;

const shadow = (id, cx = 200, cy = 365, rx = 120) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="14" fill="url(#s${id})"/>`;

const lens = (x, y, r) => `
  <circle cx="${x}" cy="${y}" r="${r}" fill="#1b1d22"/>
  <circle cx="${x}" cy="${y}" r="${r * 0.72}" fill="#0b0c10" stroke="#3a3f4a" stroke-width="2"/>
  <circle cx="${x}" cy="${y}" r="${r * 0.38}" fill="#1e2b45"/>
  <circle cx="${x - r * 0.25}" cy="${y - r * 0.25}" r="${r * 0.14}" fill="#a1a1a6" opacity=".7"/>`;

const ART = {
  phone: (id, t) => `
    ${shadow(id, 200, 372, 110)}
    <g transform="rotate(-8 230 200)">
      <rect x="168" y="38" width="150" height="312" rx="34" fill="#111"/>
      <rect x="173" y="43" width="140" height="302" rx="30" fill="url(#w${id})"/>
      <rect x="216" y="56" width="54" height="15" rx="7.5" fill="#000"/>
      <text x="243" y="140" font-family="Inter, system-ui" font-size="38" font-weight="600" fill="#fff" text-anchor="middle" opacity=".92">9:41</text>
    </g>
    <g transform="rotate(6 150 200)">
      <rect x="70" y="46" width="150" height="312" rx="34" fill="url(#m${id})"/>
      <rect x="75" y="51" width="140" height="302" rx="30" fill="url(#g${id})"/>
      <rect x="86" y="62" width="74" height="78" rx="20" fill="${shade(t, -0.12)}" stroke="${shade(t, 0.25)}" stroke-width="1.5"/>
      ${lens(106, 82, 13)}${lens(106, 120, 13)}${lens(140, 101, 13)}
      <circle cx="148" cy="73" r="4" fill="#f4f1e8" opacity=".8"/>
      <g transform="translate(145 235)" opacity=".55"><circle r="18" fill="none" stroke="${shade(t, 0.45)}" stroke-width="5"/><rect x="-2.5" y="-18" width="5" height="22" rx="2.5" fill="${shade(t, 0.45)}"/></g>
    </g>`,
  tablet: (id, t) => `
    ${shadow(id, 200, 370, 140)}
    <rect x="72" y="40" width="256" height="320" rx="26" fill="url(#m${id})"/>
    <rect x="80" y="48" width="240" height="304" rx="19" fill="#0c0d10"/>
    <rect x="88" y="56" width="224" height="288" rx="13" fill="url(#w${id})"/>
    <circle cx="200" cy="52" r="2.4" fill="#2a2f39"/>
    <g opacity=".9" fill="#fff">${[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => `<rect x="${108 + c * 50}" y="${80 + r * 54}" width="34" height="34" rx="9" opacity="${0.16 + ((r + c) % 3) * 0.08}"/>`).join('')).join('')}</g>
    <rect x="110" y="312" width="180" height="22" rx="11" fill="#fff" opacity=".22"/>`,
  laptop: (id, t) => `
    ${shadow(id, 200, 340, 175)}
    <rect x="66" y="78" width="268" height="182" rx="14" fill="${shade(t, -0.25)}"/>
    <rect x="71" y="83" width="258" height="172" rx="10" fill="#0a0b0e"/>
    <rect x="78" y="90" width="244" height="158" rx="4" fill="url(#w${id})"/>
    <rect x="186" y="90" width="28" height="7" rx="3.5" fill="#0a0b0e"/>
    <rect x="78" y="90" width="244" height="12" fill="#fff" opacity=".14"/>
    <rect x="132" y="226" width="136" height="16" rx="7" fill="#fff" opacity=".25"/>
    <path d="M28 262 H372 L362 282 Q358 290 346 290 H54 Q42 290 38 282 Z" fill="url(#m${id})"/>
    <rect x="170" y="262" width="60" height="6" rx="3" fill="${shade(t, -0.3)}"/>`,
  watch: (id, t) => `
    ${shadow(id, 200, 370, 80)}
    <rect x="150" y="14" width="100" height="120" rx="26" fill="${shade(t, -0.15)}"/>
    <rect x="150" y="268" width="100" height="110" rx="26" fill="${shade(t, -0.15)}"/>
    <rect x="132" y="104" width="136" height="192" rx="44" fill="url(#m${id})"/>
    <rect x="141" y="113" width="118" height="174" rx="37" fill="#050507"/>
    <rect x="268" y="150" width="10" height="34" rx="5" fill="url(#g${id})"/>
    <g transform="translate(200 200)" fill="none" stroke-linecap="round" stroke-width="11">
      <circle r="48" stroke="#3a0d16"/><circle r="48" stroke="#ff2d55" stroke-dasharray="230 302" transform="rotate(-90)"/>
      <circle r="34" stroke="#173a07"/><circle r="34" stroke="#a6ff00" stroke-dasharray="160 214" transform="rotate(-90)"/>
      <circle r="20" stroke="#06303a"/><circle r="20" stroke="#00e0ff" stroke-dasharray="100 126" transform="rotate(-90)"/>
    </g>`,
  buds: (id) => `
    ${shadow(id, 200, 360, 110)}
    <rect x="110" y="170" width="180" height="170" rx="48" fill="#f7f7f5" stroke="#e1e1de" stroke-width="2"/>
    <path d="M110 230 H290" stroke="#d9d9d5" stroke-width="2"/>
    <rect x="110" y="170" width="180" height="60" rx="48" fill="#fff"/>
    <circle cx="200" cy="292" r="4" fill="#8ed36a"/>
    <g fill="#fbfbfa" stroke="#dcdcd8" stroke-width="2">
      <path d="M150 60 q-34 0 -34 38 q0 34 30 38 l6 64 q2 12 12 12 q10 0 10 -12 l-2 -86 q0 -54 -22 -54z" />
      <path d="M250 60 q34 0 34 38 q0 34 -30 38 l-6 64 q-2 12 -12 12 q-10 0 -10 -12 l2 -86 q0 -54 22 -54z" />
    </g>
    <circle cx="140" cy="96" r="9" fill="#2a2d33"/><circle cx="260" cy="96" r="9" fill="#2a2d33"/>`,
  headphones: (id, t) => `
    ${shadow(id, 200, 368, 130)}
    <path d="M96 210 V150 Q96 52 200 52 Q304 52 304 150 V210" fill="none" stroke="url(#m${id})" stroke-width="16"/>
    <path d="M112 156 Q112 78 200 78 Q288 78 288 156" fill="none" stroke="${shade(t, -0.35)}" stroke-width="20" stroke-linecap="round" opacity=".55"/>
    <rect x="62" y="190" width="92" height="150" rx="40" fill="url(#m${id})"/>
    <rect x="246" y="190" width="92" height="150" rx="40" fill="url(#m${id})"/>
    <rect x="132" y="206" width="28" height="118" rx="14" fill="${shade(t, -0.3)}"/>
    <rect x="240" y="206" width="28" height="118" rx="14" fill="${shade(t, -0.3)}"/>`,
  case: (id, t) => `
    ${shadow(id, 200, 372, 100)}
    <rect x="118" y="34" width="164" height="330" rx="40" fill="url(#m${id})"/>
    <rect x="128" y="44" width="144" height="310" rx="32" fill="url(#g${id})"/>
    <rect x="138" y="56" width="80" height="84" rx="22" fill="#0e0f12"/>
    ${lens(160, 78, 12)}${lens(160, 118, 12)}${lens(196, 98, 12)}
    <circle cx="200" cy="232" r="42" fill="none" stroke="${shade(t, -0.15)}" stroke-width="3" opacity=".6"/>
    <rect x="281" y="120" width="5" height="44" rx="2.5" fill="${shade(t, -0.25)}"/>`,
  protector: (id) => `
    ${shadow(id, 200, 370, 110)}
    <rect x="112" y="40" width="160" height="324" rx="36" fill="#121317"/>
    <rect x="118" y="46" width="148" height="312" rx="31" fill="url(#w${id})" opacity=".85"/>
    <g transform="translate(22 -14)">
      <rect x="112" y="40" width="160" height="324" rx="36" fill="#dff0ff" opacity=".18" stroke="#fff" stroke-opacity=".8" stroke-width="2"/>
      <path d="M140 60 L250 60 L150 320 Z" fill="#fff" opacity=".18"/>
      <rect x="166" y="54" width="52" height="14" rx="7" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.5"/>
    </g>`,
  charger: (id, t) => `
    ${shadow(id, 200, 340, 90)}
    <rect x="136" y="60" width="16" height="70" rx="5" fill="#b9bcc2"/><rect x="248" y="60" width="16" height="70" rx="5" fill="#b9bcc2"/>
    <rect x="110" y="120" width="180" height="200" rx="34" fill="url(#m${id})"/>
    <rect x="118" y="128" width="164" height="184" rx="28" fill="url(#g${id})"/>
    <rect x="176" y="230" width="48" height="16" rx="8" fill="#16181c"/>
    <rect x="186" y="235" width="28" height="6" rx="3" fill="#3a3f4a"/>`,
  cable: (id, t) => `
    ${shadow(id, 200, 360, 120)}
    <path d="M110 300 C 40 220, 120 130, 200 170 S 340 160, 300 90" fill="none" stroke="${shade(t, -0.05)}" stroke-width="12" stroke-linecap="round"/>
    <path d="M110 300 C 40 220, 120 130, 200 170 S 340 160, 300 90" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>
    <rect x="86" y="292" width="48" height="64" rx="10" fill="url(#m${id})"/><rect x="99" y="352" width="22" height="14" rx="4" fill="#c9ccd2"/>
    <rect x="276" y="40" width="48" height="64" rx="10" fill="url(#m${id})" transform="rotate(18 300 72)"/>`,
  mouse: (id, t) => `
    ${shadow(id, 200, 350, 110)}
    <path d="M200 70 C 290 70, 300 140, 300 210 C 300 300, 260 330, 200 330 C 140 330, 100 300, 100 210 C 100 140, 110 70, 200 70 Z" fill="url(#m${id})"/>
    <path d="M200 78 C 282 78, 290 140, 290 205 C 290 290, 255 320, 200 320 C 145 320, 110 290, 110 205 C 110 140, 118 78, 200 78 Z" fill="url(#g${id})"/>
    <path d="M200 78 V 170" stroke="${shade(t, -0.15)}" stroke-width="2" opacity=".5"/>`,
  pencil: (id) => `
    ${shadow(id, 200, 340, 150)}
    <g transform="rotate(-32 200 200)">
      <rect x="40" y="186" width="290" height="28" rx="14" fill="#fbfbfa" stroke="#dedfdb" stroke-width="2"/>
      <path d="M330 186 L370 200 L330 214 Z" fill="#f1f1ee"/><path d="M360 196 L372 200 L360 204 Z" fill="#33363c"/>
      <rect x="40" y="186" width="40" height="28" rx="14" fill="#ececea"/>
    </g>`,
  airtag: (id) => `
    ${shadow(id, 200, 340, 110)}
    <circle cx="200" cy="200" r="122" fill="#c9ccd2"/><circle cx="200" cy="200" r="116" fill="#eef0f2"/>
    <circle cx="200" cy="200" r="104" fill="#fbfbfb"/>
    <circle cx="200" cy="200" r="60" fill="none" stroke="#e6e7e9" stroke-width="2"/>
    <ellipse cx="160" cy="150" rx="40" ry="20" fill="#fff" opacity=".9" transform="rotate(-30 160 150)"/>`,
  dyson: (id, t) => `
    ${shadow(id, 200, 360, 90)}
    <rect x="176" y="150" width="48" height="200" rx="24" fill="url(#m${id})"/>
    <rect x="186" y="220" width="28" height="70" rx="12" fill="${shade(t, -0.35)}"/>
    <circle cx="200" cy="104" r="78" fill="url(#m${id})"/>
    <circle cx="200" cy="104" r="50" fill="#16181d"/>
    <circle cx="200" cy="104" r="34" fill="none" stroke="${shade(t, 0.35)}" stroke-width="3" opacity=".6"/>
    <circle cx="200" cy="104" r="62" fill="none" stroke="#fff" stroke-width="2" opacity=".25"/>`,
  accessory: (id, t) => ART.airtag(id, t),
};

const DEFAULT_TINT = { buds: '#f2f2f0', pencil: '#f5f5f3', airtag: '#eef0f2', mouse: '#f2f2f0', cable: '#f4f4f2', charger: '#f2f3f5', protector: '#dfe7ef' };

/** Returns an SVG string for a product silhouette. */
export function art(type, tint, cls = '') {
  const id = ++uid;
  const t = tint || DEFAULT_TINT[type] || '#c9ccd2';
  const draw = ART[type] || ART.accessory;
  return `<svg class="art ${cls}" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
    <defs>${metal(id, t)}${wallpaper(id)}</defs>${draw(id, t)}</svg>`;
}

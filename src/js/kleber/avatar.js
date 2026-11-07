// Kleber's cartoon face: hand-drawn SVG in a thick-outline, big-eyed TV-cartoon
// style, based on his photo (curly brown hair, brown eyes, big grin, black
// quilted puffer jacket). Parts are grouped so CSS/JS can animate them:
// .k-head bobs, .k-lids blink, .k-pupils look around, .k-mouth talks.
const INK = '#141414';
const SKIN = '#e9b48c';
const SKIN_SH = '#d39a72';
const HAIR = '#5b3b23';
const HAIR_HI = '#7a5233';
const JACKET = '#1e1e21';
const QUILT = '#38383d';

export function kleberSVG({ cls = '', title = 'Kleber' } = {}) {
  return `
<svg class="kleber ${cls}" viewBox="22 18 156 156" role="img" aria-label="${title}">
  <defs><clipPath id="k-clip"><circle cx="100" cy="110" r="110"/></clipPath></defs>
  <g clip-path="url(#k-clip)">
    <!-- jacket -->
    <g class="k-body">
      <path d="M18 230 C20 196 44 178 76 172 L100 190 L124 172 C156 178 180 196 182 230 Z" fill="${JACKET}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M40 200 L64 222 M52 186 L86 220 M160 200 L136 222 M148 186 L114 220 M34 214 L58 192 M166 214 L142 192" stroke="${QUILT}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M100 190 V230" stroke="#8b8b90" stroke-width="2.6"/>
      <rect x="96" y="194" width="8" height="12" rx="2" fill="#a9a9ae" stroke="${INK}" stroke-width="2"/>
    </g>
    <g class="k-head">
      <!-- neck + collar -->
      <path d="M88 150 h24 v26 h-24z" fill="${SKIN_SH}" stroke="${INK}" stroke-width="4"/>
      <path d="M74 158 L80 186 L100 194 L120 186 L126 158 C114 170 86 170 74 158 Z" fill="#26262a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <!-- ears -->
      <ellipse cx="53" cy="106" rx="9" ry="13" fill="${SKIN}" stroke="${INK}" stroke-width="4"/>
      <ellipse cx="147" cy="106" rx="9" ry="13" fill="${SKIN}" stroke="${INK}" stroke-width="4"/>
      <path d="M52 101 q4 5 0 10 M148 101 q-4 5 0 10" fill="none" stroke="${SKIN_SH}" stroke-width="2.4" stroke-linecap="round"/>
      <!-- face -->
      <path d="M55 92 C55 54 145 54 145 92 C147 136 128 162 100 163 C72 162 53 136 55 92 Z" fill="${SKIN}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <!-- curly hair: bumpy crown + fringe of curls over the forehead -->
      <path d="M50 100 A13 13 0 0 1 46 78 A13 13 0 0 1 54 56 A13 13 0 0 1 70 40 A13 13 0 0 1 92 32 A13 13 0 0 1 114 32 A13 13 0 0 1 134 40 A13 13 0 0 1 148 56 A13 13 0 0 1 154 78 A13 13 0 0 1 150 100 C147 86 141 76 132 71 A9 9 0 0 1 116 75 A9 9 0 0 1 100 72 A9 9 0 0 1 84 75 A9 9 0 0 1 68 74 C60 80 53 88 50 100 Z" fill="${HAIR}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M66 52 q6 -6 12 -2 M96 42 q7 -5 13 0 M124 50 q6 -3 10 3 M58 70 q4 -6 10 -4 M136 66 q6 -2 8 5" fill="none" stroke="${HAIR_HI}" stroke-width="3" stroke-linecap="round"/>
      <!-- brows -->
      <path class="k-brows" d="M70 86 q11 -7 22 -1 M108 85 q11 -6 22 1" fill="none" stroke="${HAIR}" stroke-width="4.5" stroke-linecap="round"/>
      <!-- eyes: big white circles touching, tiny pupils -->
      <g class="k-eyes">
        <circle cx="82" cy="104" r="17" fill="#fff" stroke="${INK}" stroke-width="4"/>
        <circle cx="118" cy="104" r="17" fill="#fff" stroke="${INK}" stroke-width="4"/>
        <g class="k-pupils"><circle cx="84" cy="105" r="4.2" fill="${INK}"/><circle cx="116" cy="105" r="4.2" fill="${INK}"/></g>
        <g class="k-lids">
          <circle cx="82" cy="104" r="17" fill="${SKIN}" stroke="${INK}" stroke-width="4"/>
          <circle cx="118" cy="104" r="17" fill="${SKIN}" stroke="${INK}" stroke-width="4"/>
        </g>
      </g>
      <!-- nose -->
      <path d="M101 118 q-7 10 1 13" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
      <!-- cheeks -->
      <path d="M70 134 q-3 -4 0 -8 M130 134 q3 -4 0 -8" fill="none" stroke="${SKIN_SH}" stroke-width="3" stroke-linecap="round"/>
      <!-- mouth: open grin with teeth -->
      <g class="k-mouth">
        <path d="M78 136 C86 156 114 156 122 136 C108 141 92 141 78 136 Z" fill="#6d1f22" stroke="${INK}" stroke-width="3.6" stroke-linejoin="round"/>
        <path d="M83 138.5 C94 142 106 142 117 138.5 L115 144 C105 146.5 95 146.5 85 144 Z" fill="#fff"/>
        <path d="M95 141 v4.5 M105 141 v4.5" stroke="#d9d9d9" stroke-width="1.4"/>
        <path d="M92 150 q8 3 16 0" fill="none" stroke="#c4545a" stroke-width="3" stroke-linecap="round"/>
      </g>
    </g>
  </g>
</svg>`;
}

const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'assets', 'images');
fs.mkdirSync(dir, { recursive: true });

const items = [
  {
    prefix: 'dragon-figurine',
    title: 'Dragon Figurine',
    accent: '#00D4FF',
    accent2: '#FF6B35',
    icon: '🐉',
    shapes: [
      '<polygon points="250,90 320,180 180,180" fill="url(#grad1)" stroke="#00D4FF" stroke-width="2"/>',
      '<polygon points="250,160 380,240 120,240" fill="url(#grad2)" stroke="#00D4FF" opacity="0.85" stroke-width="2"/>',
      '<polygon points="250,220 420,320 80,320" fill="url(#grad1)" stroke="#00D4FF" opacity="0.9" stroke-width="2"/>',
      '<path d="M120,240 Q60,180 80,120 Q140,160 180,200 Z" fill="#FF6B35" opacity="0.7"/>',
      '<path d="M380,240 Q440,180 420,120 Q360,160 320,200 Z" fill="#FF6B35" opacity="0.7"/>',
      '<ellipse cx="250" cy="350" rx="140" ry="24" fill="#14142B" stroke="#00D4FF" stroke-width="2"/>'
    ]
  },
  {
    prefix: 'articulated-octopus',
    title: 'Articulated Octopus',
    accent: '#9D4EDD',
    accent2: '#00D4FF',
    icon: '🐙',
    shapes: [
      '<circle cx="250" cy="180" r="75" fill="url(#grad1)" stroke="#9D4EDD" stroke-width="2.5"/>',
      '<ellipse cx="225" cy="170" rx="12" ry="16" fill="#00D4FF"/>',
      '<ellipse cx="275" cy="170" rx="12" ry="16" fill="#00D4FF"/>',
      '<path d="M180,210 Q120,260 100,320 Q120,340 150,300 Q180,250 200,225 Z" fill="url(#grad2)" stroke="#00D4FF"/>',
      '<path d="M320,210 Q380,260 400,320 Q380,340 350,300 Q320,250 300,225 Z" fill="url(#grad2)" stroke="#00D4FF"/>',
      '<path d="M220,250 Q180,310 160,370 Q190,380 220,330 Z" fill="url(#grad1)" stroke="#9D4EDD"/>',
      '<path d="M280,250 Q320,310 340,370 Q310,380 280,330 Z" fill="url(#grad1)" stroke="#9D4EDD"/>',
      '<ellipse cx="250" cy="370" rx="130" ry="18" fill="#14142B" stroke="#9D4EDD" stroke-dasharray="4,4"/>'
    ]
  },
  {
    prefix: 'phone-stand',
    title: 'Phone Stand',
    accent: '#00D4FF',
    accent2: '#2ECC71',
    icon: '📱',
    shapes: [
      '<polygon points="180,350 320,350 350,320 210,320" fill="url(#grad1)" stroke="#00D4FF" stroke-width="2"/>',
      '<polygon points="210,320 350,320 290,140 150,140" fill="url(#grad2)" stroke="#00D4FF" stroke-width="2"/>',
      '<rect x="180" y="160" width="140" height="190" rx="12" transform="skewX(-15)" fill="#1A1A2E" stroke="#2ECC71" stroke-width="2"/>',
      '<line x1="160" y1="310" x2="340" y2="310" stroke="#00D4FF" stroke-width="6" stroke-linecap="round"/>',
      '<circle cx="240" cy="335" r="8" fill="#2ECC71"/>'
    ]
  },
  {
    prefix: 'cable-organizer',
    title: 'Cable Organizer',
    accent: '#FF9F1C',
    accent2: '#2EC4B6',
    icon: '🔌',
    shapes: [
      '<rect x="100" y="220" width="300" height="60" rx="14" fill="url(#grad1)" stroke="#FF9F1C" stroke-width="2"/>',
      '<rect x="130" y="200" width="40" height="80" rx="8" fill="#141428" stroke="#2EC4B6" stroke-width="2"/>',
      '<rect x="190" y="200" width="40" height="80" rx="8" fill="#141428" stroke="#2EC4B6" stroke-width="2"/>',
      '<rect x="250" y="200" width="40" height="80" rx="8" fill="#141428" stroke="#2EC4B6" stroke-width="2"/>',
      '<rect x="310" y="200" width="40" height="80" rx="8" fill="#141428" stroke="#2EC4B6" stroke-width="2"/>',
      '<path d="M80,240 C140,240 140,150 200,150 C260,150 260,240 320,240" fill="none" stroke="#FF9F1C" stroke-width="4" stroke-dasharray="6,4"/>'
    ]
  },
  {
    prefix: 'geometric-planter',
    title: 'Geometric Planter',
    accent: '#2ECC71',
    accent2: '#F1C40F',
    icon: '🪴',
    shapes: [
      '<polygon points="250,140 330,170 340,260 250,330 160,260 170,170" fill="url(#grad1)" stroke="#2ECC71" stroke-width="2"/>',
      '<polygon points="250,140 250,330 340,260" fill="url(#grad2)" opacity="0.8"/>',
      '<polygon points="250,140 170,170 250,220" fill="#2ECC71" opacity="0.3"/>',
      '<polygon points="250,220 330,170 250,140" fill="#2ECC71" opacity="0.5"/>',
      '<polygon points="250,220 340,260 250,330" fill="#1B4D3E" opacity="0.6"/>',
      '<polygon points="250,220 160,260 250,330" fill="#153E32" opacity="0.7"/>',
      '<path d="M250,140 Q250,70 220,60 Q250,90 250,135 Z" fill="#2ECC71"/>',
      '<path d="M250,140 Q260,70 290,75 Q265,95 250,135 Z" fill="#27AE60"/>'
    ]
  },
  {
    prefix: 'moon-lamp-shell',
    title: 'Moon Lamp Shell',
    accent: '#F39C12',
    accent2: '#00D4FF',
    icon: '🌕',
    shapes: [
      '<circle cx="250" cy="210" r="110" fill="url(#grad1)" stroke="#F39C12" stroke-width="2.5" filter="url(#glow)"/>',
      '<circle cx="210" cy="180" r="24" fill="#000" opacity="0.18"/>',
      '<circle cx="290" cy="190" r="32" fill="#000" opacity="0.14"/>',
      '<circle cx="240" cy="250" r="28" fill="#000" opacity="0.16"/>',
      '<circle cx="180" cy="240" r="15" fill="#000" opacity="0.12"/>',
      '<line x1="250" y1="320" x2="200" y2="390" stroke="#8E44AD" stroke-width="6" stroke-linecap="round"/>',
      '<line x1="250" y1="320" x2="300" y2="390" stroke="#8E44AD" stroke-width="6" stroke-linecap="round"/>',
      '<line x1="250" y1="320" x2="250" y2="390" stroke="#A569BD" stroke-width="5" stroke-linecap="round"/>'
    ]
  },
  {
    prefix: 'iron-man-helmet',
    title: 'Wearable Cyber Helmet',
    accent: '#E74C3C',
    accent2: '#F1C40F',
    icon: '🦾',
    shapes: [
      '<path d="M160,160 Q250,100 340,160 Q360,260 320,330 L180,330 Q140,260 160,160 Z" fill="url(#grad1)" stroke="#E74C3C" stroke-width="2.5"/>',
      '<path d="M180,190 L320,190 L310,280 L250,300 L190,280 Z" fill="#F1C40F" opacity="0.85" stroke="#F1C40F" stroke-width="2"/>',
      '<polygon points="195,225 235,225 225,235 200,235" fill="#00D4FF" filter="url(#glow)"/>',
      '<polygon points="305,225 265,225 275,235 300,235" fill="#00D4FF" filter="url(#glow)"/>',
      '<line x1="250" y1="130" x2="250" y2="190" stroke="#E74C3C" stroke-width="2"/>'
    ]
  },
  {
    prefix: 'mandalorian-bust',
    title: 'Bounty Hunter Bust',
    accent: '#95A5A6',
    accent2: '#00D4FF',
    icon: '🛡️',
    shapes: [
      '<path d="M170,150 Q250,110 330,150 L340,270 L300,320 L200,320 L160,270 Z" fill="url(#grad1)" stroke="#BDC3C7" stroke-width="2.5"/>',
      '<line x1="180" y1="210" x2="320" y2="210" stroke="#00D4FF" stroke-width="8" stroke-linecap="square" filter="url(#glow)"/>',
      '<line x1="250" y1="210" x2="250" y2="300" stroke="#00D4FF" stroke-width="8" stroke-linecap="square" filter="url(#glow)"/>',
      '<polygon points="150,330 350,330 370,380 130,380" fill="#141428" stroke="#00D4FF" stroke-width="1.5"/>'
    ]
  }
];

items.forEach(item => {
  for (let view = 1; view <= 2; view++) {
    const filename = `${item.prefix}-${view}.svg`;
    const angleText = view === 1 ? 'Front Perspective' : 'Detail & Angle View';
    const rotation = view === 2 ? 'transform="rotate(-4 250 240) scale(1.05 1.05)"' : '';
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${item.accent}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#14142B" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${item.accent2}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#252540" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18182E"/>
      <stop offset="100%" stop-color="#0F0F1A"/>
    </linearGradient>
    <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(0, 212, 255, 0.08)" stroke-width="1"/>
    </pattern>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="500" height="500" fill="url(#bgGrad)"/>
  <rect width="500" height="500" fill="url(#grid)"/>

  <!-- Blueprint corner guides -->
  <path d="M 20 40 L 20 20 L 40 20" stroke="rgba(0, 212, 255, 0.4)" stroke-width="1.5" fill="none"/>
  <path d="M 480 40 L 480 20 L 460 20" stroke="rgba(0, 212, 255, 0.4)" stroke-width="1.5" fill="none"/>
  <path d="M 20 460 L 20 480 L 40 480" stroke="rgba(0, 212, 255, 0.4)" stroke-width="1.5" fill="none"/>
  <path d="M 480 460 L 480 480 L 460 480" stroke="rgba(0, 212, 255, 0.4)" stroke-width="1.5" fill="none"/>

  <!-- Header spec info -->
  <text x="35" y="45" font-family="monospace" font-size="11" fill="#00D4FF" opacity="0.8">MODEL MAKES // SPEC-3D</text>
  <text x="465" y="45" font-family="monospace" font-size="11" fill="#A0A0B0" text-anchor="end" opacity="0.8">LAYER 0.12mm</text>

  <!-- Product Illustration -->
  <g ${rotation} transform-origin="250 240">
    ${item.shapes.join('\n    ')}
  </g>

  <!-- Bottom Badge -->
  <rect x="35" y="430" width="430" height="40" rx="8" fill="#1A1A2E" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <text x="50" y="455" font-family="sans-serif" font-weight="600" font-size="14" fill="#EAEAEA">${item.icon} ${item.title}</text>
  <text x="450" y="455" font-family="monospace" font-size="12" fill="${item.accent}" text-anchor="end">${angleText}</text>
</svg>`;

    fs.writeFileSync(path.join(dir, filename), svg);
  }
});
console.log('SVGs generated successfully!');

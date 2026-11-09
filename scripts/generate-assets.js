import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

const outDir = path.resolve('public/images');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function generateAssets() {
  // 1. Generate QR code for QRIS
  const qrisData = '00020101021126580016ID.CO.QRIS.WWW01189360091102651135850215ID10265113585860303UMI51440014ID.LINKAJA.WWW0215ID10265113585860303UMI5204549953033605802ID5911ZYCOO STORE6010JAKARTA SE61051219062070703A016304';
  
  // Create PNG for QRIS with nice branding
  const qrPngBuffer = await QRCode.toBuffer(qrisData, {
    width: 380,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });

  fs.writeFileSync(path.join(outDir, 'qris-qr.png'), qrPngBuffer);
  console.log('Saved qris-qr.png');

  // Let's create an SVG wrapper for both or convert to PNG
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="silver-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="30%" stop-color="#C0C0C0"/>
        <stop offset="70%" stop-color="#E5E4E2"/>
        <stop offset="100%" stop-color="#71717A"/>
      </linearGradient>
      <linearGradient id="neon-purple-blue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#9B5CFF"/>
        <stop offset="100%" stop-color="#368BFF"/>
      </linearGradient>
      <radialGradient id="purple-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#9B5CFF" stop-opacity="0.8"/>
        <stop offset="50%" stop-color="#368BFF" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#09090D" stop-opacity="0"/>
      </radialGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="16" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    <!-- Background -->
    <rect width="512" height="512" rx="48" fill="#09090D"/>
    
    <!-- Soft Purple/Blue Radial Glow behind frame -->
    <circle cx="256" cy="256" r="210" fill="url(#purple-glow)" opacity="0.9" />

    <!-- Outer Metallic Diamond/Hexagon Frame -->
    <rect x="96" y="96" width="320" height="320" rx="40" transform="rotate(45 256 256)" 
          fill="none" stroke="url(#silver-grad)" stroke-width="12" filter="url(#glow)"/>
    
    <!-- Inner Accent Frame -->
    <rect x="120" y="120" width="272" height="272" rx="32" transform="rotate(45 256 256)" 
          fill="#0D0D14" stroke="url(#neon-purple-blue)" stroke-width="4"/>

    <!-- Central Futuristic 'Z' Emblem -->
    <path d="M 180 180 L 332 180 L 332 216 L 244 300 L 332 300 L 332 336 L 180 336 L 180 300 L 268 216 L 180 216 Z" 
          fill="url(#silver-grad)"/>

    <!-- Accent Gems -->
    <circle cx="256" cy="96" r="8" fill="#9B5CFF" filter="url(#glow)" />
    <circle cx="416" cy="256" r="8" fill="#368BFF" filter="url(#glow)" />
    <circle cx="256" cy="416" r="8" fill="#9B5CFF" filter="url(#glow)" />
    <circle cx="96" cy="256" r="8" fill="#368BFF" filter="url(#glow)" />
    
    <!-- Text ZYCOOBUX -->
    <text x="256" y="475" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="28" fill="url(#silver-grad)" letter-spacing="6">
      ZYCOOBUX
    </text>
  </svg>`;

  fs.writeFileSync(path.join(outDir, 'logo-zycoo.svg'), logoSvg);
  fs.writeFileSync(path.join(outDir, 'logo-zycoo.png'), logoSvg); // SVG also serves directly or via data url
  console.log('Saved logo-zycoo.svg and logo-zycoo.png');

  // Generate QRIS full graphic
  const qrisBase64 = qrPngBuffer.toString('base64');
  const qrisSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="660" viewBox="0 0 480 660">
    <defs>
      <linearGradient id="qris-border" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#C0C0C0"/>
        <stop offset="50%" stop-color="#9B5CFF"/>
        <stop offset="100%" stop-color="#368BFF"/>
      </linearGradient>
    </defs>
    
    <!-- Card Frame -->
    <rect width="480" height="660" rx="28" fill="#FFFFFF" stroke="url(#qris-border)" stroke-width="4"/>
    
    <!-- QRIS Header Bar -->
    <rect x="0" y="0" width="480" height="85" rx="28" fill="#EF4444"/>
    <rect x="0" y="50" width="480" height="35" fill="#EF4444"/>
    
    <text x="240" y="52" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="36" fill="#FFFFFF" letter-spacing="4">
      QRIS
    </text>
    <text x="240" y="74" text-anchor="middle" font-family="sans-serif" font-weight="600" font-size="12" fill="#FEE2E2" letter-spacing="1">
      STANDAR PEMBAYARAN NASIONAL
    </text>

    <!-- Merchant Details -->
    <text x="240" y="125" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="22" fill="#0F172A">
      ZYCOO STORE
    </text>
    <text x="240" y="146" text-anchor="middle" font-family="sans-serif" font-weight="600" font-size="13" fill="#64748B">
      NMID: ID1026511358586
    </text>

    <!-- QR Code Image -->
    <image href="data:image/png;base64,${qrisBase64}" x="50" y="165" width="380" height="380"/>

    <!-- Instructions / Footer -->
    <rect x="24" y="565" width="432" height="70" rx="14" fill="#F8FAFC" stroke="#E2E8F0"/>
    <text x="240" y="592" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="13" fill="#0F172A">
      Scan dengan DANA, GoPay, OVO, ShopeePay, BCA, Mandiri dll.
    </text>
    <text x="240" y="614" text-anchor="middle" font-family="sans-serif" font-weight="500" font-size="11" fill="#64748B">
      Pastikan nama penerima tertulis ZYCOO STORE
    </text>
  </svg>`;

  fs.writeFileSync(path.join(outDir, 'qris-zycoo-store.svg'), qrisSvg);
  fs.writeFileSync(path.join(outDir, 'qris-zycoo-store.png'), qrisSvg);
  console.log('Saved qris-zycoo-store.svg and qris-zycoo-store.png');
}

generateAssets().catch(console.error);

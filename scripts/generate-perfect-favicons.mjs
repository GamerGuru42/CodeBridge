import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputPath = 'C:/Users/Benny Ben/.gemini/antigravity-ide/brain/ad1175fe-d916-4a66-88cf-086a1b25fc15/.user_uploaded/media_1788700352433.jpg';

async function generatePerfectFavicons() {
  // Ensure broken src/app/icon.png is removed
  if (fs.existsSync('c:/Users/Benny Ben/Documents/CodeBridge/src/app/icon.png')) {
    fs.unlinkSync('c:/Users/Benny Ben/Documents/CodeBridge/src/app/icon.png');
  }

  // Load the original artwork
  const original = sharp(inputPath);
  
  // The monogram in the user's high-res image:
  // minX=72, maxX=318 (w=247), minY=212, maxY=416 (h=205)
  // Let's crop it tightly with 5px padding
  const pad = 6;
  const left = Math.max(0, 72 - pad);
  const top = Math.max(0, 212 - pad);
  const width = (318 - 72) + 2 * pad;
  const height = (416 - 212) + 2 * pad;

  console.log(`Extracting monogram: left=${left}, top=${top}, width=${width}, height=${height}`);

  const { data, info } = await original
    .extract({ left, top, width, height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const total = w * h;
  const channels = 4;
  const outBuf = Buffer.from(data);

  // Background is ~ (248, 248, 248)
  // We want to make the OUTER background transparent,
  // but keep the internal white bridge crisp!
  const isExterior = new Uint8Array(total);
  const visited = new Uint8Array(total);
  const queue = [];

  // Seed with outer border
  for (let x = 0; x < w; x++) {
    queue.push(0 * w + x);
    queue.push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    queue.push(y * w + 0);
    queue.push(y * w + (w - 1));
  }
  for (let i = 0; i < queue.length; i++) visited[queue[i]] = 1;

  let head = 0;
  while (head < queue.length) {
    const p = queue[head++];
    const px = p % w;
    const py = Math.floor(p / w);
    const idx = p * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    const minVal = Math.min(r, g, b);
    const maxVal = Math.max(r, g, b);

    // If it's light background (brightness > 230 and neutral saturation)
    if (minVal > 228 && (maxVal - minVal) < 20) {
      isExterior[p] = 1;
      const neighbors = [
        px > 0 ? py * w + (px - 1) : -1,
        px < w - 1 ? py * w + (px + 1) : -1,
        py > 0 ? (py - 1) * w + px : -1,
        py < h - 1 ? (py + 1) * w + px : -1,
      ];
      for (const n of neighbors) {
        if (n >= 0 && !visited[n]) {
          visited[n] = 1;
          queue.push(n);
        }
      }
    }
  }

  // Alpha matting on exterior boundary
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const idx = p * channels;

      if (isExterior[p]) {
        outBuf[idx + 3] = 0; // Transparent
      } else {
        // Edge softening
        let hasExt = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h && isExterior[ny * w + nx]) {
              hasExt = true;
              break;
            }
          }
          if (hasExt) break;
        }

        if (hasExt) {
          const minVal = Math.min(outBuf[idx], outBuf[idx + 1], outBuf[idx + 2]);
          if (minVal > 210) {
            const factor = Math.max(0, Math.min(1, (248 - minVal) / 38));
            outBuf[idx + 3] = Math.round(factor * 255);
          }
        }
      }
    }
  }

  // Create clean square icon with centered monogram
  const squareSize = 256;
  const monogramPng = await sharp(outBuf, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toBuffer();

  // Target monogram dimensions in 256x256 square:
  // Let it fill 90% of the box for maximum punch in tiny tabs
  const iconW = 236;
  const iconH = Math.round(236 * (h / w)); // ~ 197px

  const masterSquare = await sharp({
    create: {
      width: squareSize,
      height: squareSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      {
        input: await sharp(monogramPng).resize(iconW, iconH, { fit: 'inside' }).png().toBuffer(),
        gravity: 'centre'
      }
    ])
    .png()
    .toBuffer();

  const master = sharp(masterSquare);

  // Generate PNGs for all standard favicon targets
  const p16 = await master.resize(16, 16).png().toBuffer();
  const p32 = await master.resize(32, 32).png().toBuffer();
  const p48 = await master.resize(48, 48).png().toBuffer();
  const p180 = await master.resize(180, 180).png().toBuffer();
  const p192 = await master.resize(192, 192).png().toBuffer();
  const p512 = await master.resize(512, 512).png().toBuffer();

  fs.writeFileSync('c:/Users/Benny Ben/Documents/CodeBridge/public/favicon-16x16.png', p16);
  fs.writeFileSync('c:/Users/Benny Ben/Documents/CodeBridge/public/favicon-32x32.png', p32);
  fs.writeFileSync('c:/Users/Benny Ben/Documents/CodeBridge/public/icon.png', p32);
  fs.writeFileSync('c:/Users/Benny Ben/Documents/CodeBridge/public/apple-touch-icon.png', p180);
  fs.writeFileSync('c:/Users/Benny Ben/Documents/CodeBridge/public/icon-192.png', p192);
  fs.writeFileSync('c:/Users/Benny Ben/Documents/CodeBridge/public/icon-512.png', p512);

  // Update master in public/images
  fs.writeFileSync('c:/Users/Benny Ben/Documents/CodeBridge/public/images/codebridge-icon.png', masterSquare);

  // Build true multi-res ICO binary
  const icoBuffer = buildIco([
    { size: 16, buffer: p16 },
    { size: 32, buffer: p32 },
    { size: 48, buffer: p48 }
  ]);
  fs.writeFileSync('c:/Users/Benny Ben/Documents/CodeBridge/public/favicon.ico', icoBuffer);

  // Now create the vector SVG for public/icon.svg
  // Clean, modern vector definition with exact gradient IDs and proper paths
  const vectorSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" fill="none" width="100%" height="100%">
  <defs>
    <!-- Deep Navy to Royal Blue gradient for the C shape -->
    <linearGradient id="cbNavy" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#061F4A" />
      <stop offset="60%" stop-color="#0A3272" />
      <stop offset="100%" stop-color="#154EA2" />
    </linearGradient>

    <!-- Sky Blue to Bright Cyan gradient for upper B lobe -->
    <linearGradient id="cbCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7DD3FC" />
      <stop offset="50%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0EA5E9" />
    </linearGradient>

    <!-- Electric Blue gradient for lower B lobe -->
    <linearGradient id="cbBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="50%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#0369A1" />
    </linearGradient>
  </defs>

  <!-- Upper B lobe (light cyan) -->
  <path d="M 52 10 L 82 10 C 98 10, 108 19, 108 32 C 108 43, 98 47, 85 47 L 52 47 Z" fill="url(#cbCyan)" />

  <!-- Lower B lobe (medium/deep blue) -->
  <path d="M 52 53 L 88 53 C 100 53, 110 58, 110 70 C 110 82, 100 90, 84 90 L 52 90 Z" fill="url(#cbBlue)" />

  <!-- C shape (dark navy ribbon wrapping the left) -->
  <path d="M 28 10 C 14 10, 6 18, 6 32 L 6 68 C 6 82, 14 90, 28 90 L 62 90 L 62 70 L 32 70 C 26 70, 24 67, 24 62 L 24 38 C 24 33, 26 30, 32 30 L 62 30 L 62 10 Z" fill="url(#cbNavy)" />

  <!-- White bridge / plug cutout (connecting center negative space) -->
  <rect x="22" y="42" width="48" height="16" rx="8" ry="8" fill="#FFFFFF" />
</svg>`;

  fs.writeFileSync('c:/Users/Benny Ben/Documents/CodeBridge/public/icon.svg', vectorSvg);

  console.log('All favicons, ICO binary, and vector SVG generated successfully!');
}

function buildIco(images) {
  const numImages = images.length;
  const headerSize = 6;
  const dirSize = 16 * numImages;
  let dataOffset = headerSize + dirSize;

  const totalSize = dataOffset + images.reduce((acc, img) => acc + img.buffer.length, 0);
  const out = Buffer.alloc(totalSize);

  out.writeUInt16LE(0, 0);
  out.writeUInt16LE(1, 2);
  out.writeUInt16LE(numImages, 4);

  let currentOffset = dataOffset;
  for (let i = 0; i < numImages; i++) {
    const img = images[i];
    const entryOffset = headerSize + i * 16;
    out.writeUInt8(img.size === 256 ? 0 : img.size, entryOffset);
    out.writeUInt8(img.size === 256 ? 0 : img.size, entryOffset + 1);
    out.writeUInt8(0, entryOffset + 2);
    out.writeUInt8(0, entryOffset + 3);
    out.writeUInt16LE(1, entryOffset + 4);
    out.writeUInt16LE(32, entryOffset + 6);
    out.writeUInt32LE(img.buffer.length, entryOffset + 8);
    out.writeUInt32LE(currentOffset, entryOffset + 12);

    img.buffer.copy(out, currentOffset);
    currentOffset += img.buffer.length;
  }

  return out;
}

generatePerfectFavicons().catch(console.error);

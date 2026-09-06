import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputPath = 'C:/Users/Benny Ben/.gemini/antigravity-ide/brain/ad1175fe-d916-4a66-88cf-086a1b25fc15/.user_uploaded/media_1788700352433.jpg';

async function createOptimizedIcons() {
  // 1. Remove src/app/icon.png if it exists
  if (fs.existsSync('c:/Users/Benny Ben/Documents/CodeBridge/src/app/icon.png')) {
    fs.unlinkSync('c:/Users/Benny Ben/Documents/CodeBridge/src/app/icon.png');
    console.log('Removed broken src/app/icon.png');
  }

  // 2. Monogram bounding box:
  // In media_1788700352433.jpg:
  // Monogram x: 72 to 318 (w=246), y: 212 to 416 (h=204)
  // Center is x=195, y=314
  // For an icon, we want the monogram to fill the frame with just enough padding (~6-8%)
  // so that at 16x16 or 32x32 it is BOLD, vibrant, and instantly recognizable in a browser tab!
  const cropW = 250;
  const cropH = 210;
  const cropX = 70;
  const cropY = 210;

  // Let's create a square canvas with centered monogram
  // Extract raw RGB from source
  const rawExtract = await sharp(inputPath)
    .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h, channels } = rawExtract.info;
  const data = Buffer.from(rawExtract.data);

  // Background is (248, 248, 248)
  // Let's make exterior background transparent
  // BFS flood fill from edges
  const total = w * h;
  const isExterior = new Uint8Array(total);
  const visited = new Uint8Array(total);
  const queue = [];

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

    // Background candidate
    const minVal = Math.min(r, g, b);
    const maxVal = Math.max(r, g, b);
    if (minVal > 225 && (maxVal - minVal) < 22) {
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

  // Alpha matting
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const idx = p * channels;
      if (isExterior[p]) {
        data[idx + 3] = 0;
      } else {
        // Soft edge
        const minVal = Math.min(data[idx], data[idx + 1], data[idx + 2]);
        let hasExt = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h && isExterior[ny * w + nx]) {
              hasExt = true;
              break;
            }
          }
          if (hasExt) break;
        }
        if (hasExt && minVal > 215) {
          const a = Math.max(0, Math.min(1, (248 - minVal) / 33));
          data[idx + 3] = Math.round(a * 255);
        }
      }
    }
  }

  // Save the cropped transparent monogram
  const croppedMonogram = sharp(data, {
    raw: { width: w, height: h, channels: 4 }
  });

  // Make it square: 256x256 with transparent padding
  const squareIconBuffer = await sharp({
    create: {
      width: 256,
      height: 256,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      {
        input: await croppedMonogram.resize(240, 202, { fit: 'inside' }).png().toBuffer(),
        gravity: 'centre'
      }
    ])
    .png()
    .toBuffer();

  const squareIcon = sharp(squareIconBuffer);

  // Write high-res master icons to public/
  await squareIcon.toFile('c:/Users/Benny Ben/Documents/CodeBridge/public/images/codebridge-icon.png');
  await squareIcon.webp({ quality: 95 }).toFile('c:/Users/Benny Ben/Documents/CodeBridge/public/images/codebridge-icon.webp');

  // Favicon resolutions
  const p16 = await squareIcon.resize(16, 16).png().toBuffer();
  const p32 = await squareIcon.resize(32, 32).png().toBuffer();
  const p48 = await squareIcon.resize(48, 48).png().toBuffer();
  const p180 = await squareIcon.resize(180, 180).png().toBuffer();
  const p192 = await squareIcon.resize(192, 192).png().toBuffer();
  const p512 = await squareIcon.resize(512, 512).png().toBuffer();

  fs.writeFileSync('c:/Users/Benny Ben/Documents/CodeBridge/public/favicon-16x16.png', p16);
  fs.writeFileSync('c:/Users/Benny Ben/Documents/CodeBridge/public/favicon-32x32.png', p32);
  fs.writeFileSync('c:/Users/Benny Ben/Documents/CodeBridge/public/icon.png', p32);
  fs.writeFileSync('c:/Users/Benny Ben/Documents/CodeBridge/public/apple-touch-icon.png', p180);
  fs.writeFileSync('c:/Users/Benny Ben/Documents/CodeBridge/public/icon-192.png', p192);
  fs.writeFileSync('c:/Users/Benny Ben/Documents/CodeBridge/public/icon-512.png', p512);

  // Build true multi-resolution .ico containing 16x16, 32x32, 48x48
  const icoBuffer = buildIco([
    { size: 16, buffer: p16 },
    { size: 32, buffer: p32 },
    { size: 48, buffer: p48 }
  ]);
  fs.writeFileSync('c:/Users/Benny Ben/Documents/CodeBridge/public/favicon.ico', icoBuffer);

  // Also build clean vector SVG favicon that browsers love
  // Instead of an embedded base64 image (which Chrome rejects in favicons),
  // let's draw the vector paths of the CB monogram with exact proportions!
  // Wait, or we can also test if browser uses favicon.ico / favicon-32x32.png first.
  console.log('All icons generated with proper ICO binary header & PNG files!');
}

function buildIco(images) {
  // ICO header: 6 bytes
  // Directory entries: 16 bytes per image
  // Data: concatenated buffers
  const numImages = images.length;
  const headerSize = 6;
  const dirSize = 16 * numImages;
  let dataOffset = headerSize + dirSize;

  const totalSize = dataOffset + images.reduce((acc, img) => acc + img.buffer.length, 0);
  const out = Buffer.alloc(totalSize);

  // Write header
  out.writeUInt16LE(0, 0); // reserved
  out.writeUInt16LE(1, 2); // 1 = ICO
  out.writeUInt16LE(numImages, 4); // count

  let currentOffset = dataOffset;
  for (let i = 0; i < numImages; i++) {
    const img = images[i];
    const entryOffset = headerSize + i * 16;
    out.writeUInt8(img.size === 256 ? 0 : img.size, entryOffset); // width
    out.writeUInt8(img.size === 256 ? 0 : img.size, entryOffset + 1); // height
    out.writeUInt8(0, entryOffset + 2); // colors
    out.writeUInt8(0, entryOffset + 3); // reserved
    out.writeUInt16LE(1, entryOffset + 4); // color planes
    out.writeUInt16LE(32, entryOffset + 6); // bpp
    out.writeUInt32LE(img.buffer.length, entryOffset + 8); // size in bytes
    out.writeUInt32LE(currentOffset, entryOffset + 12); // file offset

    img.buffer.copy(out, currentOffset);
    currentOffset += img.buffer.length;
  }

  return out;
}

createOptimizedIcons().catch(console.error);

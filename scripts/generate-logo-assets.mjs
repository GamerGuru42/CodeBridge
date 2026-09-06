import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputPath = 'C:/Users/Benny Ben/.gemini/antigravity-ide/brain/ad1175fe-d916-4a66-88cf-086a1b25fc15/.user_uploaded/media_1788700352433.jpg';
const outputDir = 'c:/Users/Benny Ben/Documents/CodeBridge/public/images';

async function processLogo() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Load raw image
  const img = sharp(inputPath);
  const metadata = await img.metadata();
  const { width, height } = metadata;

  // Let's get raw RGBA buffer
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = 4;

  // 1. First, let's create a transparent version using exterior flood-fill
  // We want to make the background transparent, but KEEP the interior colors intact.
  // The background is around (244-252, 244-252, 244-252).
  // Let's implement an accurate alpha-matting algorithm for the background:
  // For any pixel:
  // Background brightness: Bg ~ 248.
  // If a pixel is near the background color, its alpha can be smoothly rolled off to 0.
  // Specifically: if (r > 235 && g > 235 && b > 235), it is background.
  // To avoid haloing / fringing against white or dark backgrounds:
  // Alpha = 1 - Math.min(r, g, b) / 255 is NOT good for dark pixels.
  // Instead:
  // Since the background in the original is a flat off-white (248, 248, 248),
  // For pixels with r,g,b > 220, we can calculate how close they are to the background color.

  // Let's test two approaches:
  // Approach A: Normalized Pure-White Background
  // Map the off-white [244..252] to pure 255 [255, 255, 255], while leaving colors untouched.
  // This produces zero artifacts on white/light backgrounds!
  //
  // Approach B: Transparent Background
  // Flood-fill from borders to find exterior background.
  // For exterior background pixels, set alpha = 0.
  // For anti-aliased edge pixels, compute alpha and de-matte the background color.

  // Let's create Approach B (Transparent) and Approach A (Pure White).

  // Full Logo Bounding Box:
  // minX=72, maxX=951 (width=880), minY=212, maxY=416 (height=205)
  // Let's add a small, balanced padding around the logo:
  const padX = 20;
  const padY = 20;
  const cropX = Math.max(0, 72 - padX);
  const cropY = Math.max(0, 212 - padY);
  const cropW = Math.min(width - cropX, (951 - 72) + 2 * padX);
  const cropH = Math.min(height - cropY, (416 - 212) + 2 * padY);

  console.log(`Full logo crop rect: x=${cropX}, y=${cropY}, w=${cropW}, h=${cropH}`);

  // Monogram Icon Bounding Box:
  // x=72 to 318 (w=247), y=212 to 416 (h=205)
  // Let's make it square with equal padding!
  const iconSize = Math.max(247, 205); // 247
  const iconPad = 16;
  const iconCropW = iconSize + 2 * iconPad;
  const iconCropH = iconCropW;
  const iconCenterX = 72 + 247 / 2;
  const iconCenterY = 212 + 205 / 2;
  const iconCropX = Math.round(iconCenterX - iconCropW / 2);
  const iconCropY = Math.round(iconCenterY - iconCropH / 2);

  console.log(`Icon crop rect (square): x=${iconCropX}, y=${iconCropY}, size=${iconCropW}`);

  // Let's generate:
  // 1. High-res original crop (full logo)
  await sharp(inputPath)
    .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
    .toFile(path.join(outputDir, 'codebridge-logo-full-original.png'));

  // 2. High-res original crop (icon only)
  await sharp(inputPath)
    .extract({ left: iconCropX, top: iconCropY, width: iconCropW, height: iconCropH })
    .toFile(path.join(outputDir, 'codebridge-icon-original.png'));

  // 3. High-quality transparent PNG of full logo and icon:
  // Let's do exterior flood-fill + soft alpha edge matting
  const fullTransparent = await createTransparentVersion(inputPath, cropX, cropY, cropW, cropH);
  await fullTransparent.toFile(path.join(outputDir, 'codebridge-logo-full.png'));

  // Also WebP for fast web performance
  await fullTransparent.webp({ quality: 95 }).toFile(path.join(outputDir, 'codebridge-logo-full.webp'));

  const iconTransparent = await createTransparentVersion(inputPath, iconCropX, iconCropY, iconCropW, iconCropH);
  await iconTransparent.toFile(path.join(outputDir, 'codebridge-icon.png'));
  await iconTransparent.webp({ quality: 95 }).toFile(path.join(outputDir, 'codebridge-icon.webp'));

  // 4. Also create favicon icons of various sizes (16x16, 32x32, 48x48, 180x180, 192x192, 512x512)
  await iconTransparent.resize(192, 192).toFile('c:/Users/Benny Ben/Documents/CodeBridge/public/icon-192.png');
  await iconTransparent.resize(512, 512).toFile('c:/Users/Benny Ben/Documents/CodeBridge/public/icon-512.png');
  await iconTransparent.resize(180, 180).toFile('c:/Users/Benny Ben/Documents/CodeBridge/public/apple-touch-icon.png');
  await iconTransparent.resize(32, 32).toFile('c:/Users/Benny Ben/Documents/CodeBridge/public/favicon-32x32.png');
  await iconTransparent.resize(16, 16).toFile('c:/Users/Benny Ben/Documents/CodeBridge/public/favicon-16x16.png');

  // Also copy to public/icon.png and public/icon.svg
  await iconTransparent.resize(128, 128).toFile('c:/Users/Benny Ben/Documents/CodeBridge/public/icon.png');

  // Let's also create an SVG that embeds the full logo and icon as base64 PNG so any SVG consumer gets the exact rendering
  const fullPngBase64 = fs.readFileSync(path.join(outputDir, 'codebridge-logo-full.png')).toString('base64');
  const iconPngBase64 = fs.readFileSync(path.join(outputDir, 'codebridge-icon.png')).toString('base64');

  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cropW} ${cropH}" width="100%" height="100%">
  <image href="data:image/png;base64,${fullPngBase64}" width="${cropW}" height="${cropH}" />
</svg>`;
  fs.writeFileSync('c:/Users/Benny Ben/Documents/CodeBridge/public/logo.svg', logoSvg);

  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${iconCropW} ${iconCropH}" width="100%" height="100%">
  <image href="data:image/png;base64,${iconPngBase64}" width="${iconCropW}" height="${iconCropH}" />
</svg>`;
  fs.writeFileSync('c:/Users/Benny Ben/Documents/CodeBridge/public/icon.svg', iconSvg);

  console.log('All logo assets generated successfully!');
}

async function createTransparentVersion(srcPath, left, top, width, height) {
  // Extract region
  const { data, info } = await sharp(srcPath)
    .extract({ left, top, width, height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = 4;
  const totalPixels = width * height;

  // Background color is approximately (248, 248, 248)
  // Let's find background pixels via BFS flood-fill from the outer borders
  const isBgCandidate = (r, g, b) => {
    // If pixel is very light (brightness > 230 and color saturation is low)
    const maxVal = Math.max(r, g, b);
    const minVal = Math.min(r, g, b);
    const diff = maxVal - minVal;
    // Saturation is low (diff < 15) and brightness is high (> 230)
    return minVal > 228 && diff < 18;
  };

  const visited = new Uint8Array(totalPixels);
  const isExterior = new Uint8Array(totalPixels);
  const queue = [];

  // Seed borders
  for (let x = 0; x < width; x++) {
    queue.push(0 * width + x); // top
    queue.push((height - 1) * width + x); // bottom
  }
  for (let y = 0; y < height; y++) {
    queue.push(y * width + 0); // left
    queue.push(y * width + (width - 1)); // right
  }

  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    visited[p] = 1;
  }

  let head = 0;
  while (head < queue.length) {
    const p = queue[head++];
    const px = p % width;
    const py = Math.floor(p / width);
    const idx = p * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    if (isBgCandidate(r, g, b)) {
      isExterior[p] = 1;

      // Check 4 neighbours
      const neighbors = [
        px > 0 ? py * width + (px - 1) : -1,
        px < width - 1 ? py * width + (px + 1) : -1,
        py > 0 ? (py - 1) * width + px : -1,
        py < height - 1 ? (py + 1) * width + px : -1,
      ];

      for (const n of neighbors) {
        if (n >= 0 && !visited[n]) {
          visited[n] = 1;
          queue.push(n);
        }
      }
    }
  }

  // Now process alpha:
  // For pixels in isExterior:
  // They are background. Set alpha = 0.
  // For pixels adjacent to isExterior, calculate smooth anti-aliased edge
  const outData = Buffer.from(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      const idx = p * channels;

      if (isExterior[p]) {
        outData[idx + 3] = 0; // Fully transparent
      } else {
        // Check if on the edge (has adjacent exterior pixel)
        let hasExt = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              if (isExterior[ny * width + nx]) {
                hasExt = true;
                break;
              }
            }
          }
          if (hasExt) break;
        }

        if (hasExt) {
          // Anti-aliased boundary pixel
          const r = outData[idx];
          const g = outData[idx + 1];
          const b = outData[idx + 2];
          const minVal = Math.min(r, g, b);
          // If close to white (e.g. > 215), blend alpha
          if (minVal > 215) {
            // Alpha smoothly falls off
            const alphaFactor = Math.max(0, Math.min(1, (248 - minVal) / 33));
            outData[idx + 3] = Math.round(alphaFactor * 255);
          }
        }
      }
    }
  }

  return sharp(outData, {
    raw: {
      width,
      height,
      channels: 4,
    }
  });
}

processLogo().catch(console.error);

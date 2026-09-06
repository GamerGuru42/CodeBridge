import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outputDir = 'c:/Users/Benny Ben/Documents/CodeBridge/public/images';
const darkLogoPath = path.join(outputDir, 'codebridge-logo-full.png');

async function generateLightVersion() {
  const { data, info } = await sharp(darkLogoPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const outData = Buffer.from(data);

  // The text starts at around x = 300 to 340
  // Let's find where the monogram ends and text begins in the cropped full logo
  // Full logo crop had: cropX=52, monogram x was 72 to 318
  // In the crop, monogram is from x = (72-52) = 20 to (318-52) = 266
  // Text starts at (344 - 52) = 292

  const textStartX = 275;

  // Let's check text area:
  // "CodeBridge" is top text (y roughly 0 to 160)
  // "Ideas to Impact" is bottom tagline (y roughly 160 to height)
  // Let's analyze luminance of text pixels
  for (let y = 0; y < height; y++) {
    for (let x = textStartX; x < width; x++) {
      const idx = (y * width + x) * channels;
      const alpha = outData[idx + 3];
      if (alpha === 0) continue;

      const r = outData[idx];
      const g = outData[idx + 1];
      const b = outData[idx + 2];

      // Luminance in original
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // In the original, background is light, text is dark.
      // Darker pixel = higher opacity of text.
      // If we invert the text intensity:
      // When lum is low (dark text ~15), text should be bright white (255, 255, 255).
      // Tagline is around y > 150
      if (y > 155) {
        // Tagline "Ideas to Impact" -> light slate (#94A3B8 -> 148, 163, 184)
        const textWeight = Math.max(0, Math.min(1, (220 - lum) / 180));
        outData[idx] = Math.round(148 * textWeight + 255 * (1 - textWeight));
        outData[idx + 1] = Math.round(163 * textWeight + 255 * (1 - textWeight));
        outData[idx + 2] = Math.round(184 * textWeight + 255 * (1 - textWeight));
        outData[idx + 3] = Math.round(alpha * textWeight);
      } else {
        // Title "CodeBridge" -> pure white (#FFFFFF)
        const textWeight = Math.max(0, Math.min(1, (220 - lum) / 200));
        outData[idx] = 255;
        outData[idx + 1] = 255;
        outData[idx + 2] = 255;
        outData[idx + 3] = Math.round(alpha * textWeight);
      }
    }
  }

  const lightImg = sharp(outData, {
    raw: { width, height, channels }
  });

  await lightImg.toFile(path.join(outputDir, 'codebridge-logo-light.png'));
  await lightImg.webp({ quality: 95 }).toFile(path.join(outputDir, 'codebridge-logo-light.webp'));

  console.log('Light-text logo version generated successfully!');
}

generateLightVersion().catch(console.error);

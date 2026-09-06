import sharp from 'sharp';
import path from 'path';

const outputDir = 'c:/Users/Benny Ben/Documents/CodeBridge/public/images';
const darkLogoPath = path.join(outputDir, 'codebridge-logo-full.png');
const lightLogoPath = path.join(outputDir, 'codebridge-logo-light.png');

async function generateNoTagVersions() {
  const metadata = await sharp(darkLogoPath).metadata();
  const { width, height } = metadata;

  // The tagline is in the bottom ~35% of the height
  // In our crop of h=244:
  // Monogram is h=205.
  // "CodeBridge" is vertically aligned with the top portion of the monogram.
  // Let's crop to include the monogram and "CodeBridge", cutting off "Ideas to Impact"
  // Let's inspect the exact Y where "Ideas to Impact" starts:
  const noTagHeight = 168;

  await sharp(darkLogoPath)
    .extract({ left: 0, top: 0, width, height: noTagHeight })
    .toFile(path.join(outputDir, 'codebridge-logo-notag.png'));

  await sharp(lightLogoPath)
    .extract({ left: 0, top: 0, width, height: noTagHeight })
    .toFile(path.join(outputDir, 'codebridge-logo-notag-light.png'));

  console.log('No-tagline logo versions generated!');
}

generateNoTagVersions().catch(console.error);

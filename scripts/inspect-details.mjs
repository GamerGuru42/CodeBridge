import sharp from 'sharp';

const inputPath = 'C:/Users/Benny Ben/.gemini/antigravity-ide/brain/ad1175fe-d916-4a66-88cf-086a1b25fc15/.user_uploaded/media_1788700352433.jpg';

async function inspectMonogramDetails() {
  const { data, info } = await sharp(inputPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Let's sample the center of the monogram (the bridge cutout)
  // Monogram x: 72 to 318, center x is ~195
  // Monogram y: 212 to 416, center y is ~314
  console.log('Center of monogram (bridge area):');
  for (let y = 300; y <= 330; y += 5) {
    const row = [];
    for (let x = 150; x <= 250; x += 15) {
      const idx = (y * width + x) * channels;
      row.push(`(${data[idx]},${data[idx+1]},${data[idx+2]})`);
    }
    console.log(`y=${y}: ${row.join(' ')}`);
  }

  // Check the outer background around the logo
  console.log('\nOuter background samples (around x=50, y=200):');
  for (let y = 190; y <= 210; y += 5) {
    const idx = (y * width + 50) * channels;
    console.log(`y=${y}, x=50: (${data[idx]},${data[idx+1]},${data[idx+2]})`);
  }
}

inspectMonogramDetails().catch(console.error);

import sharp from 'sharp';

const inputPath = 'C:/Users/Benny Ben/.gemini/antigravity-ide/brain/ad1175fe-d916-4a66-88cf-086a1b25fc15/.user_uploaded/media_1788700352433.jpg';

async function checkBackground() {
  const { data, info } = await sharp(inputPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  // Let's sample along the borders
  const borderVals = [];
  for (let x = 0; x < width; x += 10) {
    let idxTop = x * channels;
    let idxBot = ((height - 1) * width + x) * channels;
    borderVals.push(data[idxTop], data[idxBot]);
  }
  for (let y = 0; y < height; y += 10) {
    let idxL = (y * width) * channels;
    let idxR = (y * width + (width - 1)) * channels;
    borderVals.push(data[idxL], data[idxR]);
  }
  borderVals.sort((a,b) => a - b);
  console.log('Border values range: min=', borderVals[0], 'median=', borderVals[Math.floor(borderVals.length/2)], 'max=', borderVals[borderVals.length - 1]);

  // Logo colors:
  // Let's find pixels that are clearly part of the logo (e.g. brightness < 220)
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      // Brightness check:
      // Background is paper/white around 235-255
      // If brightness < 225
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      if (brightness < 225) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log(`True logo bounding box (brightness < 225): minX=${minX}, maxX=${maxX}, minY=${minY}, maxY=${maxY}`);
  console.log(`Dimensions: width=${maxX - minX + 1}, height=${maxY - minY + 1}`);

  // Now let's see horizontal projection of pixels with brightness < 225
  const colCounts = new Array(width).fill(0);
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      const idx = (y * width + x) * channels;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      if (0.299 * r + 0.587 * g + 0.114 * b < 225) {
        colCounts[x]++;
      }
    }
  }

  // Find where colCounts drops to near zero between monogram and text
  let gapStart = 0, gapEnd = 0;
  for (let x = minX + 50; x < maxX - 50; x++) {
    if (colCounts[x] === 0 && colCounts[x - 1] > 0 && gapStart === 0) {
      gapStart = x;
    }
    if (colCounts[x] > 0 && gapStart > 0 && gapEnd === 0) {
      gapEnd = x;
      break;
    }
  }
  console.log(`Monogram icon bounds: x=${minX} to ${gapStart - 1}, width=${gapStart - minX}`);
  console.log(`Text bounds: x=${gapEnd} to ${maxX}, width=${maxX - gapEnd + 1}`);

  // Monogram Y bounds
  let mMinY = height, mMaxY = 0;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x < gapStart; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      if (0.299 * r + 0.587 * g + 0.114 * b < 225) {
        if (y < mMinY) mMinY = y;
        if (y > mMaxY) mMaxY = y;
      }
    }
  }
  console.log(`Monogram Y bounds: minY=${mMinY}, maxY=${mMaxY}, height=${mMaxY - mMinY + 1}`);

  // Text Y bounds
  let tMinY = height, tMaxY = 0;
  for (let y = minY; y <= maxY; y++) {
    for (let x = gapEnd; x <= maxX; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      if (0.299 * r + 0.587 * g + 0.114 * b < 225) {
        if (y < tMinY) tMinY = y;
        if (y > tMaxY) tMaxY = y;
      }
    }
  }
  console.log(`Text Y bounds: minY=${tMinY}, maxY=${tMaxY}, height=${tMaxY - tMinY + 1}`);
}

checkBackground().catch(console.error);

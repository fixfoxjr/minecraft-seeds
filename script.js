// Initialize Perlin noise
const noise = new Noise(Math.random());

const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

const width = canvas.width;
const height = canvas.height;

// Map settings
const scale = 0.02; // zoom of noise
const octaves = 4; // layers of noise
const persistence = 0.5; // amplitude decay
const biomeColors = {
  ocean: '#4060ff',
  beach: '#fff5ba',
  plains: '#50c878',
  forest: '#228B22',
  desert: '#edc9af',
  mountain: '#888888',
  snow: '#ffffff'
};

// Generate height map
function getHeight(x, y) {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise.perlin2(x * scale * frequency, y * scale * frequency);
    amplitude *= persistence;
    frequency *= 2;
  }
  return (value + 1) / 2; // normalize to 0-1
}

// Generate temperature map (for biome assignment)
function getTemperature(y) {
  return 1 - (y / height); // warmer at bottom, colder at top
}

// Generate humidity map (simple)
function getHumidity(x, y) {
  return (noise.perlin2(x * scale, y * scale) + 1) / 2;
}

// Biome assignment
function getBiome(height, temp, humidity) {
  if (height < 0.3) return 'ocean';
  if (height < 0.35) return 'beach';
  if (height > 0.8) return temp < 0.5 ? 'snow' : 'mountain';
  if (temp > 0.7) return humidity < 0.3 ? 'desert' : 'plains';
  return humidity > 0.6 ? 'forest' : 'plains';
}

// Draw map
function drawMap() {
  const image = ctx.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const h = getHeight(x, y);
      const t = getTemperature(y);
      const m = getHumidity(x, y);
      const biome = getBiome(h, t, m);
      const color = hexToRgb(biomeColors[biome]);

      const index = (y * width + x) * 4;
      image.data[index] = color.r;
      image.data[index + 1] = color.g;
      image.data[index + 2] = color.b;
      image.data[index + 3] = 255;
    }
  }

  // Draw rivers (follow low points)
  for (let i = 0; i < 5; i++) {
    drawRiver();
  }

  ctx.putImageData(image, 0, 0);
}

// Draw a simple river
function drawRiver() {
  let x = Math.floor(Math.random() * width);
  let y = 0;

  for (let i = 0; i < height; i++) {
    const index = (y * width + x) * 4;
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(x, y, 1, 1);

    // Move to lowest neighbor
    let lowest = getHeight(x, y);
    let nx = x, ny = y + 1;

    for (let dx = -1; dx <= 1; dx++) {
      const nxTry = x + dx;
      const nyTry = y + 1;
      if (nxTry < 0 || nxTry >= width) continue;
      const hTry = getHeight(nxTry, nyTry);
      if (hTry < lowest) {
        lowest = hTry;
        nx = nxTry;
        ny = nyTry;
      }
    }

    x = nx;
    y = ny;
    if (y >= height - 1) break;
  }
}

// Utility: hex to RGB
function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

// Draw the map
drawMap();

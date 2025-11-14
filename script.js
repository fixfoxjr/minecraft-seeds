// HTML elements
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const seedInput = document.getElementById('seedInput');
const generateBtn = document.getElementById('generateBtn');

const width = canvas.width;
const height = canvas.height;

// Map settings
const scale = 0.02;
const octaves = 4;
const persistence = 0.5;
const biomeColors = {
  ocean: '#4060ff',
  beach: '#fff5ba',
  plains: '#50c878',
  forest: '#228B22',
  desert: '#edc9af',
  mountain: '#888888',
  snow: '#ffffff'
};

// Generate numeric seed from string
function hashSeed(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0; // convert to 32bit integer
  }
  return hash;
}

// Initialize Perlin noise with seed
let noise;
function initNoise(seed) {
  noise = new Noise(seed);
}

// Height map
function getHeight(x, y) {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise.perlin2(x * scale * frequency, y * scale * frequency);
    amplitude *= persistence;
    frequency *= 2;
  }
  return (value + 1) / 2;
}

// Temperature map
function getTemperature(y) {
  return 1 - (y / height);
}

// Humidity map
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

// Draw the map
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

  // Draw rivers
  for (let i = 0; i < 5; i++) drawRiver();

  ctx.putImageData(image, 0, 0);
}

// Simple river generation
function drawRiver() {
  let x = Math.floor(Math.random() * width);
  let y = 0;

  for (let i = 0; i < height; i++) {
    const index = (y * width + x) * 4;
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(x, y, 1, 1);

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

// Hex to RGB
function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

// Generate map with user seed
function generateMap() {
  const seedStr = seedInput.value || Math.random().toString();
  const numericSeed = hashSeed(seedStr);
  initNoise(numericSeed);
  drawMap();
}

// Button click
generateBtn.addEventListener('click', generateMap);

// Initial random map
generateMap();

// Canvas & map setup
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
let seedsData = [];
let selectedSeed = null;
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let dragStart = { x: 0, y: 0 };

// Load seeds
fetch('seeds.json')
  .then(res => res.json())
  .then(data => {
    seedsData = data;
    displaySeeds();
  });

function displaySeeds() {
  const ul = document.getElementById('seeds');
  ul.innerHTML = '';
  seedsData.forEach(seed => {
    const li = document.createElement('li');
    li.textContent = `${seed.name} (Seed: ${seed.seed})`;
    li.onclick = () => selectSeed(seed);
    ul.appendChild(li);
  });
}

function selectSeed(seed) {
  selectedSeed = seed;
  offsetX = 0;
  offsetY = 0;
  scale = 1;
  drawMap(seed);
}

// Simple Perlin-like pseudo-random for biome generation
function pseudoRandom(seed, x, y) {
  return Math.abs(Math.sin(seed * 12.9898 + x * 78.233 + y * 37.719) * 43758.5453) % 1;
}

// Map biomes like Chunkbase
const biomes = [
  { name: 'Plains', color: '#88c070' },
  { name: 'Forest', color: '#228B22' },
  { name: 'Desert', color: '#EDC9Af' },
  { name: 'Taiga', color: '#A0D0A0' },
  { name: 'Jungle', color: '#007F0E' },
  { name: 'Savanna', color: '#C2B280' },
  { name: 'Snowy Tundra', color: '#FFFFFF' },
  { name: 'Swamp', color: '#556B2F' }
];

function getBiome(seed, x, y) {
  const value = pseudoRandom(seed.seed, x, y);
  return biomes[Math.floor(value * biomes.length)];
}

// Draw map
function drawMap(seed) {
  const width = canvas.width;
  const height = canvas.height;
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  ctx.clearRect(0, 0, width, height);

  const cellSize = 8;
  for (let x = 0; x < width; x += cellSize) {
    for (let y = 0; y < height; y += cellSize) {
      const biome = getBiome(seed, x, y);
      ctx.fillStyle = biome.color;
      ctx.fillRect(x, y, cellSize, cellSize);
    }
  }

  // Draw claimed areas
  const claimed = JSON.parse(localStorage.getItem(`claims-${seed.seed}`)) || [];
  claimed.forEach(c => {
    ctx.fillStyle = 'rgba(255,0,0,0.5)';
    ctx.fillRect(c.x - 10, c.y - 10, 20, 20);
  });
}

// Click to claim
canvas.addEventListener('click', e => {
  if (!selectedSeed) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left - offsetX) / scale;
  const y = (e.clientY - rect.top - offsetY) / scale;
  const claimed = JSON.parse(localStorage.getItem(`claims-${selectedSeed.seed}`)) || [];
  claimed.push({ x, y });
  localStorage.setItem(`claims-${selectedSeed.seed}`, JSON.stringify(claimed));

  const biome = getBiome(selectedSeed, x, y).name;
  drawMap(selectedSeed);
  alert(`You claimed area at (${Math.floor(x)},${Math.floor(y)}) in ${biome} biome`);
});

// Drag & pan
canvas.addEventListener('mousedown', e => {
  isDragging = true;
  dragStart.x = e.clientX - offsetX;
  dragStart.y = e.clientY - offsetY;
  canvas.style.cursor = 'grabbing';
});
canvas.addEventListener('mousemove', e => {
  if (!isDragging) return;
  offsetX = e.clientX - dragStart.x;
  offsetY = e.clientY - dragStart.y;
  drawMap(selectedSeed);
});
canvas.addEventListener('mouseup', () => { isDragging = false; canvas.style.cursor = 'grab'; });
canvas.addEventListener('mouseleave', () => { isDragging = false; canvas.style.cursor = 'grab'; });

// Zoom
canvas.addEventListener('wheel', e => {
  if (!selectedSeed) return;
  e.preventDefault();
  const zoom = e.deltaY < 0 ? 1.1 : 0.9;
  scale *= zoom;
  drawMap(selectedSeed);
});

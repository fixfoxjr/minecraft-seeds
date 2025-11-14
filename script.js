let seedsData = [];
let selectedSeed = null;
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
const seedsList = document.getElementById("seeds");
const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

// Load seeds JSON
fetch('seeds.json')
    .then(response => response.json())
    .then(data => {
        seedsData = data;
        displaySeeds();
    });

function displaySeeds() {
    seedsList.innerHTML = '';
    seedsData.forEach(seed => {
        const li = document.createElement('li');
        li.textContent = `${seed.name} (Seed: ${seed.seed})`;
        li.onclick = () => selectSeed(seed);
        seedsList.appendChild(li);
    });
}

function selectSeed(seed) {
    selectedSeed = seed;
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    drawMap(seed);
}

// Simple biome function based on coordinates
function getBiome(seed, x, y) {
    const value = Math.sin(seed.seed * x * 0.01 + y * 0.01) * 10000;
    const index = Math.abs(Math.floor(value)) % biomes.length;
    return biomes[index];
}

const biomes = ["Plains", "Forest", "Desert", "Taiga", "Jungle", "Savanna", "Snowy Tundra", "Swamp"];

function drawMap(seed) {
    const width = seed.mapWidth;
    const height = seed.mapHeight;
    canvas.width = width;
    canvas.height = height;

    for (let x = 0; x < width; x += 10) {
        for (let y = 0; y < height; y += 10) {
            ctx.fillStyle = biomeColor(getBiome(seed, x, y));
            ctx.fillRect(x, y, 10, 10);
        }
    }

    // Draw claimed areas
    const claimed = JSON.parse(localStorage.getItem(`claims-${seed.seed}`)) || [];
    claimed.forEach(c => {
        ctx.fillStyle = "rgba(255,0,0,0.5)";
        ctx.fillRect(c.x - 10, c.y - 10, 20, 20);
    });
}

function biomeColor(biome) {
    switch (biome) {
        case "Plains": return "#88c070";
        case "Forest": return "#228B22";
        case "Desert": return "#EDC9Af";
        case "Taiga": return "#A0D0A0";
        case "Jungle": return "#007F0E";
        case "Savanna": return "#C2B280";
        case "Snowy Tundra": return "#FFFFFF";
        case "Swamp": return "#556B2F";
        default: return "#888";
    }
}

// Handle click to claim areas and show biome
canvas.addEventListener("click", (e) => {
    if (!selectedSeed) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offsetX) / scale;
    const y = (e.clientY - rect.top - offsetY) / scale;
    
    const claimed = JSON.parse(localStorage.getItem(`claims-${selectedSeed.seed}`)) || [];
    claimed.push({ x, y });
    localStorage.setItem(`claims-${selectedSeed.seed}`, JSON.stringify(claimed));

    drawMap(selectedSeed);

    const biome = getBiome(selectedSeed, x, y);
    alert(`You claimed area at (${Math.floor(x)}, ${Math.floor(y)}) in ${biome} biome`);
});

// Drag & pan
canvas.addEventListener("mousedown", e => {
    isDragging = true;
    dragStart.x = e.clientX - offsetX;
    dragStart.y = e.clientY - offsetY;
});

canvas.addEventListener("mousemove", e => {
    if (isDragging) {
        offsetX = e.clientX - dragStart.x;
        offsetY = e.clientY - dragStart.y;
        ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
        drawMap(selectedSeed);
    }
});

canvas.addEventListener("mouseup", () => isDragging = false);
canvas.addEventListener("mouseleave", () => isDragging = false);

// Zoom with mouse wheel
canvas.addEventListener("wheel", e => {
    if (!selectedSeed) return;
    e.preventDefault();
    const zoom = e.deltaY < 0 ? 1.1 : 0.9;
    scale *= zoom;

    // Keep zoom centered on cursor
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    offsetX -= (mx / scale) * (zoom - 1);
    offsetY -= (my / scale) * (zoom - 1);

    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    drawMap(selectedSeed);
});

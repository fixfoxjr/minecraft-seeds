let seedsData = [];
let selectedSeed = null;
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
    drawMap(seed);
}

function drawMap(seed) {
    // Simple placeholder: generate random colors to simulate map
    const width = seed.mapWidth;
    const height = seed.mapHeight;
    canvas.width = width;
    canvas.height = height;

    for (let x = 0; x < width; x += 10) {
        for (let y = 0; y < height; y += 10) {
            ctx.fillStyle = getRandomColor(seed.seed + x + y);
            ctx.fillRect(x, y, 10, 10);
        }
    }

    // Add click event to select areas
    canvas.onclick = function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ctx.fillStyle = "rgba(255,0,0,0.5)";
        ctx.fillRect(x-10, y-10, 20, 20);
        alert(`You claimed area at (${Math.floor(x)}, ${Math.floor(y)})`);
    }
}

// Simple pseudo-random color generator
function getRandomColor(seed) {
    let x = Math.sin(seed) * 10000;
    let color = Math.floor((x - Math.floor(x)) * 16777215).toString(16);
    return '#' + color.padStart(6, '0');
}


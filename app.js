
let allShows = [];
let currentPair = [];
let isGameActive = true;
let score = 0;

const API_URL = "https://api.tvmaze.com/shows";

const statusDiv = document.getElementById('status');
const gameArea = document.getElementById('gameArea');
const resultMsg = document.getElementById('result');
const nextBtn = document.getElementById('nextBtn');
const scoreValue = document.getElementById('score-value');


async function initGame() {
    try {
        statusDiv.innerText = "Downloading database...";
        
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Error connecting to TVMaze");
        
        const data = await response.json();

        allShows = data.filter(show => 
            show.rating && show.rating.average && show.image
        );

        if (allShows.length > 0) {
            console.log("Loaded " + allShows.length + " series.");
            startRound();
        } else {
            throw new Error("No data found");
        }

    } catch (error) {
        console.error(error);
        statusDiv.innerText = "Error loading. Please refresh.";
        statusDiv.style.color = "var(--error)";
    }
}

function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(url);
        img.onerror = () => resolve(null); 
    });
}

// --- 3. GAME ROUND (ASYNC) ---
async function startRound() {
    isGameActive = true;

    gameArea.style.display = 'none';
    nextBtn.classList.add('hidden');
    resultMsg.innerText = "";

    statusDiv.style.display = 'block';
    statusDiv.innerText = "LOADING IMAGES...";

    document.getElementById('score0').classList.add('hidden');
    document.getElementById('score1').classList.add('hidden');

    const idx1 = Math.floor(Math.random() * allShows.length);
    let idx2 = Math.floor(Math.random() * allShows.length);
    while(idx1 === idx2) idx2 = Math.floor(Math.random() * allShows.length);

    currentPair = [allShows[idx1], allShows[idx2]];
    const showA = currentPair[0];
    const showB = currentPair[1];

    const urlA = showA.image.original || showA.image.medium;
    const urlB = showB.image.original || showB.image.medium;

    await Promise.all([
        preloadImage(urlA),
        preloadImage(urlB)
    ]);

    renderCard(0, showA, urlA);
    renderCard(1, showB, urlB);

    statusDiv.style.display = 'none';
    gameArea.style.display = 'flex';
}

function renderCard(id, show, loadedUrl) {
    const img = document.getElementById(`img${id}`);
    const name = document.getElementById(`name${id}`);
    const meta = document.getElementById(`meta${id}`);
    const scoreEl = document.getElementById(`score${id}`);

    img.src = loadedUrl || 'https://via.placeholder.com/280x380/1a1a1a/333333?text=No+Image';
    
    name.innerText = show.name;
    
    const year = show.premiered ? show.premiered.split('-')[0] : "N/A";
    const network = show.network ? show.network.name : (show.webChannel ? show.webChannel.name : 'Unknown');
    meta.innerText = `${year} • ${network}`;
    
    scoreEl.innerText = show.rating.average.toFixed(1);

    const card = document.getElementById(`card${id}`);
    card.onclick = null; 
    card.onclick = () => {
        if(isGameActive) checkWinner(id);
    };
}

function checkWinner(selectedId) {
    isGameActive = false;

    const showA = currentPair[0];
    const showB = currentPair[1];
    
    const scoreA = showA.rating.average;
    const scoreB = showB.rating.average;
    const winnerId = (scoreA >= scoreB) ? 0 : 1;

    document.getElementById('score0').classList.remove('hidden');
    document.getElementById('score1').classList.remove('hidden');

    if (selectedId === winnerId) {
        score++; 
        resultMsg.innerText = "Correct! (+1)";
        resultMsg.className = "correct";
        scoreValue.style.color = "var(--success)";
    } else {
        if (score > 0)
            score--; 
        resultMsg.innerText = "Wrong! Score reset.";
        resultMsg.className = "wrong";
        scoreValue.style.color = "var(--error)";
    }

    scoreValue.innerText = score;
    setTimeout(() => { scoreValue.style.color = "var(--text-primary)"; }, 1000);

    nextBtn.classList.remove('hidden');
}

nextBtn.addEventListener('click', startRound);

initGame();
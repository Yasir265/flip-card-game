const spaceEmojis = ['🚀', '🧑‍🚀', '👽', '🛸', '🪐', '🌙', '🛰️', '☄️'];
let cardsArray = [...spaceEmojis, ...spaceEmojis];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let seconds = 0;
let timerInterval;
let bestScore = localStorage.getItem('bestMoves') || Infinity;

const grid = document.getElementById('grid');
const movesEl = document.getElementById('moves');
const timerEl = document.getElementById('timer');
const bestEl = document.getElementById('bestScore');
const winScreen = document.getElementById('win-screen');
const winText = document.getElementById('win-text');
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

bestEl.textContent = bestScore;

let audioCtx;

function playSound(frequency, duration) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + duration);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    timerEl.textContent = seconds;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function createCard(emoji) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.emoji = emoji;

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-front">?</div>
      <div class="card-back">
        <span class="emoji">${emoji}</span>
      </div>
    </div>
  `;

  card.addEventListener('click', flipCard);
  return card;
}

function initGame() {
  grid.innerHTML = '';
  shuffle(cardsArray);
  matchedPairs = 0;
  moves = 0;
  seconds = 0;
  movesEl.textContent = moves;
  timerEl.textContent = seconds;
  stopTimer();
  winScreen.style.display = 'none';
  flippedCards = [];

  cardsArray.forEach(emoji => grid.appendChild(createCard(emoji)));
}

function flipCard(e) {
  const card = e.currentTarget;
  if (!timerInterval) startTimer();
  playSound(800, 0.1); // flip sound

  if (flippedCards.length < 2 && !card.classList.contains('flipped') && !card.classList.contains('matched')) {
    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      moves++;
      movesEl.textContent = moves;
      setTimeout(checkMatch, 1000);
    }
  }
}

function checkMatch() {
  const [card1, card2] = flippedCards;
  if (card1.dataset.emoji === card2.dataset.emoji) {
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchedPairs++;
    playSound(1000, 0.2); // match sound
    flippedCards = [];

    if (matchedPairs === spaceEmojis.length) {
      stopTimer();
      const totalMoves = moves;
      if (totalMoves < bestScore) {
        bestScore = totalMoves;
        localStorage.setItem('bestMoves', bestScore);
        bestEl.textContent = bestScore;
        winText.textContent = `New Best: ${totalMoves} moves & ${seconds}s! 🏆`;
      } else {
        winText.textContent = `Great! ${totalMoves} moves & ${seconds}s 🚀`;
      }
      winScreen.style.display = 'flex';
      confetti();
    }
  } else {
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      flippedCards = [];
    }, 1200);
  }
}

function confetti() {
  const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff88', '#ff6b6b'];
  let particles = [];
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * -15 - 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 5 + 3,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.rotation += p.rotSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
      ctx.restore();
    });
    particles = particles.filter(p => p.y < canvas.height + 50);
    if (particles.length > 0) requestAnimationFrame(animate);
  }
  animate();
}

function resetGame() {
  initGame();
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

initGame();
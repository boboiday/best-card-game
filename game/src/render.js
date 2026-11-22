// Ember Court — the renderer. It paints the whole table from the game state:
// the Warden's row, the played cards, the log, the player's hand, and the
// title, win and loss screens. Cards are DOM, so they slide, lift and snap
// with CSS transitions and stay legible at thumbnail size.

import { RULES, SUITS, PALETTE } from './config.js';
import { keywordText } from './cards.js';
import { PHASE_LOSS, PHASE_PLAY, PHASE_TITLE, PHASE_WIN } from './state.js';

function hearts(life, maxLife) {
  let out = '';
  for (let i = 0; i < maxLife; i += 1) {
    out += i < life ? '♥' : '♡';
  }
  return out;
}

function emberPips(ember, maxEmber) {
  let out = '';
  for (let i = 0; i < maxEmber; i += 1) {
    out += i < ember ? '●' : '○';
  }
  return out;
}

function suitLabel(card) {
  const suit = SUITS[card.suit];
  return `${suit.glyph} ${suit.name}`;
}

// One card face: cost gem, suit glyph in suit colour, name, power, keyword.
export function cardElement(card, callbacks, enabled) {
  const el = document.createElement('div');
  el.className = `card suit-${card.suit}${enabled ? '' : ' disabled'}`;
  el.dataset.cardId = card.id;
  el.innerHTML =
    `<div class="card-cost">${card.cost}</div>` +
    `<div class="card-glyph">${SUITS[card.suit].glyph}</div>` +
    `<div class="card-name">${card.name}</div>` +
    `<div class="card-suit">${suitLabel(card)}</div>` +
    `<div class="card-power">${card.power}</div>` +
    `<div class="card-keyword">${keywordText(card)}</div>`;
  el.addEventListener('click', () => callbacks.onPlayCard(card));
  return el;
}

function renderSideRow(container, side, label) {
  container.innerHTML = '';
  const panel = document.createElement('div');
  panel.className = 'side-panel';
  panel.innerHTML =
    `<span class="side-name">${label}</span>` +
    `<span class="side-life" title="Life">${hearts(side.life, side.maxLife)}</span>` +
    `<span class="side-life-num">${side.life} ♥</span>` +
    `<span class="side-ember" title="Ember">${emberPips(side.ember, side.maxEmber)} ${side.ember} ember</span>` +
    (side.shield > 0 ? `<span class="side-shield">🛡 ${side.shield}</span>` : '') +
    `<span class="side-deck">Deck ${side.deck.length} · Hand ${side.hand.length}</span>`;
  container.appendChild(panel);
}

function renderPlayed(container, cards, label) {
  container.innerHTML = '';
  const title = document.createElement('div');
  title.className = 'played-label';
  title.textContent = label;
  container.appendChild(title);
  for (const card of cards) {
    const el = cardElement(card, { onPlayCard: () => {} }, false);
    el.classList.add('played-card');
    container.appendChild(el);
  }
}

function renderLog(container, log) {
  container.innerHTML = '';
  for (const line of log) {
    const row = document.createElement('div');
    row.className = 'log-line';
    row.textContent = line;
    container.appendChild(row);
  }
}

function confettiBurst(container, seed) {
  container.innerHTML = '';
  let s = seed || 1;
  const colours = ['#e8b64c', '#e2483d', '#2f7fe0', '#3da53d', '#f5ead6'];
  for (let i = 0; i < 48; i += 1) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const piece = document.createElement('div');
    piece.className = 'confetti';
    piece.style.left = `${(s % 100)}%`;
    piece.style.background = colours[i % colours.length];
    piece.style.animationDelay = `${(s % 900) / 1000}s`;
    piece.style.animationDuration = `${1.6 + (s % 1200) / 1000}s`;
    container.appendChild(piece);
  }
}

export function createRenderer(root, callbacks) {
  const wardenRow = root.querySelector('#warden-row');
  const wardenPlayed = root.querySelector('#warden-played');
  const playerPlayed = root.querySelector('#player-played');
  const logBox = root.querySelector('#log');
  const handRow = root.querySelector('#hand');
  const playerRow = root.querySelector('#player-row');
  const comboBanner = root.querySelector('#combo');
  const intentLine = root.querySelector('#intent');
  const turnLabel = root.querySelector('#turn-label');
  const endTurn = root.querySelector('#end-turn');
  const titleScreen = root.querySelector('#title-screen');
  const endScreen = root.querySelector('#end-screen');
  const endTitle = root.querySelector('#end-title');
  const endText = root.querySelector('#end-text');
  const confetti = root.querySelector('#confetti');
  const playAgain = root.querySelector('#play-again');
  const beginButton = root.querySelector('#begin');

  endTurn.addEventListener('click', () => callbacks.onEndTurn());
  beginButton.addEventListener('click', () => callbacks.onBegin());
  playAgain.addEventListener('click', () => callbacks.onBegin());
  titleScreen.addEventListener('click', (event) => {
    if (event.target === titleScreen) callbacks.onBegin();
  });

  function draw(game) {
    renderSideRow(wardenRow, game.warden, 'THE WARDEN');
    renderSideRow(playerRow, game.player, 'YOU');
    renderPlayed(wardenPlayed, game.warden.played, 'Warden’s last cards');
    renderPlayed(playerPlayed, game.player.played, 'Your last cards');
    renderLog(logBox, game.log);
    intentLine.textContent = game.intent ? game.intent.line : 'The Warden watches you…';
    turnLabel.textContent = `Turn ${game.turn} · ${game.player.ember} ember`;

    handRow.innerHTML = '';
    for (const card of game.player.hand) {
      const enabled = game.phase === PHASE_PLAY && game.player.ember >= card.cost;
      handRow.appendChild(cardElement(card, callbacks, enabled));
    }
    endTurn.disabled = game.phase !== PHASE_PLAY;

    comboBanner.textContent = game.combo && game.phase === PHASE_PLAY ? game.combo.text : '';
    comboBanner.className = game.combo && game.phase === PHASE_PLAY ? `combo show suit-${game.combo.suit}` : 'combo';

    const onTitle = game.phase === PHASE_TITLE;
    titleScreen.classList.toggle('hidden', !onTitle);
    const ended = game.phase === PHASE_WIN || game.phase === PHASE_LOSS;
    endScreen.classList.toggle('hidden', !ended);
    if (game.phase === PHASE_WIN) {
      endTitle.textContent = '👑 THE COURT IS YOURS';
      endText.textContent = `The Warden falls ${game.player.life} — ${game.warden.life}. Your embers burn brighter than the old court's.`;
      endScreen.classList.add('win');
      endScreen.classList.remove('loss');
      if (!confetti.hasChildNodes()) confettiBurst(confetti, game.seed + 7);
    } else if (game.phase === PHASE_LOSS) {
      endTitle.textContent = 'THE WARDEN STANDS';
      endText.textContent = `You fall ${game.player.life} — ${game.warden.life}. The court keeps its embers… for now. Play again.`;
      endScreen.classList.add('loss');
      endScreen.classList.remove('win');
      confetti.innerHTML = '';
    }
    root.classList.toggle('in-play', game.phase === PHASE_PLAY);
  }

  return { draw };
}

// Ember Court — game state and the rules that move it.
// One side is the player, the other is the Warden. Each side has life, ember,
// a deck, a hand and a discard pile. Playing a card spends ember, deals its
// power (plus the suit bonus when it beats the foe's last suit), then fires
// its keyword. A turn ends when the player ends it or the Warden has acted.

import { RULES, SUITS, createRandom, shuffle } from './config.js';
import { buildDeck } from './cards.js';

export const PHASE_TITLE = 'title';
export const PHASE_PLAY = 'play';
export const PHASE_WIN = 'win';
export const PHASE_LOSS = 'loss';

export function createSide(random, isWarden) {
  return {
    isWarden,
    random,
    life: RULES.startLife,
    maxLife: RULES.startLife,
    ember: RULES.startEmber,
    maxEmber: RULES.startEmber,
    shield: 0,
    deck: buildDeck(random),
    hand: [],
    discard: [],
    lastSuit: null,
    rally: 0,
    played: [],
  };
}

export function createGame(seed) {
  const random = createRandom(seed);
  const game = {
    seed,
    random,
    phase: PHASE_TITLE,
    turn: 1,
    player: createSide(random, false),
    warden: createSide(random, true),
    log: [],
    intent: null,
    combo: null,
    winner: null,
  };
  drawCards(game.player, RULES.handSize);
  drawCards(game.warden, RULES.handSize);
  return game;
}

export function drawCards(side, count) {
  for (let i = 0; i < count; i += 1) {
    if (side.deck.length === 0) {
      if (side.discard.length === 0) return;
      side.deck = shuffle(side.discard.splice(0), side.random);
    }
    const card = side.deck.pop();
    if (card) side.hand.push(card);
  }
}

// The suit cycle: flame beats leaf, leaf beats stone, stone beats tide,
// tide beats flame. A card whose suit beats the foe's last suit deals +2.
export function suitBonus(card, foe) {
  if (!foe.lastSuit) return 0;
  return SUITS[card.suit].beats === foe.lastSuit ? RULES.suitBonus : 0;
}

export function canPlay(game, card) {
  return game.phase === PHASE_PLAY && game.player.ember >= card.cost;
}

// Deal damage through shields; pierce ignores a shield entirely.
export function dealDamage(target, amount, pierce) {
  let rest = amount;
  if (!pierce && target.shield > 0) {
    const blocked = Math.min(target.shield, rest);
    target.shield -= blocked;
    rest -= blocked;
  }
  target.life = Math.max(0, target.life - rest);
  return rest;
}

export function addLog(game, text) {
  game.log.unshift(text);
  if (game.log.length > 6) game.log.length = 6;
}

// Play one card from a side's hand against the other side. Returns true.
export function playCard(game, side, foe, card) {
  const at = side.hand.indexOf(card);
  if (at < 0 || side.ember < card.cost) return false;
  side.hand.splice(at, 1);
  side.ember -= card.cost;
  side.discard.push(card);
  side.played.push(card);
  if (side.played.length > 3) side.played.shift();

  let power = card.power + side.rally;
  side.rally = 0;
  const bonus = suitBonus(card, foe);
  power += bonus;
  const dealt = dealDamage(foe, power, card.keyword === 'pierce');
  const who = side.isWarden ? 'The Warden' : 'You';
  const bonusText = bonus > 0 ? ` (suit +${bonus})` : '';
  addLog(game, `${who} play ${card.name} for ${dealt} damage${bonusText}.`);
  if (bonus > 0) {
    game.combo = { text: `SUIT COMBO +${bonus}`, suit: card.suit };
  } else {
    game.combo = null;
  }

  if (card.keyword === 'draw') {
    drawCards(side, 1);
    addLog(game, `${who} draw a card.`);
  } else if (card.keyword === 'heal') {
    side.life = Math.min(side.maxLife, side.life + RULES.healAmount);
    addLog(game, `${who} heal ${RULES.healAmount} life.`);
  } else if (card.keyword === 'shield') {
    side.shield += RULES.shieldAmount;
    addLog(game, `${who} raise a shield of ${RULES.shieldAmount}.`);
  } else if (card.keyword === 'rally') {
    side.rally = RULES.rallyBonus;
    addLog(game, `${who} rally: next card +${RULES.rallyBonus}.`);
  }
  side.lastSuit = card.suit;
  checkEnd(game);
  return true;
}

export function checkEnd(game) {
  if (game.phase !== PHASE_PLAY) return;
  if (game.warden.life <= 0) {
    game.phase = PHASE_WIN;
    game.winner = 'player';
    addLog(game, 'The Warden falls. The court is yours.');
  } else if (game.player.life <= 0) {
    game.phase = PHASE_LOSS;
    game.winner = 'warden';
    addLog(game, 'Your embers fade. The Warden stands.');
  }
}

// Start a fresh duel from the title screen.
export function startDuel(game) {
  const fresh = createGame(game.seed);
  Object.assign(game, fresh);
  game.phase = PHASE_PLAY;
  addLog(game, 'The duel begins. Turn 1 — your move.');
}

// Open the player's turn: ember grows by one, one card is drawn.
export function beginPlayerTurn(game) {
  const side = game.player;
  side.maxEmber = Math.min(RULES.maxEmber, side.maxEmber + 1);
  side.ember = side.maxEmber;
  drawCards(side, RULES.drawPerTurn);
  game.turn += 1;
  addLog(game, `Turn ${game.turn} — ember ${side.ember}, draw a card.`);
}

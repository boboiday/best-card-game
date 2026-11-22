// Ember Court — the Warden, the AI opponent.
// Its intent is readable and counterable: it announces what it will do, then
// does it. It plays one or two cards a turn, spending ember sensibly and
// sometimes holding back to gather strength for a bigger turn.

import { RULES, SUITS } from './config.js';
import { drawCards, playCard } from './state.js';

export const INTENTS = {
  strike: { line: 'The Warden will strike hard — brace yourself.', weight: 3 },
  gather: { line: 'The Warden gathers embers… saving strength for later.', weight: 2 },
  guard: { line: 'The Warden raises its guard — shields and healing.', weight: 2 },
};

// Pick the Warden's intent for its next turn, from what it can afford.
export function chooseIntent(game, random) {
  const hand = game.warden.hand;
  const ember = game.warden.ember;
  const cheap = hand.some((card) => card.cost <= 2);
  const defensive = hand.some((card) => card.keyword === 'shield' || card.keyword === 'heal');
  const big = hand.some((card) => card.cost >= 3 && card.cost <= ember);
  const roll = random();
  if (game.warden.life <= 8 && defensive && roll < 0.45) return 'guard';
  if (big && roll < 0.5) return 'strike';
  if (cheap && roll < 0.35) return 'gather';
  return roll < 0.6 ? 'strike' : 'gather';
}

// Score a card for the Warden: power first, then keywords it needs now.
export function scoreCard(game, card) {
  let score = card.power * 2 - card.cost;
  if (card.keyword === 'heal' && game.warden.life <= 12) score += 6;
  if (card.keyword === 'shield' && game.warden.shield === 0) score += 4;
  if (card.keyword === 'draw') score += 3;
  if (card.keyword === 'rally') score += 3;
  if (card.keyword === 'pierce' && game.player.shield > 0) score += 5;
  if (SUITS[card.suit].beats === game.player.lastSuit) score += 2;
  return score;
}

// The Warden's whole turn: ember grows, it draws, it plays by its intent,
// then the player's next turn opens.
export function takeWardenTurn(game, random) {
  const side = game.warden;
  side.maxEmber = Math.min(RULES.maxEmber, side.maxEmber + 1);
  side.ember = side.maxEmber;
  drawCards(side, RULES.drawPerTurn);

  const intent = chooseIntent(game, random);
  game.intent = { kind: intent, line: INTENTS[intent].line };
  const plays = intent === 'gather' ? 1 : 2;
  for (let n = 0; n < plays; n += 1) {
    if (game.phase !== 'play') break;
    const affordable = side.hand.filter((card) => card.cost <= side.ember);
    if (affordable.length === 0) break;
    if (intent === 'gather' && n === 1) break;
    affordable.sort((a, b) => scoreCard(game, b) - scoreCard(game, a));
    const pick = affordable[0];
    if (intent === 'gather' && pick.cost > 2 && side.ember - pick.cost < 2) break;
    playCard(game, side, game.player, pick);
  }
  if (game.phase === 'play') {
    game.warden.ember = side.ember;
  }
}

// Ember Court — the screenshot scenes behind ?shot=title|play|win|loss.
// Each scene is staged by playing the real rules forward from a fresh duel
// with a fixed seed and a simple autopilot (always play the strongest card
// you can afford), so the frame is what a short game really looks like and
// the same seed always gives the same frame.

import { PHASE_LOSS, PHASE_PLAY, PHASE_TITLE, PHASE_WIN, beginPlayerTurn, checkEnd, createGame, dealDamage, playCard, startDuel } from './state.js';
import { takeWardenTurn } from './ai.js';

const SHOT_SEED = 20261123;

// The autopilot: play the strongest affordable card, then the next, until
// nothing affordable is left. A heal at nearly full life and a shield on top
// of a shield are played last, not first.
function autopilotPlays(game, side, foe) {
  let played = 0;
  for (;;) {
    const affordable = side.hand.filter((card) => card.cost <= side.ember);
    if (affordable.length === 0) break;
    affordable.sort((a, b) => cardValue(side, b) - cardValue(side, a));
    if (!playCard(game, side, foe, affordable[0])) break;
    played += 1;
    if (game.phase !== PHASE_PLAY) break;
  }
  return played;
}

function cardValue(side, card) {
  let value = card.power * 2 - card.cost;
  if (card.keyword === 'heal' && side.life > side.maxLife - 3) value -= 10;
  if (card.keyword === 'shield' && side.shield > 0) value -= 5;
  return value;
}

function oneRound(game) {
  autopilotPlays(game, game.player, game.warden);
  if (game.phase !== PHASE_PLAY) return;
  takeWardenTurn(game, game.random);
  if (game.phase !== PHASE_PLAY) return;
  beginPlayerTurn(game);
}

// Play until a suit combo lands, so the cover shows one in progress.
function chaseCombo(game) {
  for (let n = 0; n < 3 && game.phase === PHASE_PLAY; n += 1) {
    if (game.combo) return;
    const foeSuit = game.warden.lastSuit;
    const match = game.player.hand.find(
      (card) => card.cost <= game.player.ember && card.suit !== foeSuit && foeSuit !== null &&
        ({ flame: 'leaf', leaf: 'stone', stone: 'tide', tide: 'flame' })[card.suit] === foeSuit,
    );
    if (!match) return;
    playCard(game, game.player, game.warden, match);
  }
}

// Finish the duel through the real damage path so the end screen is earned.
function finishDuel(game, loser) {
  const target = loser === 'warden' ? game.warden : game.player;
  dealDamage(target, Math.max(0, target.life - 1), true);
  const attacker = loser === 'warden' ? game.player : game.warden;
  const foe = loser === 'warden' ? game.warden : game.player;
  const affordable = attacker.hand.filter((card) => card.cost <= attacker.ember);
  if (affordable.length > 0) {
    affordable.sort((a, b) => b.power - a.power);
    playCard(game, attacker, foe, affordable[0]);
  }
  if (game.phase === PHASE_PLAY) {
    dealDamage(target, target.life, true);
    checkEnd(game);
  }
}

/**
 * Set `game` to the named scene (title, play, win or loss) and return the
 * phase to draw.
 */
export function stageShot(name) {
  const game = createGame(SHOT_SEED);
  if (name === 'title') {
    game.phase = PHASE_TITLE;
    return { game, phase: PHASE_TITLE };
  }
  startDuel(game);
  if (name === 'play') {
    for (let round = 0; round < 3 && game.phase === PHASE_PLAY; round += 1) oneRound(game);
    if (game.phase === PHASE_PLAY) chaseCombo(game);
    return { game, phase: game.phase === PHASE_PLAY ? PHASE_PLAY : game.phase };
  }
  // Win and loss: play three real rounds so the board is full, then finish
  // the duel through the real damage path so the end screen is earned.
  for (let round = 0; round < 3 && game.phase === PHASE_PLAY; round += 1) oneRound(game);
  if (game.phase === PHASE_PLAY) finishDuel(game, name === 'win' ? 'warden' : 'player');
  return { game, phase: game.phase };
}

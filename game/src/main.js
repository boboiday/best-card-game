// Ember Court — boot and the one loop.
// The game moves between four screens: title, play, win and loss. Clicking a
// card plays it, End Turn (or Space) passes to the Warden, and the Warden's
// announced intent tells you what is coming next.
//
// ?seed=N fixes the shuffle. ?shot=title|play|win|loss stages that scene
// instead of running the loop, paints it twice and sets window.__shotReady
// for a screenshot.

import { PHASE_LOSS, PHASE_PLAY, PHASE_TITLE, PHASE_WIN, beginPlayerTurn, canPlay, createGame, playCard, startDuel } from './state.js';
import { takeWardenTurn } from './ai.js';
import { createRenderer } from './render.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const root = document.getElementById('table');
const status = document.getElementById('status');
const audio = createAudio();

function runShot(name) {
  const staged = stageShot(name);
  const renderer = createRenderer(root, { onPlayCard: () => {}, onEndTurn: () => {}, onBegin: () => {} });
  let painted = 0;
  function paint() {
    renderer.draw(staged.game);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const game = createGame(seed);
  let screen = PHASE_TITLE;

  function announce(message) {
    status.textContent = message;
  }

  const renderer = createRenderer(root, {
    onPlayCard(card) {
      if (screen !== PHASE_PLAY) return;
      if (!canPlay(game, card)) return;
      audio.unlock();
      const before = game.combo;
      if (playCard(game, game.player, game.warden, card)) {
        audio.playCard();
        if (game.combo && game.combo !== before) audio.combo();
        if (game.phase === PHASE_WIN) {
          screen = PHASE_WIN;
          audio.win();
          announce('You win. The court is yours.');
        } else if (game.phase === PHASE_LOSS) {
          screen = PHASE_LOSS;
          audio.loss();
        } else {
          announce(`Played ${card.name}. ${game.player.ember} ember left.`);
        }
      }
      renderer.draw(game);
    },
    onEndTurn() {
      if (screen !== PHASE_PLAY) return;
      audio.unlock();
      takeWardenTurn(game, game.random);
      if (game.phase === PHASE_PLAY) {
        beginPlayerTurn(game);
        announce(`Turn ${game.turn}. Your move.`);
      } else if (game.phase === PHASE_WIN) {
        screen = PHASE_WIN;
        audio.win();
      } else if (game.phase === PHASE_LOSS) {
        screen = PHASE_LOSS;
        audio.loss();
        announce('The Warden stands. You fall.');
      }
      renderer.draw(game);
    },
    onBegin() {
      audio.unlock();
      startDuel(game);
      screen = PHASE_PLAY;
      announce('The duel begins. Your move.');
      renderer.draw(game);
    },
  });

  const input = createInput({
    onBegin() {
      if (screen === PHASE_TITLE || screen === PHASE_WIN || screen === PHASE_LOSS) {
        renderer.draw(game);
        startDuel(game);
        screen = PHASE_PLAY;
        announce('The duel begins. Your move.');
        renderer.draw(game);
      }
    },
    onEndTurn() {
      if (screen === PHASE_PLAY) renderer.draw(game);
    },
    onPlaySlot(index) {
      if (screen !== PHASE_PLAY) return;
      const card = game.player.hand[index];
      if (card && canPlay(game, card)) {
        playCard(game, game.player, game.warden, card);
        renderer.draw(game);
      }
    },
    onConfirm() {
      if (screen === PHASE_TITLE || screen === PHASE_WIN || screen === PHASE_LOSS) {
        startDuel(game);
        screen = PHASE_PLAY;
        renderer.draw(game);
      } else if (screen === PHASE_PLAY) {
        takeWardenTurn(game, game.random);
        if (game.phase === PHASE_PLAY) beginPlayerTurn(game);
        else screen = game.phase;
        renderer.draw(game);
      }
    },
  });
  void input;

  renderer.draw(game);
  announce('Ember Court. Click to begin.');
}

if (shot) runShot(shot);
else runGame();

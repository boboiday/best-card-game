// Ember Court — mouse and keyboard input.
// Click a card to play it, click End Turn (or press Space) to pass, press
// 1–5 to play the card in that hand slot, Enter to begin or play again.

export const ACTION_BEGIN = 1;
export const ACTION_END_TURN = 2;

export function createInput(callbacks) {
  const actions = { queue: [] };

  function begin() {
    callbacks.onBegin();
  }

  function endTurn() {
    callbacks.onEndTurn();
  }

  function playSlot(index) {
    callbacks.onPlaySlot(index);
  }

  document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.key >= '1' && event.key <= '5') {
      playSlot(Number.parseInt(event.key, 10) - 1);
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      callbacks.onConfirm();
    } else if (event.key === 'Escape') {
      callbacks.onConfirm();
    }
  });

  return { begin, endTurn, playSlot, actions };
}

# Ember Court

[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![Rank](https://make.fun/badge/best-card-game-20261122-1826/boboiday/best-card-game/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![Reward](https://make.fun/badge/best-card-game-20261122-1826/boboiday/best-card-game/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

**Ember Court** is an original turn-based duel card battler for the browser.
You face **the Warden** across a green baize table: twenty life each, ember
that grows every turn, and a thirty-card deck of four suits — **Flame ▲**,
**Tide ≋**, **Leaf ❦** and **Stone ◆** — told apart by colour *and* shape.

## How it plays

- Each turn you gain ember (up to 10) and draw a card. Spend ember to play
  cards from your hand of five; a card costs 1–4 ember and deals its power
  in damage.
- **Suit cycle:** Flame beats Leaf, Leaf beats Stone, Stone beats Tide,
  Tide beats Flame. A card whose suit beats the Warden's last suit deals
  **+2 power** — the combo that turns a hand.
- **Keywords that combine:** Draw a card, Heal 3, Shield 4, Pierce a shield,
  Rally (+2 to your next card this turn). Cost against power against combo:
  every hand is a decision.
- **A readable opponent:** the Warden announces its intent each turn
  ("will strike hard", "gathers embers…", "raises its guard") and then acts
  on it — so you can counter it.
- Win by reducing the Warden to 0 life; lose if your own life reaches 0.
  Mouse and keyboard (keys 1–5 play a card, Space ends your turn).

## Feel

Cards slide and snap into place with CSS transitions, the dealt hand has
weight, the win screen lands with a confetti burst, and the loss screen is
dignified. Sound is synthesised in code with WebAudio — no audio files, no
network. The whole game is vanilla JavaScript and CSS under `game/`, split
into files with one clear job each.

## Run it

Open `game/index.html` in a desktop browser, or serve it locally:

```sh
node serve.ts   # http://localhost:8080
```

Screenshots are deterministic states of the real game (`?shot=title|play|win|loss`).

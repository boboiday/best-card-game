// Ember Court — the deck and every card in it.
// Thirty cards, built from fifteen named designs, two copies each. Every card
// is a real decision: ember cost against power, and a keyword that combines
// with the next card you play.

import { RULES, shuffle } from './config.js';

// One design: name, suit, ember cost, power, keyword (or null).
const DESIGNS = [
  { name: 'Ember Spark', suit: 'flame', cost: 1, power: 2, keyword: null },
  { name: 'Tide Lash', suit: 'tide', cost: 1, power: 2, keyword: 'draw' },
  { name: 'Thorn Vine', suit: 'leaf', cost: 1, power: 2, keyword: 'rally' },
  { name: 'Pebble Shot', suit: 'stone', cost: 1, power: 2, keyword: 'shield' },
  { name: 'Wildfire', suit: 'flame', cost: 2, power: 3, keyword: null },
  { name: 'Riptide', suit: 'tide', cost: 2, power: 3, keyword: 'pierce' },
  { name: 'Bloom Burst', suit: 'leaf', cost: 2, power: 3, keyword: 'heal' },
  { name: 'Granite Fist', suit: 'stone', cost: 2, power: 3, keyword: 'shield' },
  { name: 'Phoenix Cry', suit: 'flame', cost: 3, power: 4, keyword: 'draw' },
  { name: 'Deep Current', suit: 'tide', cost: 3, power: 4, keyword: 'heal' },
  { name: 'Root Snare', suit: 'leaf', cost: 3, power: 4, keyword: 'rally' },
  { name: 'Avalanche', suit: 'stone', cost: 3, power: 4, keyword: 'pierce' },
  { name: 'Sunflare', suit: 'flame', cost: 4, power: 6, keyword: 'pierce' },
  { name: 'Storm Surge', suit: 'tide', cost: 4, power: 5, keyword: 'draw' },
  { name: 'Old Oak', suit: 'leaf', cost: 4, power: 5, keyword: 'heal' },
];

// A single card instance in a deck, hand or discard pile.
export function makeCard(design, copy) {
  return {
    id: `${design.name}-${copy}`,
    name: design.name,
    suit: design.suit,
    cost: design.cost,
    power: design.power,
    keyword: design.keyword,
  };
}

// A fresh 30-card deck, shuffled with the game's seeded random.
export function buildDeck(random) {
  const deck = [];
  for (const design of DESIGNS) {
    deck.push(makeCard(design, 1));
    deck.push(makeCard(design, 2));
  }
  if (deck.length !== RULES.deckSize) throw new Error('deck must hold 30 cards');
  return shuffle(deck, random);
}

// Human-readable keyword line for a card face.
export function keywordText(card) {
  if (card.keyword === 'draw') return 'Draw a card';
  if (card.keyword === 'heal') return 'Heal 3 life';
  if (card.keyword === 'shield') return 'Shield 4';
  if (card.keyword === 'pierce') return 'Pierce shield';
  if (card.keyword === 'rally') return 'Next card +2';
  return '';
}

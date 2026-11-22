// Ember Court — every tuning number, colour and suit in one place.
// The table is a fixed 1280x720 logical area; the renderer scales it to the
// window, so no rule below depends on the screen size.

export const TABLE = { width: 1280, height: 720 };

export const RULES = {
  startLife: 20,
  startEmber: 1,
  maxEmber: 10,
  handSize: 5,
  deckSize: 30,
  drawPerTurn: 1,
  suitBonus: 2,
  healAmount: 3,
  shieldAmount: 4,
  rallyBonus: 2,
};

// Suits are told apart by colour AND shape, never by text alone.
// Flame beats Leaf, Leaf beats Stone, Stone beats Tide, Tide beats Flame.
export const SUITS = {
  flame: { name: 'Flame', colour: '#e2483d', dark: '#8f1f18', glyph: '▲', beats: 'leaf' },
  tide: { name: 'Tide', colour: '#2f7fe0', dark: '#174a8f', glyph: '≋', beats: 'flame' },
  leaf: { name: 'Leaf', colour: '#3da53d', dark: '#1e5c22', glyph: '❦', beats: 'stone' },
  stone: { name: 'Stone', colour: '#8a8f98', dark: '#4a4e55', glyph: '◆', beats: 'tide' },
};

export const KEYWORDS = {
  draw: 'Draw 1',
  heal: 'Heal 3',
  shield: 'Shield 4',
  pierce: 'Pierce',
  rally: 'Rally +2',
};

export const PALETTE = {
  felt: '#1d4a33',
  feltDark: '#143626',
  feltLight: '#276344',
  gold: '#e8b64c',
  goldDark: '#9a7420',
  panel: '#241a12',
  panelLight: '#3a2c1e',
  text: '#f5ead6',
  muted: '#c9b48f',
  warden: '#5b2a6e',
  danger: '#e2483d',
};

export const FONT = 'Georgia, "Times New Roman", serif';
export const UI_FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

// Seeded random (mulberry32) so every ?shot= frame is byte-for-byte repeatable.
export function createRandom(seed) {
  let value = seed >>> 0;
  return function next() {
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(deck, random) {
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  return deck;
}

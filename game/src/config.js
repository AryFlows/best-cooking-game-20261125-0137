// Frost Kitchen — every tuning number, dish, colour and layout rect in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to the window,
// so no rule below depends on the screen size.
export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** Length of one shift, in seconds. */
export const SHIFT_SECONDS = 120;

/** Strikes end the shift early (a wrong serve, or a burnt item served by mistake, is a strike). */
export const MAX_STRIKES = 3;

/** How long a patty takes on the grill, and how long after that before it burns. */
export const GRILL = { cookSeconds: 4, burnSeconds: 9, slots: 2 };

/** How long fries take in the fryer, and how long after that before they burn. */
export const FRYER = { cookSeconds: 5, burnSeconds: 10, slots: 1 };

/** Orders: how often a new one arrives, how many can wait, how patient a customer is. */
export const ORDERS = { spawnSeconds: 11, maxActive: 3, patienceSeconds: 50 };

/** Combo bonus coins per combo level on a correct serve. */
export const COMBO_BONUS = 2;

/** One ingredient: id, label, keyboard key, colour, and whether it must be cooked first. */
export const INGREDIENTS = [
  { id: 'bun', label: 'Bun', key: '1', colour: '#e8a85c', cooked: false },
  { id: 'patty', label: 'Patty', key: '2', colour: '#7a4a2b', cooked: true, station: 'grill' },
  { id: 'cheese', label: 'Cheese', key: '3', colour: '#ffc93c', cooked: false },
  { id: 'lettuce', label: 'Lettuce', key: '4', colour: '#58a447', cooked: false },
  { id: 'tomato', label: 'Tomato', key: '5', colour: '#e4572e', cooked: false },
  { id: 'fries', label: 'Fries', key: '6', colour: '#f2b705', cooked: true, station: 'fryer' },
];

/** One dish: the exact multiset of ingredients a plate must hold to serve it. */
export const DISHES = [
  { name: 'Frost Burger', items: ['bun', 'patty', 'cheese', 'lettuce'], reward: 22, colour: '#e8a85c' },
  { name: 'Tomato Melt', items: ['bun', 'patty', 'tomato', 'cheese'], reward: 20, colour: '#e4572e' },
  { name: 'Garden Frost', items: ['bun', 'lettuce', 'tomato', 'cheese'], reward: 16, colour: '#58a447' },
  { name: 'Cheese Fries', items: ['fries', 'cheese'], reward: 14, colour: '#f2b705' },
  { name: 'Double Frost', items: ['bun', 'patty', 'patty', 'cheese', 'lettuce'], reward: 30, colour: '#7a4a2b' },
];

export const PALETTE = {
  wall: '#fff3d6',
  floor: '#f7d9a8',
  counterTop: '#c98a4b',
  counterFront: '#a96a35',
  panel: '#ffffff',
  panelEdge: '#e0c69a',
  ink: '#17324a',
  muted: '#6b7d8f',
  frost: '#4fb3e8',
  frostDeep: '#1f7fb8',
  gold: '#f2b705',
  red: '#e4572e',
  green: '#58a447',
  danger: '#d7263d',
  plate: '#fdfdfd',
  grill: '#3a3f4a',
  grillHot: '#e4572e',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best shift total is kept between visits (this browser only). */
export const BEST_KEY = 'frost-kitchen.best';

/** Layout rects, in logical pixels. The renderer and the input layer share these. */
export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 64 },
  orders: { x: 24, y: 80, w: 1232, h: 128, gap: 16, ticketW: 400 },
  grill: { x: 24, y: 232, w: 380, h: 190 },
  plate: { x: 452, y: 232, w: 376, h: 190 },
  fryer: { x: 876, y: 232, w: 380, h: 190 },
  counter: { x: 24, y: 446, w: 1232, h: 150 },
  serve: { x: 452, y: 612, w: 376, h: 64 },
  clear: { x: 876, y: 612, w: 380, h: 64 },
};

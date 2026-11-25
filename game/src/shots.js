// The screenshot scenes behind ?shot=start|play|end. Each one plays the real rules
// forward from a fresh world for a fixed number of steps, steered by a simple autopilot
// (cook what the first order needs, take it off the heat when ready, build the plate in
// order, serve the moment it matches), so the frame is what a short game really looks
// like and the same seed always gives the same frame.
import { DISHES, FRYER, GRILL, STEP } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const START_SECONDS = 6;
const PLAY_SECONDS = 30;
const END_SHIFT_SECONDS = 40;
const SAMPLE = STEP;

/** The next action the autopilot wants, given the world as it stands right now. */
function autopilot(state) {
  const order = state.orders[0];
  // Take anything ready off the heat first — burnt food helps nobody.
  for (let i = 0; i < state.grill.length; i += 1) {
    const slot = state.grill[i];
    if (slot && !slot.burnt && slot.t >= GRILL.cookSeconds) return { type: 'takeGrill', slot: i };
    if (slot && slot.burnt) return { type: 'takeGrill', slot: i };
  }
  for (let i = 0; i < state.fryer.length; i += 1) {
    const slot = state.fryer[i];
    if (slot && !slot.burnt && slot.t >= FRYER.cookSeconds) return { type: 'takeFryer', slot: i };
    if (slot && slot.burnt) return { type: 'takeFryer', slot: i };
  }
  if (!order) return null;
  const dish = DISHES[order.dishIndex];
  const needed = dish.items.slice();
  for (const item of state.plate) {
    const at = needed.indexOf(item);
    if (at === -1) return { type: 'clear' };
    needed.splice(at, 1);
  }
  if (needed.length === 0) return { type: 'serve', order: 0 };
  const next = needed[0];
  if (next === 'patty') {
    if (state.grill.some((slot) => slot === null)) return { type: 'grill' };
    return null;
  }
  if (next === 'fries') {
    if (state.fryer.some((slot) => slot === null)) return { type: 'fry' };
    return null;
  }
  return { type: 'add', id: next };
}

/**
 * Set `world` to the named scene (start, play or end; any other name is start) and return
 * the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'end') {
    for (let t = 0; t < START_SECONDS; t += SAMPLE) {
      const action = autopilot(world.state);
      world.step(SAMPLE, action ? [action] : [], false);
    }
    return { screen: SCREEN_TITLE, best: 0 };
  }
  if (name === 'end') world.state.timeLeft = END_SHIFT_SECONDS;
  const limit = name === 'end' ? END_SHIFT_SECONDS + 5 : PLAY_SECONDS;
  for (let t = 0; t < limit; t += SAMPLE) {
    const action = autopilot(world.state);
    const events = world.step(SAMPLE, action ? [action] : [], false);
    if (world.state.over) break;
    // Play scene: stop the moment a dish is mid-assembly with an order waiting and
    // something on the heat (or two layers already stacked), so the frame shows the
    // board, the plate and the cooking all at once.
    const cooking = world.state.grill.some((slot) => slot !== null)
      || world.state.fryer.some((slot) => slot !== null);
    if (name === 'play' && t > 12 && world.state.orders.length > 0
      && world.state.plate.length > 0 && (cooking || world.state.plate.length >= 2)) break;
    void events;
  }
  const over = world.state.over;
  return { screen: over ? SCREEN_OVER : SCREEN_PLAY, best: world.state.coins };
}

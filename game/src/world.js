// Frost Kitchen world: orders arrive on the board, ingredients are cooked on the grill
// and in the fryer, stacked on the plate, and served to the matching order before the
// customer's patience runs out. One shift lasts SHIFT_SECONDS; three strikes end it early.
import {
  COMBO_BONUS, DISHES, FRYER, GRILL, MAX_STRIKES, ORDERS, SHIFT_SECONDS, STEP,
} from './config.js';

export const EVENT_SERVED = 1;
export const EVENT_WRONG = 2;
export const EVENT_EXPIRED = 4;
export const EVENT_BURNT = 8;
export const EVENT_COOKED = 16;
export const EVENT_ORDER = 32;
export const EVENT_OVER = 64;

/** True when two ingredient lists hold the same items, order aside. */
function samePlate(plate, items) {
  if (plate.length !== items.length) return false;
  const rest = items.slice();
  for (const item of plate) {
    const at = rest.indexOf(item);
    if (at === -1) return false;
    rest.splice(at, 1);
  }
  return true;
}

export function createWorld(random) {
  const state = freshState();

  function freshState() {
    return {
      timeLeft: SHIFT_SECONDS,
      coins: 0,
      served: 0,
      strikes: 0,
      combo: 0,
      bestCombo: 0,
      orders: [],
      grill: Array.from({ length: GRILL.slots }, () => null),
      fryer: Array.from({ length: FRYER.slots }, () => null),
      plate: [],
      spawnTimer: 2,
      nextOrderId: 1,
      over: false,
      overReason: '',
      flash: '',
      flashTimer: 0,
    };
  }

  function reset() {
    Object.assign(state, freshState());
  }

  function spawnOrder() {
    const dishIndex = Math.floor(random() * DISHES.length);
    state.orders.push({
      id: state.nextOrderId,
      dishIndex,
      patience: ORDERS.patienceSeconds,
      maxPatience: ORDERS.patienceSeconds,
    });
    state.nextOrderId += 1;
    return EVENT_ORDER;
  }

  function cookStation(slots, dt, cookSeconds, burnSeconds) {
    let events = 0;
    for (let i = 0; i < slots.length; i += 1) {
      const slot = slots[i];
      if (!slot) continue;
      const wasReady = slot.t >= cookSeconds;
      slot.t += dt;
      if (!wasReady && slot.t >= cookSeconds) events |= EVENT_COOKED;
      if (slot.t >= burnSeconds) slot.burnt = true;
    }
    return events;
  }

  function serve(orderIndex) {
    const order = state.orders[orderIndex];
    if (!order || state.plate.length === 0) return 0;
    const dish = DISHES[order.dishIndex];
    if (samePlate(state.plate, dish.items)) {
      const tip = Math.round((order.patience / order.maxPatience) * 10);
      const bonus = state.combo * COMBO_BONUS;
      state.coins += dish.reward + tip + bonus;
      state.served += 1;
      state.combo += 1;
      if (state.combo > state.bestCombo) state.bestCombo = state.combo;
      state.orders.splice(orderIndex, 1);
      state.plate = [];
      state.flash = `+${dish.reward + tip + bonus} coins — ${dish.name} served!`;
      state.flashTimer = 2;
      return EVENT_SERVED;
    }
    state.strikes += 1;
    state.combo = 0;
    state.plate = [];
    state.flash = 'Wrong plate! That is not what they ordered.';
    state.flashTimer = 2;
    if (state.strikes >= MAX_STRIKES) {
      state.over = true;
      state.overReason = 'Three wrong serves — the lunch rush walked out.';
      return EVENT_WRONG | EVENT_OVER;
    }
    return EVENT_WRONG;
  }

  function applyAction(action) {
    if (!action || state.over) return 0;
    switch (action.type) {
      case 'add': {
        if (['patty', 'fries'].includes(action.id)) return 0;
        state.plate.push(action.id);
        return 0;
      }
      case 'grill': {
        const free = state.grill.findIndex((slot) => slot === null);
        if (free === -1) return 0;
        state.grill[free] = { t: 0, burnt: false };
        return 0;
      }
      case 'fry': {
        const free = state.fryer.findIndex((slot) => slot === null);
        if (free === -1) return 0;
        state.fryer[free] = { t: 0, burnt: false };
        return 0;
      }
      case 'takeGrill': {
        const slot = state.grill[action.slot];
        if (!slot) return 0;
        if (slot.burnt) {
          state.grill[action.slot] = null;
          state.flash = 'Burnt patty tossed out.';
          state.flashTimer = 1.5;
          return EVENT_BURNT;
        }
        if (slot.t < GRILL.cookSeconds) return 0;
        state.grill[action.slot] = null;
        state.plate.push('patty');
        return 0;
      }
      case 'takeFryer': {
        const slot = state.fryer[action.slot];
        if (!slot) return 0;
        if (slot.burnt) {
          state.fryer[action.slot] = null;
          state.flash = 'Burnt fries tossed out.';
          state.flashTimer = 1.5;
          return EVENT_BURNT;
        }
        if (slot.t < FRYER.cookSeconds) return 0;
        state.fryer[action.slot] = null;
        state.plate.push('fries');
        return 0;
      }
      case 'serve':
        return serve(action.order);
      case 'serveSmart': {
        // The SERVE button only serves when the plate already matches an order,
        // so a stray click never costs a strike; serving to a ticket can still miss.
        const match = state.orders.findIndex((order) => samePlate(state.plate, DISHES[order.dishIndex].items));
        if (match === -1) {
          if (state.plate.length > 0) {
            state.flash = 'This plate matches no order yet — keep building!';
            state.flashTimer = 1.5;
          }
          return 0;
        }
        return serve(match);
      }
      case 'clear':
        state.plate = [];
        return 0;
      default:
        return 0;
    }
  }

  /** Advance the world one fixed step. `actions` is a list of player actions this step. */
  function step(dt, actions, attract) {
    let events = 0;
    for (const action of actions) events |= applyAction(action);
    if (state.over) return events | EVENT_OVER;
    events |= cookStation(state.grill, dt, GRILL.cookSeconds, GRILL.burnSeconds);
    events |= cookStation(state.fryer, dt, FRYER.cookSeconds, FRYER.burnSeconds);
    if (state.flashTimer > 0) state.flashTimer -= dt;
    if (attract) return events;
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.over = true;
      state.overReason = 'Shift over — the dinner bell rang.';
      return events | EVENT_OVER;
    }
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      if (state.orders.length < ORDERS.maxActive) events |= spawnOrder();
      state.spawnTimer = ORDERS.spawnSeconds * (0.9 + random() * 0.2);
    }
    for (let i = state.orders.length - 1; i >= 0; i -= 1) {
      const order = state.orders[i];
      order.patience -= dt;
      if (order.patience <= 0) {
        state.orders.splice(i, 1);
        state.combo = 0;
        state.flash = 'A customer walked out — too slow!';
        state.flashTimer = 2;
        events |= EVENT_EXPIRED;
      }
    }
    return events;
  }

  return { state, reset, step };
}

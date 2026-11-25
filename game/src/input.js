// Keyboard and pointer input for Frost Kitchen. Clicks are turned into world actions
// through the renderer's hit-testing; one-shot presses (start, pause, serve, clear) are
// queued as actions and taken once by the loop, so a press between two frames is never
// lost and never counted twice. Ingredient keys 1–6 add or start cooking that item.
import { FIELD, INGREDIENTS } from './config.js';

export const ACTION_CONFIRM = 'confirm';
export const ACTION_PAUSE = 'pause';

const KEY_TO_INGREDIENT = Object.fromEntries(INGREDIENTS.map((item) => [item.key, item.id]));

export function createInput(canvas, onAction) {
  let actions = [];
  let confirm = false;
  let pause = false;

  function logicalPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const scale = FIELD.width / rect.width;
    return {
      x: (event.clientX - rect.left) * scale,
      y: (event.clientY - rect.top) * scale,
    };
  }

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.code === 'Space' || event.code === 'Enter') {
      confirm = true;
      event.preventDefault();
    } else if (event.code === 'KeyP' || event.code === 'Escape') {
      pause = true;
      event.preventDefault();
    } else if (event.code === 'KeyS') {
      actions.push({ type: 'serveSmart' });
    } else if (event.code === 'KeyC') {
      actions.push({ type: 'clear' });
    } else if (KEY_TO_INGREDIENT[event.key]) {
      const id = KEY_TO_INGREDIENT[event.key];
      if (id === 'patty') actions.push({ type: 'grill' });
      else if (id === 'fries') actions.push({ type: 'fry' });
      else actions.push({ type: 'add', id });
    } else {
      return;
    }
    event.preventDefault();
  });

  canvas.addEventListener('pointerdown', (event) => {
    const point = logicalPoint(event);
    const action = onAction(point.x, point.y);
    if (action) actions.push(action);
    else confirm = true;
  });

  return {
    /** The queued world actions since the last call. */
    takeActions() {
      const taken = actions;
      actions = [];
      return taken;
    },
    /** True once when the player pressed Space/Enter or clicked empty space. */
    takeConfirm() {
      const taken = confirm;
      confirm = false;
      return taken;
    },
    /** True once when the player pressed P or Escape. */
    takePause() {
      const taken = pause;
      pause = false;
      return taken;
    },
  };
}

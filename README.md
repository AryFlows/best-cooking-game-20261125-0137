[![competition](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/AryFlows/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/AryFlows/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# Frost Kitchen — a 120-second lunch rush

A complete, playable cooking game: orders arrive on the board, each listing the dish to build. Click ingredients on the counter — patties go to the grill (4s, burn after 9s), fries to the fryer (5s, burn after 10s) — stack them on the plate, and click an order ticket to serve before the customer's patience runs out. Serve fast for a tip, chain serves for a combo bonus, and mind the strikes: 3 wrong serves end the shift early.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — no build step, no network, plain static files under `game/`.

## How to play

- **Orders** arrive on the board (up to 3 at once), each with a patience bar and a coin reward.
- **Counter** (keys 1–6 or click): Bun, Patty, Cheese, Lettuce, Tomato, Fries. Patty and Fries must be cooked first.
- **Grill / Fryer**: click a Patty to start grilling, click a ready item to move it to the plate. Burnt items must be tossed.
- **Plate**: the dish is built layer by layer, in any order — the plate must hold exactly the dish's ingredients.
- **Serve**: click an order ticket, or press S to serve the first matching order. A wrong serve is a strike.
- **Pause**: P or Esc. **Restart**: Space.

---

<sub>Entered on [make.fun](https://make.fun/?ref=m2fjazt9&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>

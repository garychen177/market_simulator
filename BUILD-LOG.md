# Build log

## Decisions (where the spec was silent)
- Pixel art: sprites are pixel grids defined in code and rendered as crisp SVG (no image files).
- Policy replay reuses the pest losses recorded in the first run, so the comparison isolates the policy. The mini-game is not replayed.
- Profit bar scales coins from -20 to 100 (config.ui).

## Milestones 1-3 done: scaffold, engine, balance script
- Pinned exact versions, Vitest added, template demo removed.
- Engine in src/engine (pure), config in src/config.ts, 20 tests pass.
- Balance (npm run simulate): contract 16 / A 12.5 / Mae Tha 15.17 (14.5-16.5) / B 12.17 / C 10.0. All section 9 rules hold with the starting numbers unchanged.

Next: pixel sprites, screens, mini-game, animations.

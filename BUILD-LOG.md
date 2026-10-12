# Build log

## Decisions (where the spec was silent or conflicted)
- **Pixel art:** the spec forbids image files, so sprites are pixel grids written in code (`src/ui/sprites.ts`) and rendered as crisp SVG. Animations are CSS only.
- **Policy replay** reuses the pest losses recorded in the first run, so the comparison isolates the policy. The mini-game is not replayed; the replay shows the same crops and the same flood/COVID order (same seed).
- **Play the other farmer** keeps the same seed, so both farmers face the same shock order.
- **Profit bar** scales coins from -20 to 100 (`CONFIG.ui`).
- **Households fed** is shown out of 8 (cityNeedPerSeason), capped at 8 even if more food reached the city.
- **Skip animation** sets the time scale to 0 for the current step (jumps to the final frame). **Reduced motion** (also follows the OS setting) scales animation times to 0.3 and pauses looping animations.
- Mini-game seed per season = run seed * 31 + season index. First season shows a 3-second how-to overlay.
- Spec section 9 note: Mae Tha without policy averages 15.17 over the six shock orders (range 14.5-16.5); policy B is 12.17 (11.5-13.5); policy C is 10.0.

## Milestones
1. Scaffold: done (Vite + React + TS + Vitest, exact pinned versions).
2. Engine + tests: done (20 tests).
3. Balance script: done, numbers unchanged from the spec.

   | Run | Total shortfall (mean, range) | Coins | Debt |
   |---|---|---|---|
   | Contract, no policy | 16.00 (16-16) | 18 | 5 |
   | Contract + A | 12.50 | 18 | 5 |
   | Mae Tha, no policy | 15.17 (14.5-16.5) | 46 | 0 |
   | Mae Tha + B | 12.17 (11.5-13.5) | 42 | 0 |
   | Mae Tha + C | 10.00 | 46 | 0 |
4. Screens: done (title, context, choose, season steps, end, policy picker, comparison, debrief with .txt download).
5. Pest mini-game: done (spray + hand modes, seeded, pointer events).
6. Animations: done (truck, flood, selling along channels, reserve storehouse, city crisis scene, Skip, reduced motion).
7. Polish: mobile layout checked at 360px.
8. Final check: both farmers played through 5 seasons, plus a policy replay, comparison and debrief, with no console errors (automated browser run).

## Not done / next
- A human playtest for timing (target about 5 minutes) and for mini-game feel on a real touch device.
- Oxlint still reports a few React fast-refresh/hook-dependency warnings (no errors).

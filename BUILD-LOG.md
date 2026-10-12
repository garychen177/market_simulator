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

## Round 2 changes (playtest feedback)
- Scenes now scale to the window height so the buttons are always visible (the "Choose your farmer" button was below the fold on laptops).
- "Households fed" removed from the status bar; a side **Season tracker** shows coins, profit, owed/reserve and households fed for every season (below the game on phones).
- Pest mini-game: pests drawn smaller (the tap target stays 48px for touch), faster and more frequent (spray 0.9s/150px/s, hand 0.55s/200px/s). Duration is 15 seconds (CONFIG.minigame.durationSec); the first season adds a 3-second how-to overlay.
- Flood scene: it rains, the water rises, and the water sweeps the crops and produce away. Also fixed water height not applying in the other rain scenes.

## Round 3 changes
- Context screen: "Choose your farmer" only appears after the second card has been viewed.
- "Skip mini-game" button. Skipping loses no crops (CONFIG.minigame.skipLossUnits = 0); it is not a player setting.
- Settings page (title/context screens, top bar): plain-language steppers for prices, costs, harvests, buyer caps, supermarket weight, city need, policy B price, policy C reserve bonus, mini-game length and skip loss. Saved in the browser (localStorage), applied to the live CONFIG, "Reset to defaults" restores the spec numbers. Changes apply to the next game. The balance script and tests always use the defaults.

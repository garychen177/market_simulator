# Two Farmers, One City

A short pixel-art simulation of the Chiang Mai food system (NUS UTC2720/UTS2720, Project 2). Live one farmer's life for 5 seasons (contract farmer or Mae Tha member), then see what it means for the whole city and replay the seasons with a policy switched on.

## Run it
```
npm install
npm run dev        # play at http://localhost:5173
npm test           # engine + mini-game tests
npm run simulate   # balance table (spec section 9)
npm run build      # type-check + production build into dist/
```

## Structure
- `src/config.ts`: every number in the game
- `src/engine/`: pure game logic (no React): seasons, shocks, policies, mini-game, seeded PRNG
- `src/content/`: fact cards, debrief questions, end-screen story
- `src/ui/`: screens, pest mini-game, code-drawn pixel sprites (`sprites.ts`) and animated scenes (`scenes.tsx`)
- `BUILD-LOG.md`: decisions and balance results

Deploys as a static site (for example on Vercel: framework Vite, build `npm run build`, output `dist`).

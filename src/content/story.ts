import type { Path } from '../config.ts';
import type { RunSummary } from '../engine/run.ts';

/** Two-line story generated from the results. */
export function storyFor(path: Path, run: RunSummary): [string, string] {
  const name = path === 'contract' ? 'Somchai' : 'Malee';
  const covid = run.results.find((r) => r.shock === 'covid');
  const flood = run.results.find((r) => r.shock === 'flood');
  const total = Math.round(run.totalShortfall * 10) / 10;

  if (path === 'contract') {
    const line1 = covid && covid.rottedUnits > 0
      ? `${name} kept earning when the market closed, but ${covid.fed === 0 ? 'none' : 'little'} of his harvest reached the city.`
      : `${name} kept farming through the shocks and kept his harvest moving.`;
    const debt = run.finalState.debt;
    const line2 = debt > 0
      ? `He still owes ${debt} units of produce, and the city missed ${total} units of food.`
      : `His debt is repaid, but the city still missed ${total} units of food.`;
    return [line1, line2];
  }
  const line1 = flood
    ? `${name} lost a harvest to the flood, but Mae Tha's reserve fed ${flood.reserveReleased} units to the city.`
    : `${name} grew slowly and kept food in reserve for hard times.`;
  const line2 = `Organic food was pricey in normal seasons, and the city still missed ${total} units of food.`;
  return [line1, line2];
}

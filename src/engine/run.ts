import { CONFIG, type Path, type Policy, type Shock } from '../config.ts';
import { START_STATE, playSeason, type FarmState, type SeasonResult } from './season.ts';
import { shockOrder } from './shocks.ts';

export interface RunSummary {
  results: SeasonResult[];
  totalShortfall: number;
  finalState: FarmState;
}

/** Play as many seasons as there are pest losses given. Pure: same inputs, same outputs. */
export function simulateRun(
  path: Path,
  shocks: Shock[],
  pestLosses: number[],
  policy: Policy | null,
): RunSummary {
  const results: SeasonResult[] = [];
  let state = START_STATE;
  for (let i = 0; i < Math.min(pestLosses.length, CONFIG.seasons); i++) {
    const r = playSeason(path, state, i + 1, shocks[i], pestLosses[i], policy);
    results.push(r);
    state = r.after;
  }
  return {
    results,
    totalShortfall: results.reduce((s, r) => s + r.shortfall, 0),
    finalState: state,
  };
}

export function runFromSeed(path: Path, seed: number, pestLosses: number[], policy: Policy | null): RunSummary {
  return simulateRun(path, shockOrder(seed), pestLosses, policy);
}

/** Which path each policy helps. */
export const POLICY_TARGET: Record<Policy, Path> = { A: 'contract', B: 'maeTha', C: 'maeTha' };

// Balance check helpers shared by scripts/simulate.ts and the tests.
import type { Path, Policy, Shock } from '../config.ts';
import { simulateRun } from './run.ts';

export const ORDERS: Shock[][] = [
  ['flood', 'covid', 'normal'],
  ['flood', 'normal', 'covid'],
  ['covid', 'flood', 'normal'],
  ['covid', 'normal', 'flood'],
  ['normal', 'flood', 'covid'],
  ['normal', 'covid', 'flood'],
].map((tail) => ['normal', 'normal', ...tail] as Shock[]);

const FIXED_PEST_LOSS = 1;

export interface Row {
  label: string;
  path: Path;
  policy: Policy | null;
  total: number; // mean total shortfall over all orders
  min: number;
  max: number;
  normalShortfall: number; // mean shortfall per normal season (seasons 3-5 normals included)
  crisisShortfall: number; // mean shortfall per crisis season
  covidShortfall: number;
  coins: number;
  debt: number;
}

export function evaluate(path: Path, policy: Policy | null, label: string): Row {
  const totals: number[] = [];
  let coins = 0, debt = 0, normalSum = 0, normalN = 0, crisisSum = 0, crisisN = 0, covidSum = 0, covidN = 0;
  for (const order of ORDERS) {
    const run = simulateRun(path, order, Array(5).fill(FIXED_PEST_LOSS), policy);
    totals.push(run.totalShortfall);
    coins += run.finalState.coins;
    debt += run.finalState.debt;
    for (const r of run.results) {
      if (r.shock === 'normal') { normalSum += r.shortfall; normalN++; } else { crisisSum += r.shortfall; crisisN++; }
      if (r.shock === 'covid') { covidSum += r.shortfall; covidN++; }
    }
  }
  const n = ORDERS.length;
  return {
    label, path, policy,
    total: totals.reduce((a, b) => a + b, 0) / n,
    min: Math.min(...totals),
    max: Math.max(...totals),
    normalShortfall: normalSum / normalN,
    crisisShortfall: crisisSum / crisisN,
    covidShortfall: covidSum / covidN,
    coins: coins / n,
    debt: debt / n,
  };
}

export function allRows(): Row[] {
  return [
    evaluate('contract', null, 'Contract, no policy'),
    evaluate('contract', 'A', 'Contract + policy A'),
    evaluate('maeTha', null, 'Mae Tha, no policy'),
    evaluate('maeTha', 'B', 'Mae Tha + policy B'),
    evaluate('maeTha', 'C', 'Mae Tha + policy C'),
  ];
}

export function checkRules(rows: Row[]): string[] {
  const byLabel = Object.fromEntries(rows.map((r) => [r.label, r]));
  const c = byLabel['Contract, no policy'], cA = byLabel['Contract + policy A'];
  const m = byLabel['Mae Tha, no policy'], mB = byLabel['Mae Tha + policy B'], mC = byLabel['Mae Tha + policy C'];
  const failures: string[] = [];
  if (c.min <= 0) failures.push('Contract has zero shortfall without a policy');
  if (m.min <= 0) failures.push('Mae Tha has zero shortfall without a policy');
  if (!(cA.total < c.total)) failures.push('Policy A does not lower contract shortfall');
  if (!(mB.total < m.total)) failures.push('Policy B does not lower Mae Tha shortfall');
  if (!(mC.total < m.total)) failures.push('Policy C does not lower Mae Tha shortfall');
  if (!(c.normalShortfall < m.normalShortfall)) failures.push('Contract is not better than Mae Tha in normal seasons');
  if (!(c.crisisShortfall > m.crisisShortfall)) failures.push('Contract is not worse than Mae Tha in crises');
  if (!(m.coins > c.coins)) failures.push('Mae Tha coins are not above contract coins');
  return failures;
}


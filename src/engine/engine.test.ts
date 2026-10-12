import { describe, expect, it } from 'vitest';
import { CONFIG, type Shock } from '../config.ts';
import { simulateRun } from './run.ts';
import { START_STATE, playSeason } from './season.ts';
import { shockOrder } from './shocks.ts';
import { initMini, runBot, spawnSchedule, stepMini, unitsLost, destroyedPlants } from './minigame.ts';
import { allRows, checkRules } from './balance.ts';

describe('contract farmer', () => {
  it('repays the produce debt first, then is paid for the rest', () => {
    const r = playSeason('contract', START_STATE, 1, 'normal', 0, null);
    expect(r.debtRepaid).toBe(7);
    expect(r.after.debt).toBe(0);
    expect(r.after.coins).toBe(3 * 3);
  });

  it('carries the debt over after a flood', () => {
    const flood = playSeason('contract', START_STATE, 3, 'flood', 0, null);
    expect(flood.harvest).toBe(0);
    expect(flood.after.debt).toBe(7);
    const next = playSeason('contract', flood.after, 4, 'normal', 0, null);
    expect(next.advance + flood.after.debt).toBe(14);
    expect(next.after.debt).toBe(4);
  });

  it('feeds the city 0 in COVID without policy A, and more with it', () => {
    const none = playSeason('contract', START_STATE, 3, 'covid', 1, null);
    const withA = playSeason('contract', START_STATE, 3, 'covid', 1, 'A');
    expect(none.fed).toBe(0);
    expect(none.rottedUnits).toBe(9);
    expect(withA.fed).toBeGreaterThan(0);
    expect(withA.fed).toBe(2 + 3 * CONFIG.supermarketFeedsFactor);
  });

  it('caps pest loss at maxPestLossUnits', () => {
    expect(playSeason('contract', START_STATE, 1, 'normal', 99, null).pestLoss).toBe(CONFIG.contract.maxPestLossUnits);
  });
});

describe('Mae Tha member', () => {
  it('has a smaller harvest in season 1 (soil recovery)', () => {
    const r = playSeason('maeTha', START_STATE, 1, 'normal', 0, null);
    expect(r.soilRecovery).toBe(true);
    expect(r.harvest).toBe(CONFIG.maeTha.soilRecoveryHarvest);
    expect(playSeason('maeTha', START_STATE, 2, 'normal', 0, null).harvest).toBe(10);
  });

  it('sells in order hospital, fresh market, supermarket, up to each cap', () => {
    const r = playSeason('maeTha', START_STATE, 2, 'normal', 0, null);
    // harvest 10, reserve 2, 8 to sell: hospital 2, fresh 4, supermarket 2
    expect(r.sold).toEqual({ hospital: 2, freshMarket: 4, supermarket: 2 });
    const small = playSeason('maeTha', START_STATE, 1, 'normal', 0, null);
    // harvest 4, reserve 2, 2 to sell: all to the hospital
    expect(small.sold).toEqual({ hospital: 2, freshMarket: 0, supermarket: 0 });
  });

  it('wastes units no channel will buy', () => {
    const r = playSeason('maeTha', START_STATE, 3, 'covid', 0, null);
    // harvest 10, reserve 2, 8 to sell: hospital 2, supermarket 3, 3 wasted
    expect(r.wasted).toBe(3);
  });

  it('releases the reserve only in a crisis and never below zero', () => {
    const normal = playSeason('maeTha', { ...START_STATE, reserve: 6 }, 2, 'normal', 1, null);
    expect(normal.reserveReleased).toBe(0);
    const flood = playSeason('maeTha', { ...START_STATE, reserve: 3 }, 3, 'flood', 0, null);
    expect(flood.reserveReleased).toBe(3);
    expect(flood.after.reserve).toBe(0);
    expect(flood.shortfall).toBe(5);
    const big = playSeason('maeTha', { ...START_STATE, reserve: 50 }, 3, 'flood', 0, null);
    expect(big.reserveReleased).toBe(CONFIG.cityNeedPerSeason);
    expect(big.after.reserve).toBe(42);
  });
});

describe('shocks', () => {
  it('keeps seasons 1-2 normal and 3-5 with exactly one flood and one COVID', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const o = shockOrder(seed);
      expect(o).toHaveLength(5);
      expect(o.slice(0, 2)).toEqual(['normal', 'normal']);
      const tail = o.slice(2);
      expect(tail.filter((s) => s === 'flood')).toHaveLength(1);
      expect(tail.filter((s) => s === 'covid')).toHaveLength(1);
      expect(tail.filter((s) => s === 'normal')).toHaveLength(1);
    }
  });

  it('is deterministic for a seed and varies across seeds', () => {
    expect(shockOrder(42)).toEqual(shockOrder(42));
    const seen = new Set<string>();
    for (let seed = 1; seed <= 100; seed++) seen.add(shockOrder(seed).join());
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe('policies', () => {
  const order: Shock[] = ['normal', 'normal', 'flood', 'covid', 'normal'];
  const losses = [1, 1, 1, 1, 1];

  it('A changes only contract farmer food reaching the city', () => {
    const base = simulateRun('contract', order, losses, null);
    const a = simulateRun('contract', order, losses, 'A');
    expect(a.finalState.coins).toBe(base.finalState.coins);
    expect(a.finalState.debt).toBe(base.finalState.debt);
    expect(a.totalShortfall).toBeLessThan(base.totalShortfall);
    // Mae Tha is untouched by policy A
    expect(simulateRun('maeTha', order, losses, 'A')).toEqual(simulateRun('maeTha', order, losses, null));
  });

  it('B and C leave the contract farmer alone', () => {
    const base = simulateRun('contract', order, losses, null);
    expect(simulateRun('contract', order, losses, 'B')).toEqual(base);
    expect(simulateRun('contract', order, losses, 'C')).toEqual(base);
  });

  it('B changes cost, price, fresh market cap and soil harvest; C only adds to the reserve', () => {
    const base = simulateRun('maeTha', order, losses, null);
    const b = simulateRun('maeTha', order, losses, 'B');
    expect(b.results[0].harvest).toBe(CONFIG.policies.B.soilRecoveryHarvest - 1);
    expect(b.results[1].costs).toBe(CONFIG.maeTha.inputCost);
    const c = simulateRun('maeTha', order, losses, 'C');
    expect(c.finalState.coins).toBe(base.finalState.coins);
    expect(c.results.map((r) => r.harvest)).toEqual(base.results.map((r) => r.harvest));
    expect(c.totalShortfall).toBeLessThan(base.totalShortfall);
  });
});

describe('pest mini-game', () => {
  it('produces the same spawn schedule for the same seed', () => {
    expect(spawnSchedule(7, 'spray')).toEqual(spawnSchedule(7, 'spray'));
    expect(spawnSchedule(7, 'hand')).toEqual(spawnSchedule(7, 'hand'));
    expect(spawnSchedule(7, 'hand')).not.toEqual(spawnSchedule(8, 'hand'));
  });

  it('has more, faster pests in hand mode', () => {
    expect(spawnSchedule(1, 'hand').length).toBeGreaterThan(spawnSchedule(1, 'spray').length);
  });

  it('is deterministic when stepped identically', () => {
    const a = runBot(5, 'hand', false);
    const b = runBot(5, 'hand', false);
    expect(a).toEqual(b);
  });

  it('destroys plants when nothing is done, and none when every pest is killed', () => {
    expect(destroyedPlants(runBot(3, 'spray', false))).toBeGreaterThan(0);
    expect(destroyedPlants(runBot(3, 'hand', true))).toBe(0);
  });

  it('respects the loss caps', () => {
    expect(unitsLost('contract', 5)).toBe(CONFIG.contract.maxPestLossUnits);
    expect(unitsLost('maeTha', 5)).toBe(CONFIG.maeTha.maxPestLossUnits);
    expect(unitsLost('maeTha', 1)).toBe(CONFIG.minigame.unitsPerPlant);
    expect(unitsLost('maeTha', 0)).toBe(0);
  });

  it('a pest that reaches its plant destroys it', () => {
    let s = initMini();
    const schedule = [{ t: 0.1, pick: 0, drift: 0 }];
    for (let i = 0; i < 100; i++) s = stepMini(s, 0.05, 'hand', schedule);
    expect(destroyedPlants(s)).toBe(1);
  });
});

describe('balance rules (section 9)', () => {
  it('holds with the starting numbers', () => {
    const rows = allRows();
    expect(checkRules(rows)).toEqual([]);
    const get = (l: string) => rows.find((r) => r.label === l)!;
    expect(get('Contract, no policy').total).toBe(16);
    expect(get('Contract + policy A').total).toBe(12.5);
  });
});

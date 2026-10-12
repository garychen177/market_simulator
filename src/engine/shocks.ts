import { CONFIG, type Shock } from '../config.ts';
import { makeRng, shuffle, subSeed } from './rng.ts';

/** Seasons 1-2 are normal. Seasons 3-5 hold one flood, one COVID and one normal, in seeded order. */
export function shockOrder(seed: number): Shock[] {
  const rng = makeRng(subSeed(seed, 1000));
  const tail = shuffle<Shock>(['flood', 'covid', 'normal'], rng);
  const order: Shock[] = [];
  for (let s = 1; s <= CONFIG.seasons; s++) {
    if (CONFIG.shocks.normalSeasons.includes(s)) order.push('normal');
    else order.push(tail[CONFIG.shocks.shockSeasons.indexOf(s)]);
  }
  return order;
}

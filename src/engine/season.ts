import { CONFIG, type Channel, type Path, type Policy, type Shock } from '../config.ts';

export interface FarmState {
  coins: number;
  debt: number; // produce units owed (contract farmer)
  reserve: number; // Mae Tha reserve units (Mae Tha member)
  wasted: number; // total units wasted so far
}

export interface SeasonResult {
  season: number; // 1-based
  shock: Shock;
  path: Path;
  soilRecovery: boolean;
  pestLoss: number; // units lost to pests this season
  harvest: number; // units harvested after pests
  advance: number; // contract: units added to the debt at the start of the season
  debtRepaid: number; // contract: units of harvest that repaid the debt
  reserveKept: number; // Mae Tha: units Mae Tha kept for the reserve this season
  reserveBonus: number; // policy C: units added by the government
  sold: Record<Channel, number>; // units that reached each buyer
  wasted: number; // units nobody could buy / the market could not take
  rottedUnits: number; // contract in COVID: units that sat unsold
  coinsDelta: number;
  costs: number; // Mae Tha: certificate + inputs paid
  reachingFood: number; // units of food that reached people, before reserve release
  reserveReleased: number; // units released from the reserve to cover the shortfall
  fed: number; // units of food reaching locals in total (incl. released reserve)
  shortfall: number;
  householdsPct: number; // fed as a percentage of need (0-100)
  after: FarmState; // state after this season
}

export const START_STATE: FarmState = { coins: 0, debt: 0, reserve: 0, wasted: 0 };

const emptySold = (): Record<Channel, number> => ({ hospital: 0, freshMarket: 0, supermarket: 0 });

export function weight(channel: Channel): number {
  return channel === 'supermarket' ? CONFIG.supermarketFeedsFactor : 1;
}

/** Pest loss is the units lost to the pest mini-game, capped per path. */
export function capPestLoss(path: Path, units: number): number {
  const cap = path === 'contract' ? CONFIG.contract.maxPestLossUnits : CONFIG.maeTha.maxPestLossUnits;
  return Math.max(0, Math.min(units, cap));
}

/** Channel caps for the Mae Tha member in this shock under this policy. */
export function maeThaCaps(shock: Shock, policy: Policy | null): Record<Channel, number> {
  const caps = { ...CONFIG.maeTha.caps };
  if (policy === 'B') caps.freshMarket = CONFIG.policies.B.freshMarketCap;
  if (shock === 'covid') caps.freshMarket = 0;
  return caps;
}

/** Channel caps for the contract farmer: everything goes to the fresh market unless policy A adds channels. */
export function contractCaps(shock: Shock, policy: Policy | null, harvest: number): Record<Channel, number> {
  const caps: Record<Channel, number> = { hospital: 0, freshMarket: harvest, supermarket: 0 };
  if (policy === 'A') {
    caps.hospital = CONFIG.policies.A.contractExtraCaps.hospital ?? 0;
    caps.supermarket = CONFIG.policies.A.contractExtraCaps.supermarket ?? 0;
  }
  if (shock === 'covid') caps.freshMarket = 0;
  return caps;
}

function cityFood(sold: Record<Channel, number>): number {
  return (Object.keys(sold) as Channel[]).reduce((sum, c) => sum + sold[c] * weight(c), 0);
}

type Partial_ = Omit<
  SeasonResult,
  'reachingFood' | 'reserveReleased' | 'fed' | 'shortfall' | 'householdsPct' | 'after'
>;

function finish(partial: Partial_, before: FarmState, reserveAfterKeep: number, debt: number): SeasonResult {
  const need = CONFIG.cityNeedPerSeason;
  const reachingFood = cityFood(partial.sold);
  const crisis = partial.shock !== 'normal';
  const gap = Math.max(0, need - reachingFood);
  // The reserve is released automatically in a crisis, never below zero.
  const reserveReleased = crisis ? Math.min(reserveAfterKeep, gap) : 0;
  const fed = reachingFood + reserveReleased;
  const shortfall = Math.max(0, need - fed);
  return {
    ...partial,
    reachingFood,
    reserveReleased,
    fed,
    shortfall,
    householdsPct: Math.min(100, Math.round((fed / need) * 100)),
    after: {
      coins: before.coins + partial.coinsDelta,
      debt,
      reserve: reserveAfterKeep - reserveReleased,
      wasted: before.wasted + partial.wasted,
    },
  };
}

export function playContractSeason(
  before: FarmState,
  season: number,
  shock: Shock,
  pestLossUnits: number,
  policy: Policy | null,
): SeasonResult {
  const c = CONFIG.contract;
  const pestLoss = shock === 'flood' ? 0 : capPestLoss('contract', pestLossUnits);
  const harvest = shock === 'flood' ? 0 : c.harvest - pestLoss;
  const debtBefore = before.debt + c.advanceUnits;
  const debtRepaid = Math.min(harvest, debtBefore);
  const remainder = harvest - debtRepaid;
  const coinsDelta = remainder * c.companyPricePerUnit;

  // Everything the company takes goes out through the open channels; the rest sits unsold.
  const caps = contractCaps(shock, policy, harvest);
  const sold = emptySold();
  let left = harvest;
  for (const ch of CONFIG.maeTha.sellOrder) {
    const take = Math.min(left, caps[ch]);
    sold[ch] = take;
    left -= take;
  }
  const rottedUnits = left;

  return finish(
    {
      season, shock, path: 'contract', soilRecovery: false, pestLoss, harvest,
      advance: c.advanceUnits, debtRepaid, reserveKept: 0, reserveBonus: 0, sold,
      wasted: rottedUnits, rottedUnits, coinsDelta, costs: 0,
    },
    before,
    before.reserve,
    debtBefore - debtRepaid,
  );
}

export function playMaeThaSeason(
  before: FarmState,
  season: number,
  shock: Shock,
  pestLossUnits: number,
  policy: Policy | null,
): SeasonResult {
  const m = CONFIG.maeTha;
  const soilRecovery = season === 1;
  const baseHarvest = soilRecovery
    ? policy === 'B' ? CONFIG.policies.B.soilRecoveryHarvest : m.soilRecoveryHarvest
    : m.harvest;
  const pestLoss = shock === 'flood' ? 0 : capPestLoss('maeTha', pestLossUnits);
  const harvest = shock === 'flood' ? 0 : Math.max(0, baseHarvest - pestLoss);

  const reserveKept = Math.min(harvest, m.reservePerSeason);
  const reserveBonus = policy === 'C' ? CONFIG.policies.C.reserveBonusPerSeason : 0;
  const price = policy === 'B' ? CONFIG.policies.B.pricePerUnit : m.pricePerUnit;
  const certificate = policy === 'B' ? CONFIG.policies.B.certificateCost : m.certificateCost;
  const costs = certificate + m.inputCost;

  const caps = maeThaCaps(shock, policy);
  const sold = emptySold();
  let left = harvest - reserveKept;
  for (const ch of m.sellOrder) {
    const take = Math.min(left, caps[ch]);
    sold[ch] = take;
    left -= take;
  }
  const soldTotal = sold.hospital + sold.freshMarket + sold.supermarket;
  const coinsDelta = reserveKept * m.reservePricePerUnit + soldTotal * price - costs;

  return finish(
    {
      season, shock, path: 'maeTha', soilRecovery, pestLoss, harvest,
      advance: 0, debtRepaid: 0, reserveKept, reserveBonus, sold,
      wasted: left, rottedUnits: 0, coinsDelta, costs,
    },
    before,
    before.reserve + reserveKept + reserveBonus,
    before.debt,
  );
}

export function playSeason(
  path: Path,
  before: FarmState,
  season: number,
  shock: Shock,
  pestLossUnits: number,
  policy: Policy | null,
): SeasonResult {
  return path === 'contract'
    ? playContractSeason(before, season, shock, pestLossUnits, policy)
    : playMaeThaSeason(before, season, shock, pestLossUnits, policy);
}

import { CONFIG } from './config.ts';

/** One tunable number, described in plain words. Reads and writes the live CONFIG. */
export interface Param {
  id: string;
  group: string;
  label: string;
  help: string;
  min: number;
  max: number;
  step: number;
  get: () => number;
  set: (v: number) => void;
}

export const PARAMS: Param[] = [
  // --- Contract farmer (Somchai)
  {
    id: 'contract.price', group: 'Contract farmer (Somchai)', label: 'Company price per extra unit', min: 0, max: 10, step: 1,
    help: 'Coins the company pays for each unit left over after the debt is repaid.',
    get: () => CONFIG.contract.companyPricePerUnit, set: (v) => { CONFIG.contract.companyPricePerUnit = v; },
  },
  {
    id: 'contract.advance', group: 'Contract farmer (Somchai)', label: 'Produce owed each season', min: 0, max: 12, step: 1,
    help: 'Units of produce added to the debt when the company delivers seeds and feed.',
    get: () => CONFIG.contract.advanceUnits, set: (v) => { CONFIG.contract.advanceUnits = v; },
  },
  {
    id: 'contract.harvest', group: 'Contract farmer (Somchai)', label: 'Harvest per season', min: 4, max: 14, step: 1,
    help: 'Units grown in a normal season, before pest losses.',
    get: () => CONFIG.contract.harvest, set: (v) => { CONFIG.contract.harvest = v; },
  },
  // --- Mae Tha member (Malee)
  {
    id: 'maeTha.price', group: 'Mae Tha member (Malee)', label: 'Profit per unit sold in organic markets', min: 0, max: 10, step: 1,
    help: 'Coins earned for each unit sold to the hospital, fresh market or supermarket.',
    get: () => CONFIG.maeTha.pricePerUnit, set: (v) => { CONFIG.maeTha.pricePerUnit = v; },
  },
  {
    id: 'maeTha.reservePrice', group: 'Mae Tha member (Malee)', label: 'Pay per unit kept in the reserve', min: 0, max: 10, step: 1,
    help: 'Coins Mae Tha pays the farmer for each unit it keeps for the food reserve.',
    get: () => CONFIG.maeTha.reservePricePerUnit, set: (v) => { CONFIG.maeTha.reservePricePerUnit = v; },
  },
  {
    id: 'maeTha.certificate', group: 'Mae Tha member (Malee)', label: 'Organic certificate cost per season', min: 0, max: 10, step: 1,
    help: 'Coins paid each season for organic inspection.',
    get: () => CONFIG.maeTha.certificateCost, set: (v) => { CONFIG.maeTha.certificateCost = v; },
  },
  {
    id: 'maeTha.inputs', group: 'Mae Tha member (Malee)', label: 'Compost, labour and packing cost', min: 0, max: 20, step: 1,
    help: 'Coins paid each season to grow organically.',
    get: () => CONFIG.maeTha.inputCost, set: (v) => { CONFIG.maeTha.inputCost = v; },
  },
  {
    id: 'maeTha.harvest', group: 'Mae Tha member (Malee)', label: 'Harvest per season', min: 4, max: 14, step: 1,
    help: 'Units grown in a normal season, before pest losses.',
    get: () => CONFIG.maeTha.harvest, set: (v) => { CONFIG.maeTha.harvest = v; },
  },
  {
    id: 'maeTha.soil', group: 'Mae Tha member (Malee)', label: 'First-season harvest (soil recovering)', min: 0, max: 10, step: 1,
    help: 'Units grown in season 1, while the land recovers from chemicals.',
    get: () => CONFIG.maeTha.soilRecoveryHarvest, set: (v) => { CONFIG.maeTha.soilRecoveryHarvest = v; },
  },
  {
    id: 'maeTha.reserve', group: 'Mae Tha member (Malee)', label: 'Units kept for the reserve each season', min: 0, max: 5, step: 1,
    help: 'Food Mae Tha stores. It is given out automatically in a flood or COVID season.',
    get: () => CONFIG.maeTha.reservePerSeason, set: (v) => { CONFIG.maeTha.reservePerSeason = v; },
  },
  // --- Who buys the food
  {
    id: 'caps.hospital', group: 'How much each buyer takes (per season)', label: 'Hospital', min: 0, max: 8, step: 1,
    help: 'Most units the hospital buys.',
    get: () => CONFIG.maeTha.caps.hospital, set: (v) => { CONFIG.maeTha.caps.hospital = v; },
  },
  {
    id: 'caps.freshMarket', group: 'How much each buyer takes (per season)', label: 'Fresh market', min: 0, max: 10, step: 1,
    help: 'Most units locals buy at the fresh market. It closes in a COVID season.',
    get: () => CONFIG.maeTha.caps.freshMarket, set: (v) => { CONFIG.maeTha.caps.freshMarket = v; },
  },
  {
    id: 'caps.supermarket', group: 'How much each buyer takes (per season)', label: 'Supermarket', min: 0, max: 8, step: 1,
    help: 'Most units the supermarket buys.',
    get: () => CONFIG.maeTha.caps.supermarket, set: (v) => { CONFIG.maeTha.caps.supermarket = v; },
  },
  {
    id: 'city.supermarket', group: 'The city', label: 'How much supermarket food helps locals', min: 0, max: 1, step: 0.1,
    help: '1 = fully, 0.5 = half (most locals cannot afford supermarket prices), 0 = not at all.',
    get: () => CONFIG.supermarketFeedsFactor, set: (v) => { CONFIG.supermarketFeedsFactor = v; },
  },
  {
    id: 'city.need', group: 'The city', label: 'Units of food the city needs per season', min: 4, max: 8, step: 1,
    help: 'Also the number of households shown in the city scene.',
    get: () => CONFIG.cityNeedPerSeason, set: (v) => { CONFIG.cityNeedPerSeason = v; },
  },
  // --- Policies
  {
    id: 'policy.B.price', group: 'Policies (replay)', label: 'Policy B: organic price per unit', min: 0, max: 10, step: 1,
    help: 'Cheaper organic food: the price per unit under policy B.',
    get: () => CONFIG.policies.B.pricePerUnit, set: (v) => { CONFIG.policies.B.pricePerUnit = v; },
  },
  {
    id: 'policy.C.bonus', group: 'Policies (replay)', label: "Policy C: extra reserve units from the government", min: 0, max: 6, step: 1,
    help: "Units added to Mae Tha's emergency reserve every season.",
    get: () => CONFIG.policies.C.reserveBonusPerSeason, set: (v) => { CONFIG.policies.C.reserveBonusPerSeason = v; },
  },
  // --- Pest mini-game
  {
    id: 'mini.duration', group: 'Pest mini-game', label: 'Length in seconds', min: 5, max: 30, step: 1,
    help: 'How long the pest mini-game lasts.',
    get: () => CONFIG.minigame.durationSec, set: (v) => { CONFIG.minigame.durationSec = v; },
  },
  {
    id: 'mini.skipLoss', group: 'Pest mini-game', label: 'Crops lost when you skip it', min: 0, max: 3, step: 1,
    help: 'Units lost to pests if you press "Skip mini-game". Capped at the most a farmer can lose.',
    get: () => CONFIG.minigame.skipLossUnits, set: (v) => { CONFIG.minigame.skipLossUnits = v; },
  },
];

const DEFAULTS: Record<string, number> = Object.fromEntries(PARAMS.map((p) => [p.id, p.get()]));
const KEY = 'two-farmers-settings-v1';

export type Values = Record<string, number>;

export const defaultValues = (): Values => ({ ...DEFAULTS });
export const currentValues = (): Values => Object.fromEntries(PARAMS.map((p) => [p.id, p.get()]));

export const clampParam = (p: Param, v: number): number => {
  const clamped = Math.min(p.max, Math.max(p.min, v));
  return Number((Math.round(clamped / p.step) * p.step).toFixed(2));
};

/** Write the given values into the live CONFIG. Missing ids fall back to the defaults. */
export function applySettings(values: Values): void {
  for (const p of PARAMS) {
    const v = values[p.id];
    p.set(typeof v === 'number' && Number.isFinite(v) ? clampParam(p, v) : DEFAULTS[p.id]);
  }
}

export function saveSettings(values: Values): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(values));
  } catch {
    // storage unavailable: settings last until the page is closed
  }
}

/** Called once at start-up: apply any settings saved in this browser. */
export function initSettings(): void {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === 'object') applySettings(parsed as Values);
  } catch {
    // ignore: use the defaults
  }
}

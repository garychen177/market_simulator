import type { Path } from '../config.ts';
import type { SeasonResult } from '../engine/season.ts';

export interface Fact {
  id: number;
  text: string;
  source: string;
}

export const FACTS: Fact[] = [
  { id: 1, text: 'Chiang Mai gets much of its food through a single central market by the river, and floods there are becoming more frequent.', source: "Fieldwork, Prof Piyapong's lecture" },
  { id: 2, text: 'During COVID, many locals lost their income and queued for food from the government and the wealthy.', source: "Fieldwork, Prof Piyapong's lecture" },
  { id: 3, text: 'Thai agribusiness firms advance seeds, fertiliser and feed, and farmers repay by selling the harvest back at a fixed price.', source: "FFTC, via the group's workshop" },
  { id: 4, text: 'Contract farmers usually have no say over which crop they grow or its price.', source: 'Group workshop' },
  { id: 5, text: 'Mae Tha was started in 1986 to pull farmers out of debt.', source: "SCMP, via the group's workshop" },
  { id: 6, text: 'About 130 Mae Tha members decide together what to grow: over 100 crops a year.', source: 'Fieldwork, Mae Tha visit' },
  { id: 7, text: 'Growing one crop attracts pests, which pushes farmers to chemicals. Mixed crops keep pests down.', source: 'Fieldwork' },
  { id: 8, text: 'Converting land to organic takes about 3 years for the soil to recover.', source: 'Group workshop' },
  { id: 9, text: 'PGS organic inspection costs about 300 baht per hectare.', source: 'Fieldwork' },
  { id: 10, text: 'Organic food can cost 3-4x more, and most locals buy on price.', source: 'Fieldwork' },
  { id: 11, text: "Food contamination is one of Chiang Mai's six main problems.", source: "Fieldwork, Prof Piyapong's lecture" },
  { id: 12, text: 'Mae Tha turns off-size vegetables into products so nothing goes to waste.', source: 'Fieldwork, Mae Tha visit' },
];

export const factById = (id: number): Fact => FACTS.find((f) => f.id === id) ?? FACTS[0];

/** Preferred fact ids for what just happened, best match first. */
function preferences(path: Path, r: SeasonResult, previous: SeasonResult[]): number[] {
  if (r.shock === 'flood') return [1, 7];
  if (r.shock === 'covid') return path === 'contract' ? [2, 4] : [2, 10];
  if (path === 'contract') {
    const firstContract = previous.length === 0;
    return firstContract ? [3, 4, 7] : [4, 7, 11];
  }
  if (r.soilRecovery) return [8, 9, 5];
  return previous.length === 1 ? [6, 9, 10] : [12, 10, 5, 6];
}

/** One fact per season: the best unused match, else any unused fact. */
export function pickFact(path: Path, r: SeasonResult, previous: SeasonResult[], used: number[]): Fact {
  const order = [...preferences(path, r, previous), ...FACTS.map((f) => f.id)];
  const id = order.find((i) => !used.includes(i)) ?? order[0];
  return factById(id);
}

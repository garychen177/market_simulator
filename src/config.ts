// Every number in the game lives here. Do not scatter magic numbers elsewhere.
export const CONFIG = {
  seasons: 5,
  cityNeedPerSeason: 8, // units the city needs ("if every farmer lived like you")
  supermarketFeedsFactor: 0.5, // supermarket food counts half: most locals can't afford it

  contract: {
    harvest: 10,
    advanceUnits: 7, // seeds+feed advanced each season, repaid in produce
    companyPricePerUnit: 3, // fixed price for units beyond the debt
    maxPestLossUnits: 1,
  },

  maeTha: {
    harvest: 10,
    soilRecoveryHarvest: 4, // season 1 only
    reservePerSeason: 2, // units Mae Tha keeps; it pays the member reservePricePerUnit
    reservePricePerUnit: 2,
    pricePerUnit: 4,
    certificateCost: 2, // per season (PGS certification)
    inputCost: 8, // compost, labour, packing per season
    caps: { hospital: 2, freshMarket: 4, supermarket: 3 } as Record<Channel, number>,
    sellOrder: ['hospital', 'freshMarket', 'supermarket'] as Channel[],
    maxPestLossUnits: 3,
  },

  minigame: {
    durationSec: 15,
    skipLossUnits: 1, // crops lost to pests if the player skips the mini-game
    plants: 5,
    unitsPerPlant: 2,
    fieldWidthPx: 320, // logical field size; the UI scales it to fit the screen
    fieldHeightPx: 300,
    plantBandPx: 44, // pests that fall past (height - plantBandPx) hit their plant
    spray: { spawnIntervalSec: 0.9, fallSpeedPx: 150, sprayRadiusPx: 70 },
    hand: { spawnIntervalSec: 0.55, fallSpeedPx: 200, hitboxPx: 48 },
  },

  shocks: {
    normalSeasons: [1, 2], // always normal
    shockSeasons: [3, 4, 5], // flood + covid + one normal, in seeded random order
  },

  // Replay-only policies. Exactly one is active at a time.
  policies: {
    A: {
      // The company can also sell to the hospital and the supermarket.
      contractExtraCaps: { hospital: 2, supermarket: 3 } as Partial<Record<Channel, number>>,
    },
    B: {
      certificateCost: 0,
      pricePerUnit: 3,
      freshMarketCap: 6,
      soilRecoveryHarvest: 6,
    },
    C: {
      reserveBonusPerSeason: 2, // government adds this to the reserve, not taken from the farmer
    },
  },

  ui: {
    profitBarMin: -20,
    profitBarMax: 100,
    animationScale: { normal: 1, reduced: 0.3, skip: 0 },
  },
};

export type Channel = 'hospital' | 'freshMarket' | 'supermarket';
export type Path = 'contract' | 'maeTha';
export type Shock = 'normal' | 'flood' | 'covid';
export type Policy = 'A' | 'B' | 'C';
export type Config = typeof CONFIG;

import { afterEach, describe, expect, it } from 'vitest';
import { CONFIG } from './config.ts';
import { START_STATE, playSeason } from './engine/season.ts';
import { PARAMS, applySettings, currentValues, defaultValues } from './settings.ts';

afterEach(() => applySettings(defaultValues()));

describe('settings', () => {
  it('starts at the spec defaults', () => {
    expect(CONFIG.maeTha.pricePerUnit).toBe(4);
    expect(CONFIG.contract.companyPricePerUnit).toBe(3);
    expect(currentValues()).toEqual(defaultValues());
  });

  it('changes the game when a value changes, and resets', () => {
    const before = playSeason('maeTha', START_STATE, 2, 'normal', 0, null).coinsDelta;
    applySettings({ ...defaultValues(), 'maeTha.price': 6 });
    expect(CONFIG.maeTha.pricePerUnit).toBe(6);
    const after = playSeason('maeTha', START_STATE, 2, 'normal', 0, null).coinsDelta;
    expect(after).toBeGreaterThan(before);
    applySettings(defaultValues());
    expect(playSeason('maeTha', START_STATE, 2, 'normal', 0, null).coinsDelta).toBe(before);
  });

  it('clamps out-of-range values', () => {
    applySettings({ ...defaultValues(), 'caps.hospital': 999, 'maeTha.price': -5 });
    const hospital = PARAMS.find((p) => p.id === 'caps.hospital')!;
    expect(CONFIG.maeTha.caps.hospital).toBe(hospital.max);
    expect(CONFIG.maeTha.pricePerUnit).toBe(0);
  });

  it('has unique ids', () => {
    expect(new Set(PARAMS.map((p) => p.id)).size).toBe(PARAMS.length);
  });
});

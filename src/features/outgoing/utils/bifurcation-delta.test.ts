import { describe, expect, it } from 'vitest';

import { bifurcationDelta } from './bifurcation-delta';

describe('bifurcationDelta', () => {
  it('saves the bags left of the original size and each size that increased', () => {
    const result = bifurcationDelta(
      [
        { size: 'goli', quantity: '80' },
        { size: 'keri', quantity: '20' },
      ],
      { goli: 100, keri: 0 },
    );

    expect(result).toEqual({
      ok: true,
      fromSize: 'goli',
      lines: [
        { toSize: 'goli', quantity: 80 },
        { toSize: 'keri', quantity: 20 },
      ],
    });
  });

  it('treats an empty quantity as zero and keeps the typed totals', () => {
    const result = bifurcationDelta(
      [
        { size: 'goli', quantity: '70' },
        { size: 'keri', quantity: '20' },
        { size: 'chatri', quantity: '10' },
      ],
      { goli: 100 },
    );

    expect(result).toEqual({
      ok: true,
      fromSize: 'goli',
      lines: [
        { toSize: 'goli', quantity: 70 },
        { toSize: 'keri', quantity: 20 },
        { toSize: 'chatri', quantity: 10 },
      ],
    });
  });

  it('saves a higher bag count when repacking increases the number of bags', () => {
    const result = bifurcationDelta(
      [
        { size: 'goli', quantity: '0' },
        { size: 'keri', quantity: '112' },
      ],
      { goli: 100 },
    );

    expect(result).toEqual({
      ok: true,
      fromSize: 'goli',
      lines: [{ toSize: 'keri', quantity: 112 }],
    });
  });

  it('saves leftover goli with the seed and keri found after repacking', () => {
    const result = bifurcationDelta(
      [
        { size: 'goli', quantity: '30' },
        { size: 'Seed', quantity: '10' },
        { size: 'Keri', quantity: '20' },
      ],
      { goli: 50 },
    );

    expect(result).toEqual({
      ok: true,
      fromSize: 'goli',
      lines: [
        { toSize: 'goli', quantity: 30 },
        { toSize: 'Seed', quantity: 10 },
        { toSize: 'Keri', quantity: 20 },
      ],
    });
  });

  it('refuses a save where more than one size decreases', () => {
    const result = bifurcationDelta(
      [
        { size: 'goli', quantity: '90' },
        { size: 'chatri', quantity: '5' },
        { size: 'keri', quantity: '15' },
      ],
      { goli: 100, chatri: 10 },
    );

    expect(result).toEqual({
      ok: false,
      message: 'Only one size can decrease in a bifurcation.',
    });
  });

  it('refuses a save that does not change any size', () => {
    const result = bifurcationDelta([{ size: 'goli', quantity: '100' }], { goli: 100 });

    expect(result).toEqual({
      ok: false,
      message: 'Change at least one size before saving.',
    });
  });
});

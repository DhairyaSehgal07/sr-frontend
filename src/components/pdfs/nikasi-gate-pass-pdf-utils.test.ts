import { describe, expect, it } from 'vitest';

import { rupeesInWords } from './nikasi-gate-pass-pdf-utils';

describe('rupeesInWords', () => {
  it('writes a lakh total the way a bilti prints it', () => {
    expect(rupeesInWords(100000)).toBe('One Lakh Only');
  });

  it('includes paise when the amount is not a whole rupee', () => {
    expect(rupeesInWords(1500.5)).toBe('One Thousand Five Hundred and Fifty Paise Only');
  });

  it('returns blank when there is no billable amount', () => {
    expect(rupeesInWords(undefined)).toBe('');
  });
});

import { describe, expect, it } from 'vitest';

import { computeNetAvailable } from '@/features/booking/lib/booking-summary-utils';
import type { BookingVarietySummary } from '@/features/booking/types/booking-summary';

function variety(
  name: string,
  sizes: Array<{ size: string; quantity: number }>,
): BookingVarietySummary {
  return {
    variety: name,
    quantity: sizes.reduce((sum, size) => sum + size.quantity, 0),
    sizes,
  };
}

function qty(result: BookingVarietySummary[], varietyName: string, size: string): number {
  return (
    result.find((entry) => entry.variety === varietyName)?.sizes.find((entry) => entry.size === size)
      ?.quantity ?? 0
  );
}

describe('computeNetAvailable', () => {
  it('adds shed-only sizes into net available', () => {
    const result = computeNetAvailable([], [], [variety('Chipsona 3', [{ size: 'Goli', quantity: 210 }])]);

    expect(qty(result, 'Chipsona 3', 'Goli')).toBe(210);
    expect(result.find((entry) => entry.variety === 'Chipsona 3')?.quantity).toBe(210);
  });

  it('adds overlapping shed stock to total before subtracting booked', () => {
    const result = computeNetAvailable(
      [variety('ATL', [{ size: 'Number-8', quantity: 100 }, { size: 'Ration', quantity: 50 }])],
      [variety('ATL', [{ size: 'Number-8', quantity: 30 }])],
      [variety('ATL', [{ size: 'Number-8', quantity: 20 }])],
    );

    expect(qty(result, 'ATL', 'Number-8')).toBe(90);
    expect(qty(result, 'ATL', 'Ration')).toBe(50);
    expect(result.find((entry) => entry.variety === 'ATL')?.quantity).toBe(140);
  });

  it('clamps net available at zero when booked exceeds total plus shed', () => {
    const result = computeNetAvailable(
      [variety('ATL', [{ size: 'Number-8', quantity: 10 }])],
      [variety('ATL', [{ size: 'Number-8', quantity: 20 }])],
      [variety('ATL', [{ size: 'Number-8', quantity: 5 }])],
    );

    expect(qty(result, 'ATL', 'Number-8')).toBe(0);
    expect(result.find((entry) => entry.variety === 'ATL')?.quantity).toBe(0);
  });

  it('treats missing shed as zero so net is total minus booked', () => {
    const result = computeNetAvailable(
      [variety('ATL', [{ size: 'Ration', quantity: 40 }])],
      [variety('ATL', [{ size: 'Ration', quantity: 15 }])],
    );

    expect(qty(result, 'ATL', 'Ration')).toBe(25);
  });
});

import { describe, expect, it } from 'vitest';

import type { SummaryVariety } from '@/features/booking/api/summary-types';
import {
  availabilityLineKey,
  buildNetAvailabilityMap,
} from '@/features/booking/lib/booking-availability';
import { mapShedSummaryToVarietySummary } from '@/features/outgoing/utils/map-shed-summary';

const storageSummary: SummaryVariety[] = [
  {
    variety: 'K. Pukhraj',
    initialQuantity: 450,
    currentQuantity: 350,
    quantityRemoved: 100,
    sizes: [
      {
        size: 'Seed',
        initialQuantity: 100,
        currentQuantity: 100,
        quantityRemoved: 0,
      },
      {
        size: 'Goli',
        initialQuantity: 350,
        currentQuantity: 250,
        quantityRemoved: 100,
      },
    ],
  },
];

const shedSummary = [
  {
    variety: 'K. Pukhraj',
    quantity: 100,
    sizes: [{ size: 'Goli', quantity: 100 }],
  },
];

describe('mapShedSummaryToVarietySummary', () => {
  it('reads quantity from currentQuantity when quantity is missing', () => {
    const mapped = mapShedSummaryToVarietySummary([
      {
        variety: 'K. Pukhraj',
        currentQuantity: 50,
        sizes: [{ size: 'Goli', currentQuantity: 50 }],
      },
    ]);

    expect(mapped[0]).toEqual({
      variety: 'K. Pukhraj',
      quantity: 50,
      sizes: [{ size: 'Goli', quantity: 50 }],
    });
  });
});

describe('buildNetAvailabilityMap', () => {
  it('adds storage currentQuantity to shed quantity per variety and size', () => {
    const map = buildNetAvailabilityMap(
      storageSummary,
      [],
      mapShedSummaryToVarietySummary(shedSummary),
    );

    expect(map.get(availabilityLineKey('K. Pukhraj', 'Goli'))).toBe(350);
    expect(map.get(availabilityLineKey('K. Pukhraj', 'Seed'))).toBe(100);
  });

  it('does not use initialQuantity for available bags', () => {
    const map = buildNetAvailabilityMap(
      storageSummary,
      [],
      mapShedSummaryToVarietySummary(shedSummary),
    );

    expect(map.get(availabilityLineKey('K. Pukhraj', 'Goli'))).not.toBe(450);
    expect(map.get(availabilityLineKey('K. Pukhraj', 'Goli'))).not.toBe(250);
  });
});

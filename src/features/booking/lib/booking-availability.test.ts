import { describe, expect, it } from 'vitest';

import type { SummaryVariety } from '@/features/booking/api/summary-types';
import {
  availabilityLineKey,
  buildNetAvailabilityMap,
} from '@/features/booking/lib/booking-availability';
import {
  getShedGroupVarieties,
  mapShedSummaryToVarietySummary,
  normalizeShedSummaryGroups,
} from '@/features/outgoing/utils/map-shed-summary';

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

const shedSummaryGroups = normalizeShedSummaryGroups([
  {
    shed: 'all',
    varieties: [
      {
        variety: 'K. Pukhraj',
        quantity: 100,
        sizes: [{ size: 'Goli', quantity: 100 }],
      },
    ],
  },
  {
    shed: 'Solar shed',
    varieties: [
      {
        variety: 'K. Pukhraj',
        quantity: 40,
        sizes: [{ size: 'Goli', quantity: 40 }],
      },
    ],
  },
  {
    shed: 'Vaddi shed',
    varieties: [
      {
        variety: 'K. Pukhraj',
        quantity: 60,
        sizes: [{ size: 'Goli', quantity: 60 }],
      },
    ],
  },
]);

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

describe('normalizeShedSummaryGroups', () => {
  it('normalizes each shed group varieties array', () => {
    const groups = normalizeShedSummaryGroups([
      {
        shed: 'all',
        varieties: [
          {
            variety: 'K. Pukhraj',
            currentQuantity: 50,
            sizes: [{ size: 'Goli', currentQuantity: 50 }],
          },
        ],
      },
    ]);

    expect(groups).toEqual([
      {
        shed: 'all',
        varieties: [
          {
            variety: 'K. Pukhraj',
            quantity: 50,
            sizes: [{ size: 'Goli', quantity: 50 }],
          },
        ],
      },
    ]);
  });
});

describe('getShedGroupVarieties', () => {
  it('returns varieties for the all group used in net math', () => {
    expect(getShedGroupVarieties(shedSummaryGroups, 'all')).toEqual([
      {
        variety: 'K. Pukhraj',
        quantity: 100,
        sizes: [{ size: 'Goli', quantity: 100 }],
      },
    ]);
  });

  it('returns varieties for a named shed tab', () => {
    expect(getShedGroupVarieties(shedSummaryGroups, 'Solar shed')).toEqual([
      {
        variety: 'K. Pukhraj',
        quantity: 40,
        sizes: [{ size: 'Goli', quantity: 40 }],
      },
    ]);
  });

  it('returns an empty array when the shed key is missing', () => {
    expect(getShedGroupVarieties(shedSummaryGroups, 'Front shed')).toEqual([]);
  });
});

describe('buildNetAvailabilityMap', () => {
  it('adds storage currentQuantity to all-shed quantity per variety and size', () => {
    const map = buildNetAvailabilityMap(
      storageSummary,
      [],
      getShedGroupVarieties(shedSummaryGroups, 'all'),
    );

    expect(map.get(availabilityLineKey('K. Pukhraj', 'Goli'))).toBe(350);
    expect(map.get(availabilityLineKey('K. Pukhraj', 'Seed'))).toBe(100);
  });

  it('does not use initialQuantity for available bags', () => {
    const map = buildNetAvailabilityMap(
      storageSummary,
      [],
      getShedGroupVarieties(shedSummaryGroups, 'all'),
    );

    expect(map.get(availabilityLineKey('K. Pukhraj', 'Goli'))).not.toBe(450);
    expect(map.get(availabilityLineKey('K. Pukhraj', 'Goli'))).not.toBe(250);
  });
});

import { describe, expect, it } from 'vitest';
import type { TransferStockItem } from '@/features/transfer-stock/types/storage-gate-pass';
import {
  groupOutgoingItemsByVarietyAndSize,
  lookupOutgoingWeight,
  outgoingWeightKey,
} from '@/features/outgoing/utils/group-outgoing-items';

function item(overrides: Partial<TransferStockItem> & Pick<TransferStockItem, 'storageGatePassId'>): TransferStockItem {
  return {
    gatePassNo: 100,
    variety: 'Jyoti',
    bagSize: 'Ration',
    bagIndex: 0,
    quantity: 10,
    bagType: 'JUTE',
    location: { chamber: '1', floor: '2', row: '3' },
    ...overrides,
  };
}

describe('groupOutgoingItemsByVarietyAndSize', () => {
  it('merges two gate passes of the same variety and size into one row', () => {
    const groups = groupOutgoingItemsByVarietyAndSize([
      item({ storageGatePassId: 'pass-1', gatePassNo: 101, quantity: 20 }),
      item({ storageGatePassId: 'pass-2', gatePassNo: 102, quantity: 15 }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      variety: 'Jyoti',
      size: 'Ration',
      quantity: 35,
      bagType: 'JUTE',
      chamber: '1',
      floor: '2',
      row: '3',
    });
  });

  it('keeps separate rows for different sizes', () => {
    const groups = groupOutgoingItemsByVarietyAndSize([
      item({ storageGatePassId: 'pass-1', bagSize: 'Ration', quantity: 10 }),
      item({ storageGatePassId: 'pass-2', bagSize: 'Seed', quantity: 8 }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups.map((group) => group.size).sort()).toEqual(['Ration', 'Seed']);
  });

  it('shows Multiple when locations differ within the same size', () => {
    const groups = groupOutgoingItemsByVarietyAndSize([
      item({ storageGatePassId: 'pass-1', location: { chamber: '1', floor: '2', row: '3' } }),
      item({
        storageGatePassId: 'pass-2',
        location: { chamber: '9', floor: '2', row: '3' },
      }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.chamber).toBe('Multiple');
    expect(groups[0]?.floor).toBe('2');
    expect(groups[0]?.row).toBe('3');
  });
});

describe('lookupOutgoingWeight', () => {
  it('returns the same weight for every matching variety and size', () => {
    const key = outgoingWeightKey('Jyoti', 'Ration');
    const weights = { [key]: 50.25 };

    expect(lookupOutgoingWeight(weights, 'Jyoti', 'Ration')).toBe(50.25);
    expect(lookupOutgoingWeight(weights, 'Jyoti', 'Seed')).toBeUndefined();
  });
});

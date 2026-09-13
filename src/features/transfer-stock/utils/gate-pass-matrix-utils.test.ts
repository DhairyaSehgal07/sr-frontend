import { describe, expect, it } from 'vitest';
import type { StorageGatePass } from '@/features/transfer-stock/types/storage-gate-pass';
import {
  allocationKey,
  buildTransferItems,
  filterStorageGatePasses,
  groupItemsByVariety,
  groupPassesByDate,
  parseAllocationKey,
} from '@/features/transfer-stock/utils/gate-pass-matrix-utils';

const samplePass: StorageGatePass = {
  _id: 'pass-1',
  farmerStorageLinkId: 'link-1',
  gatePassNo: 100,
  manualGatePassNumber: 50,
  date: '2026-03-04T00:00:00.000Z',
  variety: 'K. Jyoti',
  storageCategory: 'RENTAL',
  bagSizes: [
    {
      size: 'Ration',
      currentQuantity: 40,
      initialQuantity: 40,
      bagType: 'LENO',
      chamber: '4',
      floor: '1',
      row: 'D',
    },
    {
      size: 'Large|Special',
      currentQuantity: 10,
      initialQuantity: 10,
      bagType: 'LENO',
      chamber: '1',
      floor: '2',
      row: 'A',
    },
  ],
  remarks: '',
};

describe('allocationKey / parseAllocationKey', () => {
  it('round-trips pass id, size, and bag index', () => {
    const key = allocationKey('pass-1', 'Ration', 0);
    const parsed = parseAllocationKey(key);
    expect(parsed).toEqual({
      passId: 'pass-1',
      sizeName: 'Ration',
      bagIndex: 0,
    });
  });

  it('supports size names containing pipe characters', () => {
    const key = allocationKey('pass-1', 'Large|Special', 1);
    const parsed = parseAllocationKey(key);
    expect(parsed).toEqual({
      passId: 'pass-1',
      sizeName: 'Large|Special',
      bagIndex: 1,
    });
  });
});

describe('filterStorageGatePasses', () => {
  it('filters by variety, search, and location together', () => {
    const result = filterStorageGatePasses([samplePass], {
      variety: 'K. Jyoti',
      search: '100',
      location: { chamber: '4', floor: '', row: '' },
    });
    expect(result).toHaveLength(1);

    const noMatch = filterStorageGatePasses([samplePass], {
      variety: 'Other',
    });
    expect(noMatch).toHaveLength(0);
  });
});

describe('groupPassesByDate', () => {
  it('groups passes under formatted date labels', () => {
    const groups = groupPassesByDate([samplePass], 'asc');
    expect(groups).toHaveLength(1);
    expect(groups[0]?.dateKey).toBe('2026-03-04');
    expect(groups[0]?.passes).toHaveLength(1);
    expect(groups[0]?.dateLabel).toMatch(/2026/);
  });
});

describe('buildTransferItems', () => {
  it('builds line items from allocation keys', () => {
    const key = allocationKey('pass-1', 'Ration', 0);
    const items = buildTransferItems({ [key]: 25 }, [samplePass]);
    expect(items).toEqual([
      {
        storageGatePassId: 'pass-1',
        gatePassNo: 100,
        variety: 'K. Jyoti',
        bagSize: 'Ration',
        bagIndex: 0,
        quantity: 25,
        bagType: 'LENO',
        location: { chamber: '4', floor: '1', row: 'D' },
      },
    ]);
  });
});

describe('groupItemsByVariety', () => {
  it('groups line items by variety', () => {
    const keyA = allocationKey('pass-1', 'Ration', 0);
    const passB: StorageGatePass = {
      ...samplePass,
      _id: 'pass-2',
      gatePassNo: 101,
      variety: 'Chipsona',
    };
    const keyB = allocationKey('pass-2', 'Ration', 0);
    const items = buildTransferItems({ [keyA]: 10, [keyB]: 20 }, [samplePass, passB]);

    const groups = groupItemsByVariety(items);
    expect(groups).toHaveLength(2);
    expect(groups.find((g) => g.variety === 'K. Jyoti')?.items).toHaveLength(1);
    expect(groups.find((g) => g.variety === 'Chipsona')?.items).toHaveLength(1);
  });
});

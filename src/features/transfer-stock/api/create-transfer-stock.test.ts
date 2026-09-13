import { describe, expect, it } from 'vitest';

import { deriveStageFromSelections } from '@/features/transfer-stock/api/create-transfer-stock';
import type {
  StorageGatePass,
  TransferStockItem,
} from '@/features/transfer-stock/types/storage-gate-pass';

function makePass(id: string, stage?: string): StorageGatePass {
  return {
    _id: id,
    farmerStorageLinkId: 'link-1',
    gatePassNo: 100,
    manualGatePassNumber: 50,
    date: '2026-07-09T00:00:00.000Z',
    variety: 'Kufri Jyoti',
    storageCategory: 'OWNED',
    stage,
    bagSizes: [],
    remarks: '',
  };
}

function makeItem(storageGatePassId: string): TransferStockItem {
  return {
    storageGatePassId,
    gatePassNo: 100,
    variety: 'Kufri Jyoti',
    bagSize: 'Ration',
    bagIndex: 0,
    quantity: 10,
    bagType: 'JUTE',
    location: { chamber: 'C1', floor: 'F2', row: 'R3' },
  };
}

describe('deriveStageFromSelections', () => {
  it('returns the stage when all selected passes share one stage', () => {
    const passes = [makePass('pass-1', 'G1'), makePass('pass-2', 'G1')];
    const items = [makeItem('pass-1'), makeItem('pass-2')];

    expect(deriveStageFromSelections(items, passes)).toBe('G1');
  });

  it('returns undefined when selected passes have mixed stages', () => {
    const passes = [makePass('pass-1', 'G1'), makePass('pass-2', 'G2')];
    const items = [makeItem('pass-1'), makeItem('pass-2')];

    expect(deriveStageFromSelections(items, passes)).toBeUndefined();
  });

  it('returns undefined when no selected pass has a stage', () => {
    const passes = [makePass('pass-1'), makePass('pass-2', '  ')];
    const items = [makeItem('pass-1'), makeItem('pass-2')];

    expect(deriveStageFromSelections(items, passes)).toBeUndefined();
  });
});

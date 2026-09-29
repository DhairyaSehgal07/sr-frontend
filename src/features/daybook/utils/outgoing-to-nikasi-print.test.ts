import { describe, expect, it } from 'vitest';

import type { DaybookOutgoingEntry } from '@/features/daybook/api/types';

import { outgoingEntryToNikasiPrintModel } from './outgoing-to-nikasi-print';

function entry(overrides: Partial<DaybookOutgoingEntry> = {}): DaybookOutgoingEntry {
  return {
    _id: '64f1a2b3c4d5e6f7a8b9c0d1',
    passKind: 'outgoing',
    farmerStorageLinkId: {
      _id: '64f1a2b3c4d5e6f7a8b9c0d2',
      accountNumber: 12,
      farmerId: {
        _id: '64f1a2b3c4d5e6f7a8b9c0d3',
        name: 'Ravi',
        mobileNumber: '9876543210',
        address: 'Kapurthala',
      },
    },
    gatePassNo: 101,
    date: '2026-09-10T10:00:00.000Z',
    variety: 'Jyoti',
    createdAt: '2026-09-10T10:00:00.000Z',
    category: 'Direct Sale',
    from: 'Cold storage',
    to: 'Market Yard',
    truckNumber: 'PB10AB1234',
    billNumber: 45,
    biltiNumber: 67,
    billBook: 'A',
    orderDetails: [],
    storageGatePassSnapshots: [],
    status: 'ACTIVE',
    ...overrides,
  };
}

describe('outgoingEntryToNikasiPrintModel', () => {
  it('uses a blank destination as the billed party name', () => {
    const model = outgoingEntryToNikasiPrintModel(entry({ to: '   ' }));

    expect(model.to).toBe('');
    expect(model.dispatchLedgerId).toEqual({ name: '' });
  });

  it('sums issued bags of the same size into one line', () => {
    const model = outgoingEntryToNikasiPrintModel(
      entry({
        orderDetails: [
          {
            size: 'Ration',
            bagType: 'JUTE',
            quantityIssued: 10,
            quantityAvailable: 20,
            weightInKg: 50,
            chamber: '1',
            floor: '1',
            row: '1',
          },
          {
            size: 'Ration',
            bagType: 'JUTE',
            quantityIssued: 5,
            quantityAvailable: 8,
            weightInKg: 50,
            chamber: '1',
            floor: '1',
            row: '2',
          },
          {
            size: 'Seed',
            bagType: 'JUTE',
            quantityIssued: 4,
            quantityAvailable: 4,
            weightInKg: 40,
            chamber: '2',
            floor: '1',
            row: '1',
          },
        ],
      }),
    );

    expect(model.bagSize).toEqual([
      { size: 'Ration', variety: 'Jyoti', quantityIssued: 15 },
      { size: 'Seed', variety: 'Jyoti', quantityIssued: 4 },
    ]);
    expect(model.bagSize.every((row) => row.costPerBag == null)).toBe(true);

    const priced = outgoingEntryToNikasiPrintModel(entry({ costPerBag: 450 }));
    expect(priced.bagSize).toEqual([]);
    const pricedLines = outgoingEntryToNikasiPrintModel(
      entry({
        costPerBag: 450,
        orderDetails: [
          {
            size: 'Ration',
            bagType: 'JUTE',
            quantityIssued: 2,
            quantityAvailable: 2,
            chamber: '1',
            floor: '1',
            row: '1',
          },
        ],
      }),
    );
    expect(pricedLines.bagSize[0]?.costPerBag).toBe(450);
  });

  it('builds net weight from average bag weight and leaves it blank when none is recorded', () => {
    const withWeight = outgoingEntryToNikasiPrintModel(
      entry({
        orderDetails: [
          {
            size: 'Ration',
            bagType: 'JUTE',
            quantityIssued: 10,
            quantityAvailable: 10,
            weightInKg: 50,
            chamber: '1',
            floor: '1',
            row: '1',
          },
          {
            size: 'Seed',
            bagType: 'JUTE',
            quantityIssued: 5,
            quantityAvailable: 5,
            weightInKg: 40,
            chamber: '1',
            floor: '1',
            row: '2',
          },
        ],
      }),
    );

    expect(withWeight.netWeight).toBe(700);
    expect(withWeight.bitliNumber).toBe(67);

    const withoutWeight = outgoingEntryToNikasiPrintModel(
      entry({
        orderDetails: [
          {
            size: 'Ration',
            bagType: 'JUTE',
            quantityIssued: 10,
            quantityAvailable: 10,
            chamber: '1',
            floor: '1',
            row: '1',
          },
        ],
      }),
    );

    expect(Number.isFinite(withoutWeight.netWeight)).toBe(false);
  });
});

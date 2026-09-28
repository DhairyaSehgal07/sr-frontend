import { describe, expect, it, vi } from 'vitest';

import { toCreateOutgoingGatePassBody } from '@/features/outgoing/api/create-outgoing-gate-pass';
import type { OutgoingFormSubmitValues } from '@/features/outgoing/schemas/outgoing-form-schema';
import { outgoingWeightKey } from '@/features/outgoing/utils/group-outgoing-items';
import type { TransferStockItem } from '@/features/transfer-stock/types/storage-gate-pass';

function item(
  overrides: Partial<TransferStockItem> & Pick<TransferStockItem, 'storageGatePassId'>,
): TransferStockItem {
  return {
    gatePassNo: 101,
    variety: 'Jyoti',
    bagSize: 'Ration',
    bagIndex: 0,
    quantity: 20,
    bagType: 'JUTE',
    location: { chamber: '1', floor: '2', row: '3' },
    ...overrides,
  };
}

const form: OutgoingFormSubmitValues = {
  step1: {
    farmerStorageLinkId: '64f1a2b3c4d5e6f7a8b9c0d1',
    date: '2026-09-10T10:00:00.000Z',
    manualGatePassNumber: 12,
    from: 'Chamber A',
    to: 'Delhi',
    truckNumber: 'PB10AB1234',
    transportCompany: 'Punjab Roadways',
    LSNumber: 'LS-12',
    driverName: 'Ravi',
    driverMobile: '9876543210',
    owner: 'Kapur',
    category: 'Direct Sale',
    billNumber: '45',
    biltiNumber: '67',
    billBook: 'A',
    biltiBook: 'B',
    allocations: { key: 20 },
  },
  step2: {
    remarks: 'Outgoing dispatch',
    weightsBySize: {
      [outgoingWeightKey('Jyoti', 'Ration')]: 50.25,
    },
  },
};

describe('toCreateOutgoingGatePassBody', () => {
  it('copies the grouped average weight onto every matching gate pass allocation', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'outgoing-create-101' });

    const body = toCreateOutgoingGatePassBody({
      form,
      gatePassNo: 101,
      items: [
        item({ storageGatePassId: '64f1a2b3c4d5e6f7a8b9c0d2', gatePassNo: 11, quantity: 20 }),
        item({ storageGatePassId: '64f1a2b3c4d5e6f7a8b9c0d3', gatePassNo: 12, quantity: 15 }),
      ],
    });

    expect(body).toMatchObject({
      transportCompany: 'Punjab Roadways',
      LSNumber: 'LS-12',
      driverName: 'Ravi',
      driverMobile: '9876543210',
      owner: 'Kapur',
    });
    expect(body.storageGatePasses).toHaveLength(2);
    expect(body.storageGatePasses[0]?.allocations[0]).toMatchObject({
      size: 'Ration',
      quantityToAllocate: 20,
      weightInKg: 50.25,
      chamber: '1',
      floor: '2',
      row: '3',
    });
    expect(body.storageGatePasses[1]?.allocations[0]).toMatchObject({
      size: 'Ration',
      quantityToAllocate: 15,
      weightInKg: 50.25,
    });

    vi.unstubAllGlobals();
  });

  it('omits route and bill fields unless the category is Direct Sale', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'outgoing-create-102' });

    const body = toCreateOutgoingGatePassBody({
      form: {
        ...form,
        step1: { ...form.step1, category: 'Outgoing to Shed' },
      },
      gatePassNo: 101,
      items: [item({ storageGatePassId: '64f1a2b3c4d5e6f7a8b9c0d2', gatePassNo: 11, quantity: 20 })],
    });

    expect(body.category).toBe('Outgoing to Shed');
    expect(body).not.toHaveProperty('from');
    expect(body).not.toHaveProperty('to');
    expect(body).not.toHaveProperty('truckNumber');
    expect(body).not.toHaveProperty('transportCompany');
    expect(body).not.toHaveProperty('LSNumber');
    expect(body).not.toHaveProperty('driverName');
    expect(body).not.toHaveProperty('driverMobile');
    expect(body).not.toHaveProperty('owner');
    expect(body).not.toHaveProperty('billNumber');
    expect(body).not.toHaveProperty('biltiNumber');
    expect(body).not.toHaveProperty('billBook');
    expect(body).not.toHaveProperty('biltiBook');

    vi.unstubAllGlobals();
  });
});

import { describe, expect, it, vi } from 'vitest';

import { toCreateOutgoingGatePassBody } from '@/features/outgoing/api/create-outgoing-gate-pass';
import { editOutgoingFormSchema } from '@/features/outgoing/schemas/edit-outgoing-form-schema';
import {
  outgoingStep1Schema,
  type OutgoingFormSubmitValues,
} from '@/features/outgoing/schemas/outgoing-form-schema';
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
    shed: '',
    preSowingTreatment: false,
    dispatchLedgerId: '64f1a2b3c4d5e6f7a8b9c0d4',
    billBookId: '64f1a2b3c4d5e6f7a8b9c0d5',
    billNumber: '45',
    biltiNumber: '67',
    biltiBook: 'B',
    costPerBag: '450',
    allocations: { key: 20 },
  },
  step2: {
    remarks: 'Outgoing dispatch',
    weightsBySize: {
      [outgoingWeightKey('Jyoti', 'Ration')]: 50.25,
    },
  },
};

describe('direct sale fields', () => {
  it('accepts a Direct Sale with every route and bill field left blank', () => {
    const step1 = outgoingStep1Schema.safeParse({
      ...form.step1,
      from: '',
      to: '',
      truckNumber: '',
      transportCompany: '',
      LSNumber: '',
      driverName: '',
      driverMobile: '',
      owner: '',
      billNumber: '',
      biltiNumber: '',
      biltiBook: '',
      costPerBag: '450',
    });
    expect(step1.success).toBe(true);

    const edit = editOutgoingFormSchema.safeParse({
      date: form.step1.date,
      manualGatePassNumber: undefined,
      from: '',
      to: '',
      truckNumber: '',
      transportCompany: '',
      LSNumber: '',
      driverName: '',
      driverMobile: '',
      owner: '',
      category: 'Direct Sale',
      shed: '',
      preSowingTreatment: false,
      dispatchLedgerId: '64f1a2b3c4d5e6f7a8b9c0d4',
      billNumber: '',
      biltiNumber: '',
      billBook: '',
      biltiBook: '',
      costPerBag: '450',
      remarks: '',
    });
    expect(edit.success).toBe(true);
  });

  it('requires a dispatch ledger and bill book for Direct Sale', () => {
    const missingLedger = outgoingStep1Schema.safeParse({
      ...form.step1,
      dispatchLedgerId: '',
    });
    expect(missingLedger.success).toBe(false);

    const missingBillBook = outgoingStep1Schema.safeParse({
      ...form.step1,
      billBookId: '',
    });
    expect(missingBillBook.success).toBe(false);

    const otherCategory = outgoingStep1Schema.safeParse({
      ...form.step1,
      category: 'Outgoing to Shed',
      shed: 'Solar shed',
      dispatchLedgerId: '',
      billBookId: '',
      costPerBag: '',
    });
    expect(otherCategory.success).toBe(true);

    const editMissingLedger = editOutgoingFormSchema.safeParse({
      date: form.step1.date,
      manualGatePassNumber: undefined,
      from: '',
      to: '',
      truckNumber: '',
      transportCompany: '',
      LSNumber: '',
      driverName: '',
      driverMobile: '',
      owner: '',
      category: 'Direct Sale',
      shed: '',
      preSowingTreatment: false,
      dispatchLedgerId: '',
      billNumber: '',
      biltiNumber: '',
      billBook: '',
      biltiBook: '',
      costPerBag: '450',
      remarks: '',
    });
    expect(editMissingLedger.success).toBe(false);
  });

  it('requires a cost per bag for Direct Sale', () => {
    const missing = outgoingStep1Schema.safeParse({
      ...form.step1,
      costPerBag: '',
    });
    expect(missing.success).toBe(false);

    const otherCategory = outgoingStep1Schema.safeParse({
      ...form.step1,
      category: 'Outgoing to Shed',
      shed: 'Solar shed',
      costPerBag: '',
    });
    expect(otherCategory.success).toBe(true);
  });

  it('requires a shed only for Outgoing to Shed', () => {
    const missing = outgoingStep1Schema.safeParse({
      ...form.step1,
      category: 'Outgoing to Shed',
      shed: '',
      dispatchLedgerId: '',
      billBookId: '',
      costPerBag: '',
    });
    expect(missing.success).toBe(false);
    if (!missing.success) {
      expect(missing.error.issues.some((issue) => issue.path.join('.') === 'shed')).toBe(true);
    }

    const selected = outgoingStep1Schema.safeParse({
      ...form.step1,
      category: 'Outgoing to Shed',
      shed: 'Solar shed',
      dispatchLedgerId: '',
      billBookId: '',
      costPerBag: '',
    });
    expect(selected.success).toBe(true);

    const otherCategory = outgoingStep1Schema.safeParse({
      ...form.step1,
      category: 'Outgoing To Farmer',
      shed: '',
      dispatchLedgerId: '',
      billBookId: '',
      costPerBag: '',
    });
    expect(otherCategory.success).toBe(true);

    const editMissing = editOutgoingFormSchema.safeParse({
      date: form.step1.date,
      manualGatePassNumber: undefined,
      from: '',
      to: '',
      truckNumber: '',
      transportCompany: '',
      LSNumber: '',
      driverName: '',
      driverMobile: '',
      owner: '',
      category: 'Outgoing to Shed',
      shed: '   ',
      preSowingTreatment: false,
      dispatchLedgerId: '',
      billNumber: '',
      biltiNumber: '',
      billBook: '',
      biltiBook: '',
      costPerBag: '',
      remarks: '',
    });
    expect(editMissing.success).toBe(false);

    const editSelected = editOutgoingFormSchema.safeParse({
      date: form.step1.date,
      manualGatePassNumber: undefined,
      from: '',
      to: '',
      truckNumber: '',
      transportCompany: '',
      LSNumber: '',
      driverName: '',
      driverMobile: '',
      owner: '',
      category: 'Outgoing to Shed',
      shed: 'Vaddi shed',
      preSowingTreatment: false,
      dispatchLedgerId: '',
      billNumber: '',
      biltiNumber: '',
      billBook: '',
      biltiBook: '',
      costPerBag: '',
      remarks: '',
    });
    expect(editSelected.success).toBe(true);
  });

  it('rejects a non-numeric bill number when one is entered', () => {
    const result = outgoingStep1Schema.safeParse({
      ...form.step1,
      billNumber: 'abc',
    });
    expect(result.success).toBe(false);
  });
});

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
      'pre-sowing-treatment': false,
      dispatchLedgerId: '64f1a2b3c4d5e6f7a8b9c0d4',
      billBookId: '64f1a2b3c4d5e6f7a8b9c0d5',
      transportCompany: 'Punjab Roadways',
      LSNumber: 'LS-12',
      driverName: 'Ravi',
      driverMobile: '9876543210',
      owner: 'Kapur',
      costPerBag: 450,
    });
    expect(body).not.toHaveProperty('billBook');
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
      items: [
        item({ storageGatePassId: '64f1a2b3c4d5e6f7a8b9c0d2', gatePassNo: 11, quantity: 20 }),
      ],
    });

    expect(body.category).toBe('Outgoing to Shed');
    expect(body['pre-sowing-treatment']).toBe(false);
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
    expect(body).not.toHaveProperty('dispatchLedgerId');
    expect(body).not.toHaveProperty('billBookId');
    expect(body).not.toHaveProperty('costPerBag');
    expect(body).not.toHaveProperty('shed');

    vi.unstubAllGlobals();
  });

  it('omits blank Direct Sale details from the request', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'outgoing-create-103' });

    const body = toCreateOutgoingGatePassBody({
      form: {
        ...form,
        step1: {
          ...form.step1,
          from: '  ',
          to: '',
          truckNumber: '',
          transportCompany: '',
          LSNumber: '',
          driverName: '',
          driverMobile: '',
          owner: '',
          billNumber: '',
          biltiNumber: '',
          biltiBook: '',
        },
      },
      gatePassNo: 101,
      items: [
        item({ storageGatePassId: '64f1a2b3c4d5e6f7a8b9c0d2', gatePassNo: 11, quantity: 20 }),
      ],
    });

    expect(body.category).toBe('Direct Sale');
    expect(body.dispatchLedgerId).toBe('64f1a2b3c4d5e6f7a8b9c0d4');
    expect(body.billBookId).toBe('64f1a2b3c4d5e6f7a8b9c0d5');
    expect(body).not.toHaveProperty('from');
    expect(body).not.toHaveProperty('to');
    expect(body).not.toHaveProperty('truckNumber');
    expect(body).not.toHaveProperty('billNumber');
    expect(body).not.toHaveProperty('biltiNumber');
    expect(body).not.toHaveProperty('billBook');
    expect(body.costPerBag).toBe(450);
    expect(body).not.toHaveProperty('shed');

    vi.unstubAllGlobals();
  });

  it('sends a selected shed for any category and omits a blank shed', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'outgoing-create-104' });

    const withShed = toCreateOutgoingGatePassBody({
      form: {
        ...form,
        step1: { ...form.step1, category: 'Outgoing to Shed', shed: 'Solar shed' },
      },
      gatePassNo: 101,
      items: [
        item({ storageGatePassId: '64f1a2b3c4d5e6f7a8b9c0d2', gatePassNo: 11, quantity: 20 }),
      ],
    });

    expect(withShed.shed).toBe('Solar shed');
    expect(withShed).not.toHaveProperty('dispatchLedgerId');

    const blankShed = toCreateOutgoingGatePassBody({
      form: {
        ...form,
        step1: { ...form.step1, shed: '   ' },
      },
      gatePassNo: 101,
      items: [
        item({ storageGatePassId: '64f1a2b3c4d5e6f7a8b9c0d2', gatePassNo: 11, quantity: 20 }),
      ],
    });

    expect(blankShed).not.toHaveProperty('shed');

    vi.unstubAllGlobals();
  });

  it('sends pre-sowing treatment as true when the checkbox is checked', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'outgoing-create-105' });

    const body = toCreateOutgoingGatePassBody({
      form: {
        ...form,
        step1: { ...form.step1, preSowingTreatment: true },
      },
      gatePassNo: 101,
      items: [
        item({ storageGatePassId: '64f1a2b3c4d5e6f7a8b9c0d2', gatePassNo: 11, quantity: 20 }),
      ],
    });

    expect(body['pre-sowing-treatment']).toBe(true);

    vi.unstubAllGlobals();
  });
});

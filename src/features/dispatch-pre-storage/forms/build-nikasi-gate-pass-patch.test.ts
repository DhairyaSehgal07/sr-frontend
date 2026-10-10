import { describe, expect, it } from 'vitest';

import type { NikasiGatePass } from '@/features/dispatch-pre-storage/api/types';
import {
  buildNikasiGatePassPatch,
  draftFromNikasiGatePass,
  nikasiGatePassEditFieldErrors,
} from '@/features/dispatch-pre-storage/forms/build-nikasi-gate-pass-patch';

const gatePass: NikasiGatePass = {
  _id: '68e7a1c2b4f0e91a2c3d4e5f',
  gatePassNo: 18,
  manualGatePassNumber: 1204,
  date: '2026-10-10T00:00:00.000Z',
  category: 'Potato',
  isBooked: false,
  from: 'Kapur',
  to: 'Delhi',
  truckNumber: 'PB10AB1234',
  transportCompany: 'Sharma Transport',
  LSNumber: 'LS-441',
  driverName: 'Ramesh',
  owner: 'Sri Ram Farms',
  bagSize: [{ size: '50kg', variety: 'Chipsona', quantityIssued: 100 }],
  netWeight: 5000,
  averageWeightPerBag: 50,
  remarks: 'Corrected truck details',
  dispatchLedgerId: {
    _id: '68e7a100b4f0e91a2c3d4e10',
    name: 'Kapur Dispatch',
  },
};

describe('buildNikasiGatePassPatch', () => {
  it('omits unchanged fields', () => {
    expect(buildNikasiGatePassPatch(gatePass, draftFromNikasiGatePass(gatePass))).toEqual({});
  });

  it('sends only the fields that changed, including cleared optionals', () => {
    const draft = draftFromNikasiGatePass(gatePass);

    expect(
      buildNikasiGatePassPatch(gatePass, {
        ...draft,
        truckNumber: 'PB10CD9999',
        remarks: '   ',
        manualGatePassNumber: '',
        driverName: 'Suresh',
      }),
    ).toEqual({
      truckNumber: 'PB10CD9999',
      remarks: '',
      manualGatePassNumber: null,
      driverName: 'Suresh',
    });
  });

  it('includes the date only when the calendar day changes', () => {
    const draft = draftFromNikasiGatePass(gatePass);
    const sameDay = draft.date ? new Date(draft.date) : undefined;
    sameDay?.setHours(15, 30, 0, 0);

    expect(buildNikasiGatePassPatch(gatePass, { ...draft, date: sameDay })).toEqual({});

    const nextDay = draft.date ? new Date(draft.date) : undefined;
    nextDay?.setDate(nextDay.getDate() + 1);

    expect(buildNikasiGatePassPatch(gatePass, { ...draft, date: nextDay }).date).toBe(
      nextDay?.toISOString(),
    );
  });
});

describe('nikasiGatePassEditFieldErrors', () => {
  it('requires the core fields and a positive manual number when one is entered', () => {
    const draft = draftFromNikasiGatePass(gatePass);

    expect(nikasiGatePassEditFieldErrors(draft)).toEqual({});
    expect(
      nikasiGatePassEditFieldErrors({
        ...draft,
        from: '  ',
        manualGatePassNumber: '0',
      }),
    ).toMatchObject({
      from: 'From is required.',
      manualGatePassNumber: 'Must be a whole number greater than zero.',
    });
  });
});

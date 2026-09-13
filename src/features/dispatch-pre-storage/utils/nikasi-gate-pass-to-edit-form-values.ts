import { POTATO_VARIETY_OPTIONS } from '@/lib/constants';

import type {
  DispatchPreStorageFormValues,
  NikasiGatePass,
} from '@/features/dispatch-pre-storage/api/types';

import {
  createDefaultBagSizeRows,
  gatePassBagSizeToRows,
} from '@/features/dispatch-pre-storage/forms/dispatch-pre-storage-form-utils';

function findVarietyId(label: string): string {
  const match = POTATO_VARIETY_OPTIONS.find(
    (item) => item.label.toLowerCase() === label.trim().toLowerCase(),
  );
  if (match) return match.id;
  const byId = POTATO_VARIETY_OPTIONS.find((item) => item.id === label);
  return byId?.id ?? label;
}

export function nikasiGatePassToEditFormValues(
  gatePass: NikasiGatePass,
): DispatchPreStorageFormValues {
  return {
    manualGatePassNumber:
      gatePass.manualGatePassNumber != null ? String(gatePass.manualGatePassNumber) : '',
    date: gatePass.date,
    dispatchLedgerId: gatePass.dispatchLedgerId._id ?? '',
    category: gatePass.category,
    billNumber: gatePass.billNumber != null ? String(gatePass.billNumber) : '',
    biltiNo: gatePass.bitliNumber != null ? String(gatePass.bitliNumber) : '',
    billBook: gatePass.billBook != null ? String(gatePass.billBook) : '',
    biltiBook: gatePass.biltiBook != null ? String(gatePass.biltiBook) : '',
    from: gatePass.from,
    to: gatePass.to,
    truckNumber: gatePass.truckNumber,
    bagSize: gatePassBagSizeToRows(gatePass.bagSize).map((row) => ({
      ...row,
      variety: findVarietyId(row.variety),
    })),
    netWeight: String(gatePass.netWeight),
    remarks: gatePass.remarks ?? '',
  };
}

export function createEmptyDispatchPreStorageFormValues(): DispatchPreStorageFormValues {
  return {
    manualGatePassNumber: '',
    date: new Date().toISOString(),
    dispatchLedgerId: '',
    category: '',
    billNumber: '',
    biltiNo: '',
    billBook: '',
    biltiBook: '',
    from: '',
    to: '',
    truckNumber: '',
    bagSize: createDefaultBagSizeRows(),
    netWeight: '',
    remarks: '',
  };
}

export function getDefaultBagSizeRowsFromGatePass(
  gatePass: NikasiGatePass,
): DispatchPreStorageFormValues['bagSize'] {
  return gatePassBagSizeToRows(gatePass.bagSize).map((row) => ({
    ...row,
    variety: findVarietyId(row.variety),
  }));
}

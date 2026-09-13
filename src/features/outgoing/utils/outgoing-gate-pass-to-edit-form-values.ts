import type { DaybookOutgoingEntry } from '@/features/daybook/api/types';
import type { EditOutgoingFormValues } from '@/features/outgoing/schemas/edit-outgoing-form-schema';

export function outgoingGatePassToEditFormValues(
  gatePass: DaybookOutgoingEntry,
): EditOutgoingFormValues {
  return {
    date: gatePass.date,
    manualGatePassNumber: gatePass.manualGatePassNumber,
    from: gatePass.from,
    to: gatePass.to,
    truckNumber: gatePass.truckNumber,
    category: gatePass.category ?? '',
    billNumber: gatePass.billNumber != null ? String(gatePass.billNumber) : '',
    biltiNumber: gatePass.biltiNumber != null ? String(gatePass.biltiNumber) : '',
    billBook: gatePass.billBook != null ? String(gatePass.billBook) : '',
    biltiBook: gatePass.biltiBook != null ? String(gatePass.biltiBook) : '',
    remarks: gatePass.remarks ?? '',
  };
}

import type { IncomingGatePass } from '@/features/incoming/api/types';
import type { IncomingFormValues } from '@/features/incoming/types';

function toIsoDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString();
}

export function incomingGatePassToFormValues(
  gatePass: IncomingGatePass,
  userId: string,
): IncomingFormValues {
  const farmerStorageLinkId =
    typeof gatePass.farmerStorageLinkId === 'string'
      ? gatePass.farmerStorageLinkId
      : (gatePass.farmerStorageLinkId._id ?? '');

  return {
    manualGatePassNumber: gatePass.manualGatePassNumber,
    truckNumber: gatePass.truckNumber,
    farmerStorageLinkId,
    createdBy: gatePass.createdBy._id ?? userId,
    variety: gatePass.variety,
    category: gatePass.category as IncomingFormValues['category'],
    stage: gatePass.stage ?? '',
    date: toIsoDateTime(gatePass.date),
    bagsReceived: gatePass.bagsReceived,
    weightSlip: gatePass.weightSlip ?? {
      slipNumber: '',
      grossWeightKg: 0,
      tareWeightKg: 0,
    },
    status: gatePass.status,
    remarks: gatePass.remarks ?? '',
  };
}

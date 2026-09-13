import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type {
  CreateIncomingGatePassBody,
  CreateIncomingGatePassInput,
  CreateIncomingGatePassResponse,
} from './types';

export function toCreateIncomingGatePassBody({
  form,
  gatePassNo,
}: CreateIncomingGatePassInput): CreateIncomingGatePassBody {
  const body: CreateIncomingGatePassBody = {
    farmerStorageLinkId: form.farmerStorageLinkId,
    gatePassNo,
    date: form.date,
    variety: form.variety,
    category: form.category,
    truckNumber: form.truckNumber,
    bagsReceived: form.bagsReceived,
    status: 'NOT_GRADED',
    weightSlip: {
      slipNumber: form.weightSlip.slipNumber.trim(),
      grossWeightKg: form.weightSlip.grossWeightKg,
      tareWeightKg: form.weightSlip.tareWeightKg,
    },
  };

  if (form.manualGatePassNumber != null) {
    body.manualGatePassNumber = form.manualGatePassNumber;
  }

  const stage = form.stage.trim();
  if (stage) {
    body.stage = stage;
  }

  const remarks = form.remarks.trim();
  if (remarks) {
    body.remarks = remarks;
  }

  return body;
}

export async function createIncomingGatePass(
  input: CreateIncomingGatePassInput,
): Promise<CreateIncomingGatePassResponse> {
  try {
    const { data } = await apiClient.post<CreateIncomingGatePassResponse>(
      '/incoming-gate-pass/',
      toCreateIncomingGatePassBody(input),
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to create incoming gate pass');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create incoming gate pass'), {
      cause: error,
    });
  }
}

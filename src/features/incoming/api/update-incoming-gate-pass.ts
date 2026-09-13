import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type {
  UpdateIncomingGatePassBody,
  UpdateIncomingGatePassInput,
  UpdateIncomingGatePassResponse,
} from './types';

export function toUpdateIncomingGatePassBody(
  form: UpdateIncomingGatePassInput['form'],
): UpdateIncomingGatePassBody {
  const body: UpdateIncomingGatePassBody = {
    manualGatePassNumber: form.manualGatePassNumber ?? null,
    truckNumber: form.truckNumber,
    date: form.date,
    farmerStorageLinkId: form.farmerStorageLinkId,
    variety: form.variety,
    category: form.category,
    stage: form.stage.trim(),
    bagsReceived: form.bagsReceived,
    weightSlip: {
      slipNumber: form.weightSlip.slipNumber.trim(),
      grossWeightKg: form.weightSlip.grossWeightKg,
      tareWeightKg: form.weightSlip.tareWeightKg,
    },
  };

  body.remarks = form.remarks.trim();

  return body;
}

export async function updateIncomingGatePass({
  id,
  form,
}: UpdateIncomingGatePassInput): Promise<UpdateIncomingGatePassResponse> {
  try {
    const { data } = await apiClient.put<UpdateIncomingGatePassResponse>(
      `/incoming-gate-pass/${id}`,
      toUpdateIncomingGatePassBody(form),
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to update incoming gate pass');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update incoming gate pass'), {
      cause: error,
    });
  }
}

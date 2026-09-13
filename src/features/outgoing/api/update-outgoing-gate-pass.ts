import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type {
  UpdateOutgoingGatePassBody,
  UpdateOutgoingGatePassInput,
  UpdateOutgoingGatePassResponse,
} from './types';

export function toUpdateOutgoingGatePassBody(
  form: UpdateOutgoingGatePassInput['form'],
): UpdateOutgoingGatePassBody {
  const body: UpdateOutgoingGatePassBody = {
    date: form.date,
    manualGatePassNumber: form.manualGatePassNumber ?? null,
    from: form.from.trim(),
    to: form.to.trim(),
    truckNumber: form.truckNumber.trim(),
    category: form.category.trim(),
    billNumber: Number(form.billNumber),
    biltiNumber: Number(form.biltiNumber),
    billBook: Number(form.billBook),
    biltiBook: Number(form.biltiBook),
  };

  const remarks = form.remarks.trim();
  if (remarks) {
    body.remarks = remarks;
  }

  return body;
}

export async function updateOutgoingGatePass({
  id,
  form,
}: UpdateOutgoingGatePassInput): Promise<UpdateOutgoingGatePassResponse> {
  try {
    const { data } = await apiClient.put<UpdateOutgoingGatePassResponse>(
      `/outgoing-gate-pass/${id}`,
      toUpdateOutgoingGatePassBody(form),
    );

    if (data.status !== 'Success') {
      throw new Error(data.message ?? 'Failed to update outgoing gate pass');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update outgoing gate pass'), {
      cause: error,
    });
  }
}

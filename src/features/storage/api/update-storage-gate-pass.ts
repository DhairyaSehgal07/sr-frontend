import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import { formQuantitiesToBagSizes } from './create-storage-gate-pass';
import type {
  UpdateStorageGatePassBody,
  UpdateStorageGatePassInput,
  UpdateStorageGatePassResponse,
} from './types';

export function toUpdateStorageGatePassBody(
  form: UpdateStorageGatePassInput['form'],
): UpdateStorageGatePassBody {
  const bagSizes = formQuantitiesToBagSizes(form.quantities);

  if (bagSizes.length === 0) {
    throw new Error('Enter at least one bag quantity.');
  }

  const body: UpdateStorageGatePassBody = {
    manualGatePassNumber: form.manualGatePassNumber ?? null,
    date: form.date,
    farmerStorageLinkId: form.farmerStorageLinkId,
    variety: form.variety,
    storageCategory: form.category,
    bagSizes,
  };

  const stage = form.stage.trim();
  if (stage) {
    body.stage = stage;
  }

  body.remarks = form.remarks.trim();

  return body;
}

function assertUpdateStorageGatePassResponse(data: UpdateStorageGatePassResponse): void {
  if (data.success === false) {
    throw new Error(data.message ?? 'Failed to update storage gate pass');
  }

  const status = data.status?.toLowerCase();
  if (status && status !== 'success' && status !== 'ok' && data.success !== true) {
    throw new Error(data.message ?? 'Failed to update storage gate pass');
  }
}

export async function updateStorageGatePass({
  id,
  form,
}: UpdateStorageGatePassInput): Promise<UpdateStorageGatePassResponse> {
  try {
    const { data } = await apiClient.put<UpdateStorageGatePassResponse>(
      `/storage-gate-pass/${id}`,
      toUpdateStorageGatePassBody(form),
    );

    assertUpdateStorageGatePassResponse(data);

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update storage gate pass'), {
      cause: error,
    });
  }
}

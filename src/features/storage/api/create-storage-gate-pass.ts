import type { StorageQuantityRow } from '@/features/storage/schemas/storage-quantities-schema';
import type { StorageFormValues } from '@/features/storage/types';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import type { BagType } from '@/lib/constants';

import type {
  CreateStorageGatePassBody,
  CreateStorageGatePassInput,
  CreateStorageGatePassResponse,
  StorageGatePassBagSize,
} from './types';

function isBagType(value: string): value is BagType {
  return value === 'JUTE' || value === 'LENO';
}

export function activeStorageQuantityRows(
  quantities: readonly StorageQuantityRow[],
): StorageQuantityRow[] {
  return quantities.filter((row) => (row.qty ?? 0) > 0);
}

export function formQuantitiesToBagSizes(
  quantities: StorageFormValues['quantities'],
): StorageGatePassBagSize[] {
  return activeStorageQuantityRows(quantities).map((row) => {
    const quantity = row.qty ?? 0;

    return {
      size: row.size,
      bagType: isBagType(row.bagType) ? row.bagType : 'JUTE',
      currentQuantity: quantity,
      initialQuantity: quantity,
      chamber: row.chamber,
      floor: row.floor,
      row: row.row,
    };
  });
}

export function toCreateStorageGatePassBody({
  form,
  gatePassNo,
}: CreateStorageGatePassInput): CreateStorageGatePassBody {
  const bagSizes = formQuantitiesToBagSizes(form.quantities);

  if (bagSizes.length === 0) {
    throw new Error('Enter at least one bag quantity.');
  }

  const body: CreateStorageGatePassBody = {
    farmerStorageLinkId: form.farmerStorageLinkId,
    gatePassNo,
    date: form.date,
    variety: form.variety,
    storageCategory: form.category,
    bagSizes,
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

function assertCreateStorageGatePassResponse(data: CreateStorageGatePassResponse): void {
  if (data.success === false) {
    throw new Error(data.message ?? 'Failed to create storage gate pass');
  }

  const status = data.status?.toLowerCase();
  if (status && status !== 'success' && status !== 'ok' && data.success !== true) {
    throw new Error(data.message ?? 'Failed to create storage gate pass');
  }
}

export async function createStorageGatePass(
  input: CreateStorageGatePassInput,
): Promise<CreateStorageGatePassResponse> {
  const body = toCreateStorageGatePassBody(input);

  try {
    const { data } = await apiClient.post<CreateStorageGatePassResponse>(
      '/storage-gate-pass/',
      body,
    );

    assertCreateStorageGatePassResponse(data);

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create storage gate pass'), {
      cause: error,
    });
  }
}

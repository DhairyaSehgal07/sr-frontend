import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { getHttpStatusFromError } from '@/lib/http-error';

import type {
  GetStorageGatePassesByFarmerResponse,
  StorageGatePassesByFarmerParams,
  StorageGatePassesByFarmerResult,
} from './types';

const EMPTY_RESULT: StorageGatePassesByFarmerResult = {
  storageGatePasses: [],
};

export function buildStorageGatePassesByFarmerParams(
  params: StorageGatePassesByFarmerParams,
): Record<string, string> {
  const query: Record<string, string> = {};

  if (params.sortOrder) query.sortOrder = params.sortOrder;

  return query;
}

export async function getStorageGatePassesByFarmer(
  farmerStorageLinkId: string,
  params: StorageGatePassesByFarmerParams = {},
): Promise<StorageGatePassesByFarmerResult> {
  try {
    const { data } = await apiClient.get<GetStorageGatePassesByFarmerResponse>(
      `/storage-gate-pass/farmer-storage-link/${farmerStorageLinkId}`,
      { params: buildStorageGatePassesByFarmerParams(params) },
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load storage gate passes for farmer');
    }

    return data.data;
  } catch (error) {
    if (getHttpStatusFromError(error) === 404) {
      return EMPTY_RESULT;
    }

    throw new Error(getApiErrorMessage(error, 'Failed to load storage gate passes for farmer'), {
      cause: error,
    });
  }
}

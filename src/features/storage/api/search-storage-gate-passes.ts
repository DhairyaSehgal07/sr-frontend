import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { getHttpStatusFromError } from '@/lib/http-error';

import type {
  SearchStorageGatePassBody,
  SearchStorageGatePassesResponse,
  StorageGatePassListResult,
} from './types';

const EMPTY_RESULT: StorageGatePassListResult = {
  storageGatePasses: [],
  pagination: {
    page: 1,
    limit: 0,
    total: 0,
    totalPages: 0,
  },
};

function toSearchListResult(
  storageGatePasses: StorageGatePassListResult['storageGatePasses'],
): StorageGatePassListResult {
  const total = storageGatePasses.length;

  return {
    storageGatePasses,
    pagination: {
      page: 1,
      limit: total,
      total,
      totalPages: 1,
    },
  };
}

export async function searchStorageGatePasses(
  body: SearchStorageGatePassBody,
): Promise<StorageGatePassListResult> {
  try {
    const { data } = await apiClient.post<SearchStorageGatePassesResponse>(
      '/storage-gate-pass/search',
      body,
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to search storage gate passes');
    }

    return toSearchListResult(data.data?.storageGatePasses ?? []);
  } catch (error) {
    if (getHttpStatusFromError(error) === 404) {
      return EMPTY_RESULT;
    }

    throw new Error(getApiErrorMessage(error, 'Failed to search storage gate passes'), {
      cause: error,
    });
  }
}

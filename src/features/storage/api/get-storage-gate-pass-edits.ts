import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { getHttpStatusFromError } from '@/lib/http-error';

import type {
  GetStorageGatePassEditsResponse,
  StorageGatePassEditsListParams,
  StorageGatePassEditsListResult,
} from './types';

const EMPTY_RESULT: StorageGatePassEditsListResult = {
  audits: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export function buildStorageGatePassEditsParams(
  params: StorageGatePassEditsListParams,
): Record<string, number> {
  const query: Record<string, number> = {};

  if (params.page != null) query.page = params.page;
  if (params.limit != null) query.limit = params.limit;

  return query;
}

export async function getStorageGatePassEdits(
  params: StorageGatePassEditsListParams = {},
): Promise<StorageGatePassEditsListResult> {
  try {
    const { data } = await apiClient.get<GetStorageGatePassEditsResponse>(
      '/storage-gate-pass/edits',
      { params: buildStorageGatePassEditsParams(params) },
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load storage gate pass edits');
    }

    return data.data;
  } catch (error) {
    if (getHttpStatusFromError(error) === 404) {
      return {
        ...EMPTY_RESULT,
        pagination: {
          ...EMPTY_RESULT.pagination,
          limit: params.limit ?? EMPTY_RESULT.pagination.limit,
        },
      };
    }

    throw new Error(getApiErrorMessage(error, 'Failed to load storage gate pass edits'), {
      cause: error,
    });
  }
}

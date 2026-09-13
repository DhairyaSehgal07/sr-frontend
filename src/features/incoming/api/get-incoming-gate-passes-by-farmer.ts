import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { getHttpStatusFromError } from '@/lib/http-error';

import type {
  GetIncomingGatePassesResponse,
  IncomingGatePassesByFarmerParams,
  IncomingGatePassListResult,
} from './types';

const EMPTY_RESULT: IncomingGatePassListResult = {
  incomingGatePasses: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export function buildIncomingGatePassesByFarmerParams(
  params: IncomingGatePassesByFarmerParams,
): Record<string, string> {
  const query: Record<string, string> = {};

  if (params.sortOrder) query.sortOrder = params.sortOrder;
  if (params.status) query.status = params.status;

  return query;
}

export async function getIncomingGatePassesByFarmer(
  farmerStorageLinkId: string,
  params: IncomingGatePassesByFarmerParams = {},
): Promise<IncomingGatePassListResult> {
  try {
    const { data } = await apiClient.get<GetIncomingGatePassesResponse>(
      `/incoming-gate-pass/farmer-storage-link/${farmerStorageLinkId}`,
      { params: buildIncomingGatePassesByFarmerParams(params) },
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load incoming gate passes for farmer');
    }

    return data.data;
  } catch (error) {
    if (getHttpStatusFromError(error) === 404) {
      return EMPTY_RESULT;
    }

    throw new Error(getApiErrorMessage(error, 'Failed to load incoming gate passes for farmer'), {
      cause: error,
    });
  }
}

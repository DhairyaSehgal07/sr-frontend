import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { getHttpStatusFromError } from '@/lib/http-error';

import type {
  GetIncomingGatePassesResponse,
  IncomingGatePassListParams,
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

export function buildIncomingGatePassListParams(
  params: IncomingGatePassListParams,
): Record<string, string | number> {
  const query: Record<string, string | number> = {};

  if (params.page != null) query.page = params.page;
  if (params.limit != null) query.limit = params.limit;
  if (params.sortOrder) query.sortOrder = params.sortOrder;
  if (params.gatePassNo != null) query.gatePassNo = params.gatePassNo;
  if (params.status) query.status = params.status;
  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;

  return query;
}

export async function getIncomingGatePasses(
  params: IncomingGatePassListParams = {},
): Promise<IncomingGatePassListResult> {
  try {
    const { data } = await apiClient.get<GetIncomingGatePassesResponse>('/incoming-gate-pass/', {
      params: buildIncomingGatePassListParams(params),
    });

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load incoming gate passes');
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

    throw new Error(getApiErrorMessage(error, 'Failed to load incoming gate passes'), {
      cause: error,
    });
  }
}

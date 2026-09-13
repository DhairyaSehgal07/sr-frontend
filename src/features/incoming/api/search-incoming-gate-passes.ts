import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { getHttpStatusFromError } from '@/lib/http-error';

import type {
  GetIncomingGatePassesResponse,
  IncomingGatePassListResult,
  SearchIncomingGatePassBody,
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

export async function searchIncomingGatePasses(
  body: SearchIncomingGatePassBody,
): Promise<IncomingGatePassListResult> {
  try {
    const { data } = await apiClient.post<GetIncomingGatePassesResponse>(
      '/incoming-gate-pass/search',
      body,
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to search incoming gate passes');
    }

    return data.data;
  } catch (error) {
    if (getHttpStatusFromError(error) === 404) {
      return EMPTY_RESULT;
    }

    throw new Error(getApiErrorMessage(error, 'Failed to search incoming gate passes'), {
      cause: error,
    });
  }
}

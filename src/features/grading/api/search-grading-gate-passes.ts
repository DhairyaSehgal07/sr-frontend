import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { getHttpStatusFromError } from '@/lib/http-error';

import type {
  GetGradingGatePassesResponse,
  GradingGatePassListResult,
  SearchGradingGatePassBody,
} from './types';

const EMPTY_RESULT: GradingGatePassListResult = {
  gradingGatePasses: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export async function searchGradingGatePasses(
  body: SearchGradingGatePassBody,
): Promise<GradingGatePassListResult> {
  try {
    const { data } = await apiClient.post<GetGradingGatePassesResponse>(
      '/grading-gate-pass/search',
      body,
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to search grading gate passes');
    }

    return data.data;
  } catch (error) {
    if (getHttpStatusFromError(error) === 404) {
      return EMPTY_RESULT;
    }

    throw new Error(getApiErrorMessage(error, 'Failed to search grading gate passes'), {
      cause: error,
    });
  }
}

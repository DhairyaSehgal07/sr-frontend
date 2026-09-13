import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { getHttpStatusFromError } from '@/lib/http-error';

import type { GetGradingGatePassByIdResponse, GradingGatePass } from './types';

export async function getGradingGatePassById(id: string): Promise<GradingGatePass | null> {
  try {
    const { data } = await apiClient.get<GetGradingGatePassByIdResponse>(
      `/grading-gate-pass/${id}`,
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load grading gate pass');
    }

    return data.data;
  } catch (error) {
    if (getHttpStatusFromError(error) === 404) {
      return null;
    }

    throw new Error(getApiErrorMessage(error, 'Failed to load grading gate pass'), {
      cause: error,
    });
  }
}

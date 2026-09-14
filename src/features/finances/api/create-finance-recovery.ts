import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { CreateFinanceRecoveryBody, CreateFinanceRecoveryResponse } from './types';

export async function createFinanceRecovery(
  body: CreateFinanceRecoveryBody,
): Promise<CreateFinanceRecoveryResponse> {
  try {
    const { data } = await apiClient.post<CreateFinanceRecoveryResponse>(
      '/finances/recoveries',
      body,
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to record recovery');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to record recovery'), { cause: error });
  }
}

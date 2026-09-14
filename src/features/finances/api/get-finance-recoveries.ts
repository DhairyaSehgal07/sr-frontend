import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import { buildFinanceListParams } from './list-params';
import type { FinanceListParams, FinanceRecovery, GetFinanceRecoveriesResponse } from './types';

export async function getFinanceRecoveries(
  params: FinanceListParams = {},
): Promise<FinanceRecovery[]> {
  try {
    const { data } = await apiClient.get<GetFinanceRecoveriesResponse>('/finances/recoveries', {
      params: buildFinanceListParams(params),
    });

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load recoveries');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load recoveries'), { cause: error });
  }
}

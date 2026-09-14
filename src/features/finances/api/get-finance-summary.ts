import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import { buildFinanceListParams } from './list-params';
import type { FinanceListParams, FinanceSummary, GetFinanceSummaryResponse } from './types';

export async function getFinanceSummary(
  params: FinanceListParams = {},
): Promise<FinanceSummary> {
  try {
    const { data } = await apiClient.get<GetFinanceSummaryResponse>('/finances/summary', {
      params: buildFinanceListParams(params),
    });

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load finance summary');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load finance summary'), { cause: error });
  }
}

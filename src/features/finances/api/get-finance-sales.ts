import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import { buildFinanceListParams } from './list-params';
import type { FinanceListParams, FinanceSale, GetFinanceSalesResponse } from './types';

export async function getFinanceSales(params: FinanceListParams = {}): Promise<FinanceSale[]> {
  try {
    const { data } = await apiClient.get<GetFinanceSalesResponse>('/finances/sales', {
      params: buildFinanceListParams(params),
    });

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load finance sales');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load finance sales'), { cause: error });
  }
}

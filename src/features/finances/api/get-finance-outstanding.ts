import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import { buildFinanceListParams } from './list-params';
import type {
  FinanceListParams,
  FinanceOutstanding,
  GetFinanceOutstandingResponse,
} from './types';

export async function getFinanceOutstanding(
  params: FinanceListParams = {},
): Promise<FinanceOutstanding[]> {
  try {
    const { data } = await apiClient.get<GetFinanceOutstandingResponse>('/finances/outstanding', {
      params: buildFinanceListParams(params),
    });

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load outstanding balances');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load outstanding balances'), {
      cause: error,
    });
  }
}

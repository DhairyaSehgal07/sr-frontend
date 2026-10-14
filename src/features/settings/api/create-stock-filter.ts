import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { MutateStockFilterResponse, StockFilterBody } from './stock-filter-types';

export async function createStockFilter(body: StockFilterBody): Promise<MutateStockFilterResponse> {
  try {
    const { data } = await apiClient.post<MutateStockFilterResponse>('/stock-filter', body);

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to create stock filter');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create stock filter'), { cause: error });
  }
}

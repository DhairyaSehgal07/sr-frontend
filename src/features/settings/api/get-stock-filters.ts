import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { GetStockFiltersResponse, StockFilterOption } from './stock-filter-types';

export async function getStockFilters(): Promise<StockFilterOption[]> {
  try {
    const { data } = await apiClient.get<GetStockFiltersResponse>('/stock-filter');

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load stock filters');
    }

    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load stock filters'), { cause: error });
  }
}

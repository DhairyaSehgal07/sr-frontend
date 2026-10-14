import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { MutateStockFilterResponse } from './stock-filter-types';

export async function deleteStockFilter(id: string): Promise<MutateStockFilterResponse> {
  try {
    const { data } = await apiClient.delete<MutateStockFilterResponse>(`/stock-filter/${id}`);

    if (data && data.success === false) {
      throw new Error(data.message ?? 'Failed to delete stock filter');
    }

    return data ?? { success: true, data: null };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete stock filter'), { cause: error });
  }
}

import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { MutateStockFilterResponse, UpdateStockFilterInput } from './stock-filter-types';

export async function updateStockFilter({
  id,
  body,
}: UpdateStockFilterInput): Promise<MutateStockFilterResponse> {
  try {
    const { data } = await apiClient.put<MutateStockFilterResponse>(`/stock-filter/${id}`, body);

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to update stock filter');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update stock filter'), { cause: error });
  }
}

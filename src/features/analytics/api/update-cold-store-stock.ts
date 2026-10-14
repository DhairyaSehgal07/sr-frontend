import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { MutateColdStoreStockResponse, UpdateColdStoreStockInput } from './types';

export async function updateColdStoreStock({
  id,
  body,
}: UpdateColdStoreStockInput): Promise<MutateColdStoreStockResponse> {
  try {
    const { data } = await apiClient.put<MutateColdStoreStockResponse>(
      `/cold-store-stock/${id}`,
      body,
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to update stock');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update stock'), { cause: error });
  }
}

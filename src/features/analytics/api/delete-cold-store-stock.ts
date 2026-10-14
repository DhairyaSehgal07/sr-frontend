import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { MutateColdStoreStockResponse } from './types';

export async function deleteColdStoreStock(id: string): Promise<MutateColdStoreStockResponse> {
  try {
    const { data } = await apiClient.delete<MutateColdStoreStockResponse>(
      `/cold-store-stock/${id}`,
    );

    if (data && data.success === false) {
      throw new Error(data.message ?? 'Failed to delete stock');
    }

    return data ?? { success: true, data: null };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete stock'), { cause: error });
  }
}

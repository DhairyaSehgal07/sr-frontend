import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { ColdStoreStockBody, MutateColdStoreStockResponse } from './types';

export async function createColdStoreStock(
  body: ColdStoreStockBody,
): Promise<MutateColdStoreStockResponse> {
  try {
    const { data } = await apiClient.post<MutateColdStoreStockResponse>('/cold-store-stock', body);

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to add stock');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to add stock'), { cause: error });
  }
}

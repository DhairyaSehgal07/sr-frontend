import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { ColdStoreStock, GetColdStoreStockResponse } from './types';

export async function getColdStoreStock(): Promise<ColdStoreStock[]> {
  try {
    const { data } = await apiClient.get<GetColdStoreStockResponse>('/cold-store-stock');

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load stock');
    }

    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load stock'), { cause: error });
  }
}

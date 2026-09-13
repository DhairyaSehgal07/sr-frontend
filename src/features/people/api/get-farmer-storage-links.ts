import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { FarmerStorageLink, FarmerStorageLinksResponse } from '../types';

export async function getFarmerStorageLinks(): Promise<FarmerStorageLink[]> {
  try {
    const { data } = await apiClient.get<FarmerStorageLinksResponse>('/farmer-storage-link');

    if (!data.success) {
      throw new Error('Failed to load people');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load people'), { cause: error });
  }
}

import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { AnalyticsDateParams } from '../types';

export type StorageBagTypeBreakdown = {
  bagType: string;
  initialQuantity: number;
  currentQuantity: number;
  quantityRemoved: number;
};

export type StorageSizeBreakdown = {
  size: string;
  initialQuantity: number;
  currentQuantity: number;
  quantityRemoved: number;
  byBagType: StorageBagTypeBreakdown[];
};

export type StorageVarietySummary = {
  variety: string;
  initialQuantity: number;
  currentQuantity: number;
  quantityRemoved: number;
  sizes: StorageSizeBreakdown[];
};

type StorageSummaryResponse = {
  success: boolean;
  data: StorageVarietySummary[];
  message?: string;
};

export function storageSummaryQueryKey(params: AnalyticsDateParams) {
  return ['analytics', 'storage-summary', params.dateFrom ?? null, params.dateTo ?? null] as const;
}

export async function getStorageSummary(
  params: AnalyticsDateParams = {},
): Promise<StorageVarietySummary[]> {
  const query: Record<string, string> = {};
  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;

  try {
    const { data } = await apiClient.get<StorageSummaryResponse>('/analytics/storage-summary', {
      params: query,
    });

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load storage summary');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load storage summary'), {
      cause: error,
    });
  }
}

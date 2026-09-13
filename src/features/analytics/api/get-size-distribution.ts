import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { AnalyticsDateParams } from '../types';

export type SizeDistributionSizeItem = {
  name: string;
  value: number;
};

export type SizeDistributionVarietyItem = {
  variety: string;
  sizes: SizeDistributionSizeItem[];
};

export type SizeDistributionData = {
  chartData: SizeDistributionVarietyItem[];
};

type SizeDistributionResponse = {
  success: boolean;
  data: unknown;
  message?: string;
};

function asRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is Record<string, unknown> => item !== null && typeof item === 'object',
  );
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeSizeDistributionData(data: unknown): SizeDistributionData {
  if (!data || typeof data !== 'object') {
    return { chartData: [] };
  }

  const chartData = asRecordArray((data as { chartData?: unknown }).chartData).map((item) => ({
    variety: String(item.variety ?? 'Unknown'),
    sizes: asRecordArray(item.sizes)
      .map((size) => ({
        name: String(size.name ?? ''),
        value: toNumber(size.value),
      }))
      .filter((size) => size.name),
  }));

  return { chartData };
}

export function sizeDistributionQueryKey(params: AnalyticsDateParams) {
  return [
    'analytics',
    'size-distribution',
    params.dateFrom ?? null,
    params.dateTo ?? null,
  ] as const;
}

export async function getSizeDistribution(
  params: AnalyticsDateParams = {},
): Promise<SizeDistributionData> {
  const query: Record<string, string> = {};
  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;

  try {
    const { data } = await apiClient.get<SizeDistributionResponse>('/analytics/size-distribution', {
      params: query,
    });

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load size distribution');
    }

    return normalizeSizeDistributionData(data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load size distribution'), {
      cause: error,
    });
  }
}

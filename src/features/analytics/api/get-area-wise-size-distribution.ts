import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { AnalyticsDateParams } from '../types';

export type AreaWiseSizeItem = {
  name: string;
  value: number;
};

export type AreaWiseAreaItem = {
  area: string;
  sizes: AreaWiseSizeItem[];
};

export type AreaWiseVarietyItem = {
  variety: string;
  areas: AreaWiseAreaItem[];
};

export type AreaWiseSizeDistributionData = {
  chartData: AreaWiseVarietyItem[];
};

type AreaWiseSizeDistributionResponse = {
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

export function normalizeAreaWiseSizeDistributionData(data: unknown): AreaWiseSizeDistributionData {
  if (!data || typeof data !== 'object') {
    return { chartData: [] };
  }

  const chartData = asRecordArray((data as { chartData?: unknown }).chartData).map((item) => ({
    variety: String(item.variety ?? 'Unknown'),
    areas: asRecordArray(item.areas)
      .map((area) => ({
        area: String(area.area ?? 'Unknown'),
        sizes: asRecordArray(area.sizes)
          .map((size) => ({
            name: String(size.name ?? ''),
            value: toNumber(size.value),
          }))
          .filter((size) => size.name),
      }))
      .filter((area) => area.area),
  }));

  return { chartData };
}

export function areaWiseSizeDistributionQueryKey(params: AnalyticsDateParams) {
  return [
    'analytics',
    'area-wise-size-distribution',
    params.dateFrom ?? null,
    params.dateTo ?? null,
  ] as const;
}

export async function getAreaWiseSizeDistribution(
  params: AnalyticsDateParams = {},
): Promise<AreaWiseSizeDistributionData> {
  const query: Record<string, string> = {};
  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;

  try {
    const { data } = await apiClient.get<AreaWiseSizeDistributionResponse>(
      '/analytics/area-wise-size-distribution',
      { params: query },
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load area-wise size distribution');
    }

    return normalizeAreaWiseSizeDistributionData(data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load area-wise size distribution'), {
      cause: error,
    });
  }
}

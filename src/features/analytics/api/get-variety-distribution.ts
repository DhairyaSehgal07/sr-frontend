import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { AnalyticsDateParams } from '../types';

export type VarietyDistributionChartItem = {
  name: string;
  value: number;
};

export type VarietyDistributionData = {
  chartData: VarietyDistributionChartItem[];
};

type VarietyDistributionResponse = {
  success: boolean;
  data: VarietyDistributionData;
  message?: string;
};

export function varietyDistributionQueryKey(params: AnalyticsDateParams) {
  return [
    'analytics',
    'variety-distribution',
    params.dateFrom ?? null,
    params.dateTo ?? null,
  ] as const;
}

export async function getVarietyDistribution(
  params: AnalyticsDateParams = {},
): Promise<VarietyDistributionData> {
  const query: Record<string, string> = {};
  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;

  try {
    const { data } = await apiClient.get<VarietyDistributionResponse>(
      '/analytics/variety-distribution',
      { params: query },
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load variety distribution');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load variety distribution'), {
      cause: error,
    });
  }
}

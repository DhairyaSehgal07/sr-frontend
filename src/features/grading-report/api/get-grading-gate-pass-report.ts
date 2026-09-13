import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { GetGradingGatePassReportResponse, GradingGatePassReportParams } from './types';

export function buildGradingGatePassReportParams(
  params: GradingGatePassReportParams,
): Record<string, string> {
  const query: Record<string, string> = {};

  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;

  return query;
}

export async function getGradingGatePassReport(
  params: GradingGatePassReportParams = {},
): Promise<GetGradingGatePassReportResponse> {
  try {
    const { data } = await apiClient.get<GetGradingGatePassReportResponse>(
      '/grading-gate-pass/report',
      { params: buildGradingGatePassReportParams(params) },
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load grading report');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load grading report'), {
      cause: error,
    });
  }
}

import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { GetStorageGatePassReportResponse, StorageGatePassReportParams } from './types';

export function buildStorageGatePassReportParams(
  params: StorageGatePassReportParams,
): Record<string, string> {
  const query: Record<string, string> = {};

  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;

  return query;
}

export async function getStorageGatePassReport(
  params: StorageGatePassReportParams = {},
): Promise<GetStorageGatePassReportResponse> {
  try {
    const { data } = await apiClient.get<GetStorageGatePassReportResponse>(
      '/storage-gate-pass/report',
      { params: buildStorageGatePassReportParams(params) },
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load storage report');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load storage report'), { cause: error });
  }
}

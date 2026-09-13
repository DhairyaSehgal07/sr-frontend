import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type {
  GetIncomingGatePassReportResponse,
  IncomingGatePassReportParams,
  IncomingGatePassReportResult,
} from './types';

export function buildIncomingGatePassReportParams(
  params: IncomingGatePassReportParams,
): Record<string, string> {
  const query: Record<string, string> = {};

  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;

  return query;
}

export async function getIncomingGatePassReport(
  params: IncomingGatePassReportParams = {},
): Promise<IncomingGatePassReportResult> {
  try {
    const { data } = await apiClient.get<GetIncomingGatePassReportResponse>(
      '/incoming-gate-pass/report',
      { params: buildIncomingGatePassReportParams(params) },
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load incoming report');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load incoming report'), { cause: error });
  }
}

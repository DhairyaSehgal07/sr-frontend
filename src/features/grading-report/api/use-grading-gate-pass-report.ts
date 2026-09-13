import { queryOptions, useQuery } from '@tanstack/react-query';

import { getGradingGatePassReport } from './get-grading-gate-pass-report';
import { gradingGatePassReportKeys } from './query-keys';
import type { GetGradingGatePassReportResponse, GradingGatePassReportParams } from './types';

export function gradingGatePassReportQueryOptions(params: GradingGatePassReportParams) {
  return queryOptions({
    queryKey: gradingGatePassReportKeys.list(params),
    queryFn: () => getGradingGatePassReport(params),
  });
}

export function useGradingGatePassReport(params: GradingGatePassReportParams) {
  return useQuery({
    ...gradingGatePassReportQueryOptions(params),
  });
}

export type { GetGradingGatePassReportResponse, GradingGatePassReportParams };

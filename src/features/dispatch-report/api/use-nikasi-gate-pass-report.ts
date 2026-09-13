import { queryOptions, useQuery } from '@tanstack/react-query';

import { getNikasiGatePassReport } from './get-nikasi-gate-pass-report';
import { nikasiGatePassReportKeys } from './query-keys';
import type { DispatchReportParams, DispatchReportResult } from './types';

export function nikasiGatePassReportQueryOptions(params: DispatchReportParams) {
  return queryOptions({
    queryKey: nikasiGatePassReportKeys.list(params),
    queryFn: () => getNikasiGatePassReport(params),
  });
}

export function useNikasiGatePassReport(params: DispatchReportParams = {}) {
  return useQuery({
    ...nikasiGatePassReportQueryOptions(params),
  });
}

export type { DispatchReportParams, DispatchReportResult };

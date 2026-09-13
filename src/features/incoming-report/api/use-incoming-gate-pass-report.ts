import { queryOptions, useQuery } from '@tanstack/react-query';

import { getIncomingGatePassReport } from './get-incoming-gate-pass-report';
import { incomingGatePassReportKeys } from './query-keys';
import type { IncomingGatePassReportParams, IncomingGatePassReportResult } from './types';

export function incomingGatePassReportQueryOptions(params: IncomingGatePassReportParams) {
  return queryOptions({
    queryKey: incomingGatePassReportKeys.list(params),
    queryFn: () => getIncomingGatePassReport(params),
  });
}

export function useIncomingGatePassReport(params: IncomingGatePassReportParams) {
  return useQuery({
    ...incomingGatePassReportQueryOptions(params),
  });
}

export type { IncomingGatePassReportParams, IncomingGatePassReportResult };

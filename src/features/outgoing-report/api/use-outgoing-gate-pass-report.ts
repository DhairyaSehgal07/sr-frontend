import { queryOptions, useQuery } from '@tanstack/react-query';

import { getOutgoingGatePassReport } from './get-outgoing-gate-pass-report';
import { outgoingGatePassReportKeys } from './query-keys';
import type { OutgoingReportParams, OutgoingReportResult } from './types';

export function outgoingGatePassReportQueryOptions(params: OutgoingReportParams) {
  return queryOptions({
    queryKey: outgoingGatePassReportKeys.list(params),
    queryFn: () => getOutgoingGatePassReport(params),
  });
}

export function useOutgoingGatePassReport(params: OutgoingReportParams = {}) {
  return useQuery({
    ...outgoingGatePassReportQueryOptions(params),
  });
}

export type { OutgoingReportParams, OutgoingReportResult };

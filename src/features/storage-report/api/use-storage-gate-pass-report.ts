import { queryOptions, useQuery } from '@tanstack/react-query';

import { getStorageGatePassReport } from './get-storage-gate-pass-report';
import { storageGatePassReportKeys } from './query-keys';
import type { GetStorageGatePassReportResponse, StorageGatePassReportParams } from './types';

export function storageGatePassReportQueryOptions(params: StorageGatePassReportParams) {
  return queryOptions({
    queryKey: storageGatePassReportKeys.list(params),
    queryFn: () => getStorageGatePassReport(params),
  });
}

export function useStorageGatePassReport(params: StorageGatePassReportParams) {
  return useQuery({
    ...storageGatePassReportQueryOptions(params),
  });
}

export type { GetStorageGatePassReportResponse, StorageGatePassReportParams };

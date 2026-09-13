import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useStorageGatePassReport } from '@/features/storage-report/api/use-storage-gate-pass-report';

import { getStorageSummary, storageSummaryQueryKey } from '../api/get-storage-summary';
import type { AnalyticsDateParams } from '../types';

import { AnalyticsStorageSummaryTable } from './analytics-storage-summary-table';
import { LocationWiseStorageAnalyticsCard } from './location-wise-storage-analytics';

type AnalyticsStorageTabProps = AnalyticsDateParams;

const AnalyticsStorageTab = ({ dateFrom, dateTo }: AnalyticsStorageTabProps) => {
  const params = useMemo(() => ({ dateFrom, dateTo }), [dateFrom, dateTo]);

  const storageSummaryQuery = useQuery({
    queryKey: storageSummaryQueryKey(params),
    queryFn: () => getStorageSummary(params),
  });

  const gatePassReportQuery = useStorageGatePassReport(params);

  return (
    <div className="flex flex-col gap-4">
      <AnalyticsStorageSummaryTable query={storageSummaryQuery} />
      <LocationWiseStorageAnalyticsCard query={gatePassReportQuery} />
    </div>
  );
};

export default AnalyticsStorageTab;

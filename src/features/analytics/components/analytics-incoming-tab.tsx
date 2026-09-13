import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { dailyMonthlyTrendQueryKey, getDailyMonthlyTrend } from '../api/get-daily-monthly-trend';
import {
  getVarietyDistribution,
  varietyDistributionQueryKey,
} from '../api/get-variety-distribution';
import type { AnalyticsDateParams } from '../types';

import { AnalyticsIncomingTrendChart } from './analytics-incoming-trend-chart';
import { AnalyticsIncomingVarietyChart } from './analytics-incoming-variety-chart';

type AnalyticsIncomingTabProps = AnalyticsDateParams;

const AnalyticsIncomingTab = ({ dateFrom, dateTo }: AnalyticsIncomingTabProps) => {
  const params = useMemo(() => ({ dateFrom, dateTo }), [dateFrom, dateTo]);

  const varietyDistributionQuery = useQuery({
    queryKey: varietyDistributionQueryKey(params),
    queryFn: () => getVarietyDistribution(params),
  });

  const dailyMonthlyTrendQuery = useQuery({
    queryKey: dailyMonthlyTrendQueryKey(params),
    queryFn: () => getDailyMonthlyTrend(params),
  });

  return (
    <div className="flex flex-col gap-4">
      <AnalyticsIncomingVarietyChart query={varietyDistributionQuery} />
      <AnalyticsIncomingTrendChart query={dailyMonthlyTrendQuery} />
    </div>
  );
};

export default AnalyticsIncomingTab;

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  areaWiseSizeDistributionQueryKey,
  getAreaWiseSizeDistribution,
} from '../api/get-area-wise-size-distribution';
import { getSizeDistribution, sizeDistributionQueryKey } from '../api/get-size-distribution';
import type { AnalyticsDateParams } from '../types';

import { AnalyticsGradingAreaWiseChart } from './analytics-grading-area-wise-chart';
import { AnalyticsGradingSizeChart } from './analytics-grading-size-chart';

type AnalyticsGradingTabProps = AnalyticsDateParams;

const AnalyticsGradingTab = ({ dateFrom, dateTo }: AnalyticsGradingTabProps) => {
  const params = useMemo(() => ({ dateFrom, dateTo }), [dateFrom, dateTo]);

  const sizeDistributionQuery = useQuery({
    queryKey: sizeDistributionQueryKey(params),
    queryFn: () => getSizeDistribution(params),
  });

  const areaWiseSizeDistributionQuery = useQuery({
    queryKey: areaWiseSizeDistributionQueryKey(params),
    queryFn: () => getAreaWiseSizeDistribution(params),
  });

  return (
    <div className="flex flex-col gap-4">
      <AnalyticsGradingSizeChart query={sizeDistributionQuery} />
      <AnalyticsGradingAreaWiseChart query={areaWiseSizeDistributionQuery} />
    </div>
  );
};

export default AnalyticsGradingTab;

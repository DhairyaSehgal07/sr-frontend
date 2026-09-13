import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Inbox,
  Boxes,
  Package,
  RefreshCw,
  Sprout,
  Truck,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { cn } from '@/lib/utils';

import type { AnalyticsDateParams } from '../types';

type AnalyticsOverview = {
  totalIncomingBags: number;
  totalIncomingWeight: number;
  totalUngradedBags: number;
  totalUngradedWeight: number;
  totalGradingBags: number;
  totalGradingWeight: number;
  totalBagsStored: number;
  totalBagsDispatched: number;
  totalOutgoingBags: number;
};

type AnalyticsOverviewResponse = {
  success: boolean;
  data: AnalyticsOverview;
  message?: string;
};

export type AnalyticsOverviewParams = AnalyticsDateParams;

type OverviewProps = AnalyticsDateParams;

type SummaryMetric = {
  label: string;
  value: string;
  supportingValue?: string;
  description: string;
  icon: LucideIcon;
};

function analyticsOverviewQueryKey(params: AnalyticsOverviewParams) {
  return ['analytics', 'overview', params.dateFrom ?? null, params.dateTo ?? null] as const;
}

const bagFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

const weightFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

async function getAnalyticsOverview(
  params: AnalyticsOverviewParams = {},
): Promise<AnalyticsOverview> {
  const query: Record<string, string> = {};
  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;

  try {
    const { data } = await apiClient.get<AnalyticsOverviewResponse>('/analytics/overview', {
      params: query,
    });

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load analytics overview');
    }

    return data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load analytics overview'), {
      cause: error,
    });
  }
}

function formatBags(value: number) {
  return bagFormatter.format(value);
}

function formatWeight(value: number) {
  return `${weightFormatter.format(value)} kg`;
}

function buildSummaryMetrics(data: AnalyticsOverview): SummaryMetric[] {
  return [
    {
      label: 'Bags received',
      value: formatBags(data.totalIncomingBags),
      supportingValue: `${formatWeight(data.totalIncomingWeight)} (excl bardana)`,
      description: 'Total bags received at inward gate pass',
      icon: Sprout,
    },
    {
      label: 'Ungraded bags',
      value: formatBags(data.totalUngradedBags),
      supportingValue: formatWeight(data.totalUngradedWeight),
      description: 'Bags still pending grading',
      icon: Inbox,
    },
    {
      label: 'Grading bags',
      value: formatBags(data.totalGradingBags),
      supportingValue: formatWeight(data.totalGradingWeight),
      description: 'Bags processed through grading',
      icon: Boxes,
    },
    {
      label: 'Bags stored',
      value: formatBags(data.totalBagsStored),
      description: 'Total bags moved into storage',
      icon: Package,
    },
    {
      label: 'Bags dispatched',
      value: formatBags(data.totalBagsDispatched),
      description: 'Total bags dispatched from storage',
      icon: Truck,
    },
    {
      label: 'Outgoing bags',
      value: formatBags(data.totalOutgoingBags),
      description: 'Total outward dispatch bags',
      icon: Truck,
    },
  ];
}

function SummaryCard({ metric }: { metric: SummaryMetric }) {
  const Icon = metric.icon;

  return (
    <Card size="sm" className={cn('card-hover gap-0')}>
      <CardHeader className="pb-2">
        <CardDescription className="transition-colors duration-200 group-hover/card:text-foreground/80">
          {metric.label}
        </CardDescription>
        <CardAction>
          <div
            className={cn(
              'flex size-9 items-center justify-center rounded-xl bg-primary/10',
              'transition-colors duration-200 group-hover/card:bg-primary/15',
            )}
          >
            <Icon
              className="size-4 text-primary transition-transform duration-200 group-hover/card:scale-105"
              aria-hidden
            />
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-1">
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{metric.value}</p>

          {metric.supportingValue ? (
            <p className="text-sm font-medium tabular-nums text-foreground/80">
              {metric.supportingValue}
            </p>
          ) : null}
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">{metric.description}</p>
      </CardContent>
    </Card>
  );
}

function SummaryCardSkeleton() {
  return (
    <Card size="sm" className="gap-0">
      <CardHeader className="pb-2">
        <CardDescription>
          <Skeleton className="h-4 w-28" />
        </CardDescription>
        <CardAction>
          <Skeleton className="size-9 rounded-xl" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-4 w-40" />
      </CardContent>
    </Card>
  );
}

function OverviewError({
  message,
  onRetry,
  isRetrying,
}: {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <CardDescription className="flex items-center gap-2 text-destructive">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          Analytics overview could not be loaded
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground">{message}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={cn('mr-2 size-4', isRetrying && 'animate-spin')} aria-hidden />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

const Overview = ({ dateFrom, dateTo }: OverviewProps) => {
  const params = useMemo(() => ({ dateFrom, dateTo }), [dateFrom, dateTo]);

  const { data, error, isError, isLoading, isFetching, refetch } = useQuery({
    queryKey: analyticsOverviewQueryKey(params),
    queryFn: () => getAnalyticsOverview(params),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <SummaryCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError && !data) {
    return (
      <OverviewError
        message={error.message}
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    );
  }

  const summaryMetrics = data ? buildSummaryMetrics(data) : [];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {summaryMetrics.map((metric) => (
        <SummaryCard key={metric.label} metric={metric} />
      ))}
    </div>
  );
};

export default Overview;

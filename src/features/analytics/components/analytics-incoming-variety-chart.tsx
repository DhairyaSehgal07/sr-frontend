import { useMemo } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { AlertCircle, PieChart as PieChartIcon, RefreshCw } from 'lucide-react';
import { Cell, Pie, PieChart } from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import type { VarietyDistributionData } from '../api/get-variety-distribution';
import { buildAnalyticsChartConfig, getAnalyticsChartColor } from '../lib/chart-palette';

const bagFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

type VarietySlice = {
  name: string;
  value: number;
  fill: string;
  percentage: number;
};

export function AnalyticsIncomingVarietyChart({
  query,
}: {
  query: UseQueryResult<VarietyDistributionData, Error>;
}) {
  const { data, error, isError, isLoading, isFetching, refetch } = query;

  const { pieData, chartConfig } = useMemo(() => {
    const raw = data?.chartData ?? [];
    const total = raw.reduce((sum, item) => sum + item.value, 0);
    const slices: VarietySlice[] = raw.map((item, index) => ({
      name: item.name,
      value: item.value,
      fill: getAnalyticsChartColor(index),
      percentage: total > 0 ? (item.value / total) * 100 : 0,
    }));

    const chartConfig = buildAnalyticsChartConfig(
      slices.map((slice) => ({ key: slice.name, label: slice.name })),
    );

    return { pieData: slices, chartConfig };
  }, [data?.chartData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="min-h-[220px] w-full rounded-lg sm:min-h-[280px]" />
        </CardContent>
      </Card>
    );
  }

  if (isError && data === undefined) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardDescription className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            Variety distribution could not be loaded
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground">{error.message}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={cn('mr-2 size-4', isFetching && 'animate-spin')} aria-hidden />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2 text-base font-semibold">
          <PieChartIcon className="size-5 text-primary" aria-hidden />
          Variety distribution
        </CardTitle>
        <CardDescription>
          Incoming bags by potato variety for the applied date range
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6">
        {pieData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No variety data for the selected date range.
          </p>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto min-h-[220px] w-full max-w-md sm:min-h-[280px] [&_.recharts-pie-label-text]:fill-foreground [&_.recharts-pie-label-text]:text-xs"
            >
              <PieChart accessibilityLayer margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      nameKey="name"
                      formatter={(value) => `${bagFormatter.format(Number(value))} bags`}
                    />
                  }
                />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="52%"
                  outerRadius="82%"
                  paddingAngle={2}
                  cornerRadius={4}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`}
                  labelLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.fill}
                      stroke="var(--background)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <ul className="grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {pieData.map((item) => (
                <li key={item.name} className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.fill }}
                    aria-hidden
                  />
                  <span className="min-w-0 text-foreground">
                    <span className="font-medium">{item.name}</span>
                    {': '}
                    <span className="tabular-nums">
                      {bagFormatter.format(item.value)} bags ({item.percentage.toFixed(1)}%)
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

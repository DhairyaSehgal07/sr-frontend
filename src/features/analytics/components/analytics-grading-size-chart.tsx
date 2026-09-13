import { useMemo } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { AlertCircle, PieChart as PieChartIcon, RefreshCw } from 'lucide-react';
import { Cell, Pie, PieChart } from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import type { SizeDistributionData } from '../api/get-size-distribution';
import { buildAnalyticsChartConfig, getAnalyticsChartColor } from '../lib/chart-palette';

const bagFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

type SizeSlice = {
  name: string;
  value: number;
  fill: string;
  percentage: number;
};

type VarietyChart = {
  variety: string;
  pieData: SizeSlice[];
  chartConfig: ChartConfig;
};

function buildVarietyCharts(chartData: SizeDistributionData['chartData']): VarietyChart[] {
  return chartData.map((item) => {
    const raw = item.sizes ?? [];
    const total = raw.reduce((sum, size) => sum + size.value, 0);
    const pieData: SizeSlice[] = raw.map((size, index) => ({
      name: size.name,
      value: size.value,
      fill: getAnalyticsChartColor(index),
      percentage: total > 0 ? (size.value / total) * 100 : 0,
    }));

    return {
      variety: item.variety,
      pieData,
      chartConfig: buildAnalyticsChartConfig(
        pieData.map((slice) => ({ key: slice.name, label: slice.name })),
      ),
    };
  });
}

export function AnalyticsGradingSizeChart({
  query,
}: {
  query: UseQueryResult<SizeDistributionData, Error>;
}) {
  const { data, error, isError, isLoading, isFetching, refetch } = query;

  const varietyCharts = useMemo(() => buildVarietyCharts(data?.chartData ?? []), [data?.chartData]);

  const hasAnyData = varietyCharts.some((item) => item.pieData.length > 0);
  const defaultTab = varietyCharts[0]?.variety ?? '';

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
            Size distribution could not be loaded
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
          Size distribution
        </CardTitle>
        <CardDescription>
          Grading bags by size for each variety in the applied date range
        </CardDescription>
      </CardHeader>

      <CardContent>
        {varietyCharts.length === 0 || !hasAnyData ? (
          <p className="text-sm text-muted-foreground">No size data for the selected date range.</p>
        ) : (
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="mb-4 flex h-auto w-full flex-nowrap justify-start overflow-x-auto">
              {varietyCharts.map(({ variety }) => (
                <TabsTrigger key={variety} value={variety} className="shrink-0 px-3 sm:px-4">
                  {variety}
                </TabsTrigger>
              ))}
            </TabsList>

            {varietyCharts.map(({ variety, pieData, chartConfig }) => (
              <TabsContent
                key={variety}
                value={variety}
                className="mt-0 space-y-4 outline-none sm:space-y-6"
              >
                {pieData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No size data for {variety}.</p>
                ) : (
                  <>
                    <ChartContainer
                      config={chartConfig}
                      className="mx-auto min-h-[220px] w-full max-w-md sm:min-h-[280px] [&_.recharts-pie-label-text]:fill-foreground [&_.recharts-pie-label-text]:text-xs"
                    >
                      <PieChart
                        accessibilityLayer
                        margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
                      >
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
                          label={({ name, percent }) =>
                            `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`
                          }
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
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

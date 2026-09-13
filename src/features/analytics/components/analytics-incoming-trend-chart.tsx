import { useMemo, useState } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { format, isValid, parseISO } from 'date-fns';
import { AlertCircle, Calendar, ChevronDown, ChevronUp, RefreshCw, TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import type {
  DailyMonthlyTrendData,
  DailyTrendChartSeries,
  MonthlyTrendChartSeries,
} from '../api/get-daily-monthly-trend';
import { getAnalyticsChartColor } from '../lib/chart-palette';

const bagFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

type TrendTab = 'daily' | 'monthly';

type PivotRow = {
  key: string;
  label: string;
  perSeries: Record<string, number>;
  total: number;
};

function formatTableDate(isoDate: string): string {
  const parsed = parseISO(isoDate);
  if (!isValid(parsed)) {
    const fallback = new Date(isoDate);
    if (!isValid(fallback)) return isoDate;
    return format(fallback, 'dd MMM yyyy');
  }
  return format(parsed, 'dd MMM yyyy');
}

function formatChartAxisDate(isoDate: string): string {
  const parsed = parseISO(isoDate);
  if (!isValid(parsed)) return '—';
  return format(parsed, 'd MMM');
}

function toSeriesChartKey(index: number): string {
  return `series${index}`;
}

function getDataPoints<T>(points: T[] | undefined): T[] {
  return Array.isArray(points) ? points : [];
}

function buildDailyRows(series: DailyTrendChartSeries[]): PivotRow[] {
  const allDates = new Set<string>();
  for (const item of series) {
    for (const point of getDataPoints(item.dataPoints)) {
      allDates.add(point.date);
    }
  }

  return [...allDates].sort().map((date) => {
    const perSeries: Record<string, number> = {};
    let total = 0;
    for (const item of series) {
      const match = getDataPoints(item.dataPoints).find((point) => point.date === date);
      const bags = Number(match?.bags ?? 0);
      perSeries[item.location] = bags;
      total += bags;
    }
    return { key: date, label: formatTableDate(date), perSeries, total };
  });
}

function buildMonthlyRows(series: MonthlyTrendChartSeries[]): PivotRow[] {
  const monthMap = new Map<string, { monthLabel: string }>();
  for (const item of series) {
    for (const point of getDataPoints(item.dataPoints)) {
      if (!monthMap.has(point.month)) {
        monthMap.set(point.month, { monthLabel: point.monthLabel });
      }
    }
  }

  return [...monthMap.keys()].sort().map((month) => {
    const perSeries: Record<string, number> = {};
    let total = 0;
    const monthLabel = monthMap.get(month)?.monthLabel ?? month;
    for (const item of series) {
      const match = getDataPoints(item.dataPoints).find((point) => point.month === month);
      const bags = Number(match?.bags ?? 0);
      perSeries[item.location] = bags;
      total += bags;
    }
    return { key: month, label: monthLabel, perSeries, total };
  });
}

function buildTotals(rows: PivotRow[], seriesKeys: string[]) {
  const perSeries: Record<string, number> = {};
  for (const key of seriesKeys) {
    perSeries[key] = rows.reduce((sum, row) => sum + Number(row.perSeries[key] ?? 0), 0);
  }
  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);
  return { perSeries, grandTotal };
}

export function AnalyticsIncomingTrendChart({
  query,
}: {
  query: UseQueryResult<DailyMonthlyTrendData, Error>;
}) {
  const [tab, setTab] = useState<TrendTab>('daily');
  const [showChart, setShowChart] = useState(false);
  const { data, error, isError, isLoading, isFetching, refetch } = query;

  const dailySeries = data?.daily.chartData ?? [];
  const monthlySeries = data?.monthly.chartData ?? [];

  const dailyLocations = useMemo(() => dailySeries.map((series) => series.location), [dailySeries]);

  const monthlyLocations = useMemo(
    () => monthlySeries.map((series) => series.location),
    [monthlySeries],
  );

  const dailyRows = useMemo(() => buildDailyRows(dailySeries), [dailySeries]);
  const monthlyRows = useMemo(() => buildMonthlyRows(monthlySeries), [monthlySeries]);

  const dailyTotals = useMemo(
    () => buildTotals(dailyRows, dailyLocations),
    [dailyRows, dailyLocations],
  );

  const monthlyTotals = useMemo(
    () => buildTotals(monthlyRows, monthlyLocations),
    [monthlyRows, monthlyLocations],
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
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
            Incoming daily breakdown could not be loaded
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
          <TrendingUp className="size-5 text-primary" aria-hidden />
          Incoming daily breakdown
        </CardTitle>
        <CardDescription>Bags received over time (daily and monthly)</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={tab} onValueChange={(value) => setTab(value as TrendTab)} className="w-full">
          <TabsList className="mb-4 grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-0 outline-none">
            <TrendBreakdownPanel
              rows={dailyRows}
              seriesKeys={dailyLocations}
              totals={dailyTotals}
              firstColumnLabel="Date"
              activityLabel="Daily activity"
              showChart={showChart}
              onToggleChart={() => setShowChart((current) => !current)}
              xDataKey="key"
              tickFormatter={(value) => formatChartAxisDate(String(value))}
              labelFormatter={(value) => formatTableDate(String(value))}
            />
          </TabsContent>

          <TabsContent value="monthly" className="mt-0 outline-none">
            <TrendBreakdownPanel
              rows={monthlyRows}
              seriesKeys={monthlyLocations}
              totals={monthlyTotals}
              firstColumnLabel="Month"
              activityLabel="Monthly activity"
              showChart={showChart}
              onToggleChart={() => setShowChart((current) => !current)}
              xDataKey="label"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TrendBreakdownPanel({
  rows,
  seriesKeys,
  totals,
  firstColumnLabel,
  activityLabel,
  showChart,
  onToggleChart,
  xDataKey,
  tickFormatter,
  labelFormatter,
}: {
  rows: PivotRow[];
  seriesKeys: string[];
  totals: { perSeries: Record<string, number>; grandTotal: number };
  firstColumnLabel: string;
  activityLabel: string;
  showChart: boolean;
  onToggleChart: () => void;
  xDataKey: 'key' | 'label';
  tickFormatter?: (value: string | number) => string;
  labelFormatter?: (value: string | number) => string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No data for the selected date range.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Calendar className="size-4 text-primary" aria-hidden />
          {activityLabel}
        </h3>

        <div className="relative w-full overflow-auto rounded-lg border border-border sm:max-h-[320px]">
          <Table>
            <TableHeader className="border-b border-border bg-muted/50">
              <TableRow className="hover:bg-muted/50">
                <TableHead className="h-10 px-3 font-medium whitespace-nowrap text-muted-foreground">
                  {firstColumnLabel}
                </TableHead>
                {seriesKeys.map((seriesKey) => (
                  <TableHead
                    key={seriesKey}
                    className="h-10 px-3 text-right font-medium whitespace-nowrap text-muted-foreground"
                    title={seriesKey}
                  >
                    <span className="block max-w-[10rem] truncate sm:max-w-none">{seriesKey}</span>
                  </TableHead>
                ))}
                <TableHead className="h-10 px-3 text-right font-medium whitespace-nowrap text-muted-foreground">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.key}
                  className="border-b border-border transition-colors hover:bg-muted/50"
                >
                  <TableCell className="px-3 py-2.5 font-medium whitespace-nowrap text-foreground">
                    {row.label}
                  </TableCell>
                  {seriesKeys.map((seriesKey) => (
                    <TableCell
                      key={`${row.key}-${seriesKey}`}
                      className="px-3 py-2.5 text-right tabular-nums text-foreground"
                    >
                      {bagFormatter.format(Number(row.perSeries[seriesKey] ?? 0))}
                    </TableCell>
                  ))}
                  <TableCell className="bg-primary/10 px-3 py-2.5 text-right text-sm font-medium tabular-nums text-primary">
                    {bagFormatter.format(row.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="border-t border-border bg-muted/30 hover:bg-muted/30">
                <TableCell className="px-3 py-2.5 font-medium text-foreground">Bag total</TableCell>
                {seriesKeys.map((seriesKey) => (
                  <TableCell
                    key={`total-${seriesKey}`}
                    className="px-3 py-2.5 text-right text-sm font-medium tabular-nums text-foreground"
                  >
                    {bagFormatter.format(totals.perSeries[seriesKey] ?? 0)}
                  </TableCell>
                ))}
                <TableCell className="bg-primary/10 px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-primary">
                  {bagFormatter.format(totals.grandTotal)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={onToggleChart}
          aria-expanded={showChart}
        >
          {showChart ? (
            <ChevronUp className="mr-2 size-4" aria-hidden />
          ) : (
            <ChevronDown className="mr-2 size-4" aria-hidden />
          )}
          {showChart ? 'Hide trend chart' : 'Show trend chart'}
        </Button>

        {showChart ? (
          <TrendMultiLineChart
            rows={rows}
            seriesKeys={seriesKeys}
            xDataKey={xDataKey}
            tickFormatter={tickFormatter}
            labelFormatter={labelFormatter}
          />
        ) : null}
      </div>
    </div>
  );
}

function TrendMultiLineChart({
  rows,
  seriesKeys,
  xDataKey,
  tickFormatter,
  labelFormatter,
}: {
  rows: PivotRow[];
  seriesKeys: string[];
  xDataKey: 'key' | 'label';
  tickFormatter?: (value: string | number) => string;
  labelFormatter?: (value: string | number) => string;
}) {
  const { chartData, chartConfig } = useMemo(() => {
    const config: ChartConfig = {};
    const data = rows.map((row) => {
      const point: Record<string, string | number> = {
        axisLabel: xDataKey === 'key' ? row.key : row.label,
      };
      seriesKeys.forEach((seriesKey, index) => {
        const chartKey = toSeriesChartKey(index);
        config[chartKey] = {
          label: seriesKey,
          color: getAnalyticsChartColor(index),
        };
        point[chartKey] = Number(row.perSeries[seriesKey] ?? 0);
      });
      return point;
    });
    return { chartData: data, chartConfig: config };
  }, [rows, seriesKeys, xDataKey]);

  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[280px] w-full [&_.recharts-cartesian-grid_line]:stroke-border/60"
    >
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{ left: 8, right: 12, top: 12, bottom: 8 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="4 4" />
        <XAxis
          dataKey="axisLabel"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={tickFormatter}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => bagFormatter.format(Number(value))}
          width={48}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={
                labelFormatter ? (value) => labelFormatter(String(value)) : (value) => String(value)
              }
              formatter={(value) => (
                <span className="tabular-nums font-medium text-foreground">
                  {bagFormatter.format(Number(value))} bags
                </span>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {seriesKeys.map((_, index) => {
          const chartKey = toSeriesChartKey(index);
          return (
            <Line
              key={chartKey}
              type="monotone"
              dataKey={chartKey}
              stroke={`var(--color-${chartKey})`}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={{
                fill: 'var(--background)',
                stroke: `var(--color-${chartKey})`,
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                fill: `var(--color-${chartKey})`,
                stroke: 'var(--background)',
                strokeWidth: 2,
                r: 6,
              }}
            />
          );
        })}
      </LineChart>
    </ChartContainer>
  );
}

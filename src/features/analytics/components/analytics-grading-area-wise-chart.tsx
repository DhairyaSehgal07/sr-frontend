import { useMemo, useState } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { AlertCircle, ChevronDown, ChevronUp, Layers, MapPin, RefreshCw } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

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
  AreaWiseSizeDistributionData,
  AreaWiseVarietyItem,
} from '../api/get-area-wise-size-distribution';
import { getAnalyticsChartColor } from '../lib/chart-palette';
import { orderGradingSizeNames } from '../lib/grading-size-order';

const bagFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

type AreaTableRow = {
  area: string;
  values: Record<string, number>;
  total: number;
};

function toSizeChartKey(index: number): string {
  return `size${index}`;
}

function buildAreaTable(varietyItem: AreaWiseVarietyItem) {
  const sizeNames = orderGradingSizeNames(
    varietyItem.areas.flatMap((area) => area.sizes.map((size) => size.name)),
  );

  const rows: AreaTableRow[] = varietyItem.areas.map((area) => {
    const bySize = new Map(area.sizes.map((size) => [size.name, size.value]));
    const values: Record<string, number> = {};
    for (const sizeName of sizeNames) {
      values[sizeName] = Number(bySize.get(sizeName) ?? 0);
    }
    const total = area.sizes.reduce((sum, size) => sum + size.value, 0);
    return { area: area.area, values, total };
  });

  const totals: Record<string, number> = {};
  for (const sizeName of sizeNames) {
    totals[sizeName] = rows.reduce((sum, row) => sum + Number(row.values[sizeName] ?? 0), 0);
  }
  const varietyTotal = rows.reduce((sum, row) => sum + row.total, 0);

  return { sizeNames, rows, totals, varietyTotal };
}

function buildStackedBarData(
  rows: AreaTableRow[],
  sizeNames: string[],
): { data: Array<Record<string, string | number>>; config: ChartConfig } {
  const config: ChartConfig = {};
  const data = rows.map((row) => {
    const point: Record<string, string | number> = {
      area: row.area,
    };
    for (const [index, sizeName] of sizeNames.entries()) {
      const chartKey = toSizeChartKey(index);
      config[chartKey] = {
        label: sizeName,
        color: getAnalyticsChartColor(index),
      };
      point[chartKey] = Number(row.values[sizeName] ?? 0);
    }
    return point;
  });
  return { data, config };
}

function VarietyAreaPanel({
  varietyItem,
  showChart,
  onToggleChart,
}: {
  varietyItem: AreaWiseVarietyItem;
  showChart: boolean;
  onToggleChart: () => void;
}) {
  const { sizeNames, rows, totals, varietyTotal } = useMemo(
    () => buildAreaTable(varietyItem),
    [varietyItem],
  );

  const { data: barData, config: barConfig } = useMemo(
    () => buildStackedBarData(rows, sizeNames),
    [rows, sizeNames],
  );

  if (sizeNames.length === 0) {
    return <p className="text-sm text-muted-foreground">No size data for {varietyItem.variety}.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Layers className="size-4 shrink-0 text-primary" aria-hidden />
        <span className="text-foreground">
          {rows.length} area{rows.length === 1 ? '' : 's'}
        </span>
        <span aria-hidden>·</span>
        <span className="tabular-nums font-medium text-foreground">
          {bagFormatter.format(varietyTotal)} total bags
        </span>
      </p>

      <div className="relative w-full overflow-auto rounded-lg border border-border sm:max-h-[360px]">
        <Table>
          <TableHeader className="border-b border-border bg-muted/50">
            <TableRow className="hover:bg-muted/50">
              <TableHead className="h-10 px-3 font-medium whitespace-nowrap text-muted-foreground">
                Area
              </TableHead>
              {sizeNames.map((sizeName) => (
                <TableHead
                  key={sizeName}
                  className="h-10 px-3 text-right font-medium whitespace-nowrap text-muted-foreground"
                  title={sizeName}
                >
                  <span className="block max-w-40 truncate sm:max-w-none">{sizeName}</span>
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
                key={row.area}
                className="border-b border-border transition-colors hover:bg-muted/50"
              >
                <TableCell className="max-w-48 px-3 py-2.5 font-medium whitespace-nowrap text-foreground">
                  <span className="block truncate" title={row.area}>
                    {row.area || '—'}
                  </span>
                </TableCell>
                {sizeNames.map((sizeName) => (
                  <TableCell
                    key={`${row.area}-${sizeName}`}
                    className="px-3 py-2.5 text-right tabular-nums text-foreground"
                  >
                    {bagFormatter.format(Number(row.values[sizeName] ?? 0))}
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
              {sizeNames.map((sizeName) => (
                <TableCell
                  key={`total-${sizeName}`}
                  className="px-3 py-2.5 text-right text-sm font-medium tabular-nums text-foreground"
                >
                  {bagFormatter.format(totals[sizeName] ?? 0)}
                </TableCell>
              ))}
              <TableCell className="bg-primary/10 px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-primary">
                {bagFormatter.format(varietyTotal)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
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
          {showChart ? 'Hide area chart' : 'Show area chart'}
        </Button>

        {showChart && rows.length > 0 ? (
          <ChartContainer
            config={barConfig}
            className="min-h-[300px] w-full [&_.recharts-cartesian-grid_line]:stroke-border/60"
          >
            <BarChart
              accessibilityLayer
              data={barData}
              margin={{ left: 8, right: 12, top: 12, bottom: 48 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis
                dataKey="area"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={0}
                angle={-32}
                textAnchor="end"
                height={72}
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
                    labelKey="area"
                    formatter={(value) => (
                      <span className="tabular-nums font-medium text-foreground">
                        {bagFormatter.format(Number(value))} bags
                      </span>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              {sizeNames.map((_, index) => {
                const chartKey = toSizeChartKey(index);
                return (
                  <Bar
                    key={chartKey}
                    dataKey={chartKey}
                    stackId="bags"
                    fill={`var(--color-${chartKey})`}
                    radius={index === sizeNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                );
              })}
            </BarChart>
          </ChartContainer>
        ) : null}
      </div>
    </div>
  );
}

export function AnalyticsGradingAreaWiseChart({
  query,
}: {
  query: UseQueryResult<AreaWiseSizeDistributionData, Error>;
}) {
  const [showChart, setShowChart] = useState(false);
  const { data, error, isError, isLoading, isFetching, refetch } = query;

  const chartData = data?.chartData ?? [];
  const hasData = chartData.length > 0 && chartData.some((item) => item.areas.length > 0);
  const defaultTab = chartData[0]?.variety ?? '';

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-3">
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
            Area-wise size distribution could not be loaded
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
          <MapPin className="size-5 text-primary" aria-hidden />
          Area-wise size distribution
        </CardTitle>
        <CardDescription>Grading bags by farmer area and size for each variety</CardDescription>
      </CardHeader>

      <CardContent>
        {!hasData ? (
          <p className="text-sm text-muted-foreground">
            No area-wise data for the selected date range.
          </p>
        ) : (
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="mb-4 flex h-auto w-full flex-nowrap justify-start overflow-x-auto">
              {chartData.map(({ variety }) => (
                <TabsTrigger key={variety} value={variety} className="shrink-0 px-3 sm:px-4">
                  {variety}
                </TabsTrigger>
              ))}
            </TabsList>

            {chartData.map((varietyItem) => (
              <TabsContent
                key={varietyItem.variety}
                value={varietyItem.variety}
                className="mt-0 outline-none"
              >
                <VarietyAreaPanel
                  varietyItem={varietyItem}
                  showChart={showChart}
                  onToggleChart={() => setShowChart((current) => !current)}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

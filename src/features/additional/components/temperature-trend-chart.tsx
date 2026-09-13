import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

export type TemperatureChartPoint = {
  label: string;
  values: Record<string, number>;
};

type TemperatureTrendChartProps = {
  chamberIds: readonly string[];
  data: TemperatureChartPoint[];
};

const CHART_COLOR_COUNT = 8;

function getChamberChartColor(index: number): string {
  return `var(--chart-${(index % CHART_COLOR_COUNT) + 1})`;
}

function toChamberChartKey(index: number): string {
  return `chamber${index}`;
}

const temperatureFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formatTemperature(value: number) {
  return `${temperatureFormatter.format(value)}°F`;
}

export function TemperatureTrendChart({ chamberIds, data }: TemperatureTrendChartProps) {
  const { chartData, chartConfig } = useMemo(() => {
    const config: ChartConfig = {};

    for (const [index, chamberId] of chamberIds.entries()) {
      const chartKey = toChamberChartKey(index);
      config[chartKey] = {
        label: `Chamber ${chamberId}`,
        color: getChamberChartColor(index),
      };
    }

    const points = data.map((point) => {
      const row: Record<string, string | number | null> = {
        axisLabel: point.label,
      };

      for (const [index, chamberId] of chamberIds.entries()) {
        const chartKey = toChamberChartKey(index);
        row[chartKey] = point.values[chamberId] ?? null;
      }

      return row;
    });

    return { chartData: points, chartConfig: config };
  }, [chamberIds, data]);

  const yDomain = useMemo(() => {
    const allValues = data.flatMap((point) =>
      chamberIds
        .map((chamberId) => point.values[chamberId])
        .filter((value): value is number => value != null),
    );

    if (allValues.length === 0) {
      return [30, 50] as const;
    }

    const min = Math.min(...allValues, 30);
    const max = Math.max(...allValues, 50);
    const padding = Math.max((max - min) * 0.08, 0.5);

    return [min - padding, max + padding] as const;
  }, [chamberIds, data]);

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="border-b border-border/60">
        <div className="space-y-1">
          <CardTitle className="font-heading text-base font-semibold text-foreground">
            Temperature trend
          </CardTitle>
          <CardDescription>
            Each colored line is one chamber. Hover a point to see the exact reading; the vertical
            axis shows temperature in °F.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            No trend data to display.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="min-h-[280px] w-full [&_.recharts-cartesian-grid_line]:stroke-border/60"
          >
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 4, right: 12, top: 12, bottom: 20 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis
                dataKey="axisLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                label={{
                  value: 'Reading date',
                  position: 'insideBottom',
                  offset: -2,
                  className: 'fill-muted-foreground text-xs',
                }}
              />
              <YAxis
                domain={yDomain}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={48}
                tickFormatter={(value) => temperatureFormatter.format(Number(value))}
                label={{
                  value: '°F',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 4,
                  className: 'fill-muted-foreground text-xs font-medium',
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => String(payload?.[0]?.payload?.axisLabel ?? '')}
                    formatter={(value, name) => {
                      const chartKey = String(name);
                      const chamberLabel = chartConfig[chartKey]?.label ?? chartKey;

                      return (
                        <>
                          <div
                            className="size-2.5 shrink-0 rounded-[2px]"
                            style={{
                              backgroundColor: `var(--color-${chartKey})`,
                            }}
                          />
                          <div className="flex flex-1 items-center justify-between gap-4 leading-none">
                            <span className="text-muted-foreground">{chamberLabel}</span>
                            <span className="tabular-nums font-medium text-foreground">
                              {formatTemperature(Number(value))}
                            </span>
                          </div>
                        </>
                      );
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent className="flex-wrap gap-x-4 gap-y-2" />} />
              {chamberIds.map((chamberId, index) => {
                const chartKey = toChamberChartKey(index);

                return (
                  <Line
                    key={chamberId}
                    type="monotone"
                    dataKey={chartKey}
                    name={chartKey}
                    stroke={`var(--color-${chartKey})`}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    connectNulls
                    dot={{
                      fill: 'var(--background)',
                      stroke: `var(--color-${chartKey})`,
                      strokeWidth: 2,
                      r: 3.5,
                    }}
                    activeDot={{
                      fill: `var(--color-${chartKey})`,
                      stroke: 'var(--background)',
                      strokeWidth: 2,
                      r: 5,
                    }}
                  />
                );
              })}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

import type { ChartConfig } from '@/components/ui/chart';

/** Matches `--chart-1` … `--chart-8` in `index.css`. */
export const ANALYTICS_CHART_COLOR_COUNT = 8;

export function getAnalyticsChartColor(index: number): string {
  return `var(--chart-${(index % ANALYTICS_CHART_COLOR_COUNT) + 1})`;
}

export function buildAnalyticsChartConfig(
  entries: Array<{ key: string; label: string }>,
): ChartConfig {
  const config: ChartConfig = {};
  for (const [index, entry] of entries.entries()) {
    config[entry.key] = {
      label: entry.label,
      color: getAnalyticsChartColor(index),
    };
  }
  return config;
}

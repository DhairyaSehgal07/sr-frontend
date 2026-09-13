import apiClient, { getApiErrorMessage } from '@/lib/api-client';

import type { AnalyticsDateParams } from '../types';

export type DailyTrendChartItem = {
  date: string;
  bags: number;
};

export type MonthlyTrendChartItem = {
  month: string;
  monthLabel: string;
  bags: number;
};

export type DailyTrendChartSeries = {
  location: string;
  dataPoints: DailyTrendChartItem[];
};

export type MonthlyTrendChartSeries = {
  location: string;
  dataPoints: MonthlyTrendChartItem[];
};

export type DailyMonthlyTrendData = {
  daily: { chartData: DailyTrendChartSeries[] };
  monthly: { chartData: MonthlyTrendChartSeries[] };
};

type DailyMonthlyTrendResponse = {
  success: boolean;
  data: unknown;
  message?: string;
};

const DEFAULT_DAILY_SERIES_LABEL = 'Bags received';
const DEFAULT_MONTHLY_SERIES_LABEL = 'Bags received';

function asRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is Record<string, unknown> => item !== null && typeof item === 'object',
  );
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMonthLabel(month: string): string {
  const [year, monthPart] = month.split('-');
  if (!year || !monthPart) return month;
  const date = new Date(Number(year), Number(monthPart) - 1, 1);
  if (Number.isNaN(date.getTime())) return month;
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

/** Kapur: flat `{ date, bags }[]`. Bhatti: `{ location, dataPoints[] }[]`. */
export function normalizeDailyChartData(chartData: unknown): DailyTrendChartSeries[] {
  const items = asRecordArray(chartData);
  if (items.length === 0) return [];

  const first = items[0];

  if (Array.isArray(first.dataPoints)) {
    return items
      .map((item) => ({
        location: String(item.location ?? item.name ?? 'Unknown'),
        dataPoints: asRecordArray(item.dataPoints)
          .map((point) => ({
            date: String(point.date ?? ''),
            bags: toNumber(point.bags ?? point.value),
          }))
          .filter((point) => point.date),
      }))
      .filter((series) => series.dataPoints.length > 0);
  }

  if ('date' in first) {
    const dataPoints = items
      .map((item) => ({
        date: String(item.date ?? ''),
        bags: toNumber(item.bags ?? item.value),
      }))
      .filter((point) => point.date);

    return dataPoints.length > 0 ? [{ location: DEFAULT_DAILY_SERIES_LABEL, dataPoints }] : [];
  }

  return [];
}

/** Kapur: flat `{ month, monthLabel?, bags }[]`. Bhatti: `{ location, dataPoints[] }[]`. */
export function normalizeMonthlyChartData(chartData: unknown): MonthlyTrendChartSeries[] {
  const items = asRecordArray(chartData);
  if (items.length === 0) return [];

  const first = items[0];

  if (Array.isArray(first.dataPoints)) {
    return items
      .map((item) => ({
        location: String(item.location ?? item.name ?? 'Unknown'),
        dataPoints: asRecordArray(item.dataPoints)
          .map((point) => {
            const month = String(point.month ?? '');
            return {
              month,
              monthLabel: String(point.monthLabel ?? formatMonthLabel(month)),
              bags: toNumber(point.bags ?? point.value),
            };
          })
          .filter((point) => point.month),
      }))
      .filter((series) => series.dataPoints.length > 0);
  }

  if ('month' in first) {
    const dataPoints = items
      .map((item) => {
        const month = String(item.month ?? '');
        return {
          month,
          monthLabel: String(item.monthLabel ?? formatMonthLabel(month)),
          bags: toNumber(item.bags ?? item.value),
        };
      })
      .filter((point) => point.month);

    return dataPoints.length > 0 ? [{ location: DEFAULT_MONTHLY_SERIES_LABEL, dataPoints }] : [];
  }

  return [];
}

export function normalizeDailyMonthlyTrendData(data: unknown): DailyMonthlyTrendData {
  if (!data || typeof data !== 'object') {
    return { daily: { chartData: [] }, monthly: { chartData: [] } };
  }

  const payload = data as {
    daily?: { chartData?: unknown };
    monthly?: { chartData?: unknown };
  };

  return {
    daily: {
      chartData: normalizeDailyChartData(payload.daily?.chartData),
    },
    monthly: {
      chartData: normalizeMonthlyChartData(payload.monthly?.chartData),
    },
  };
}

export function dailyMonthlyTrendQueryKey(params: AnalyticsDateParams) {
  return [
    'analytics',
    'daily-monthly-trend',
    params.dateFrom ?? null,
    params.dateTo ?? null,
  ] as const;
}

export async function getDailyMonthlyTrend(
  params: AnalyticsDateParams = {},
): Promise<DailyMonthlyTrendData> {
  const query: Record<string, string> = {};
  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;

  try {
    const { data } = await apiClient.get<DailyMonthlyTrendResponse>(
      '/analytics/daily-monthly-trend',
      { params: query },
    );

    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load daily monthly trend');
    }

    return normalizeDailyMonthlyTrendData(data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load daily monthly trend'), {
      cause: error,
    });
  }
}

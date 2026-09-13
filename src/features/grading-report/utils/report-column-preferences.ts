import type { ColumnDef, ColumnOrderState, ColumnVisibilityState } from '@tanstack/react-table';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';

const STORAGE_KEY = 'grading-report:column-preferences:v1';

type StoredColumnPreferences = {
  version: 1;
  hiddenColumnIds: string[];
  columnOrder: string[];
};

export type GradingReportColumnState = {
  columnVisibility: ColumnVisibilityState;
  columnOrder: ColumnOrderState;
};

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getColumnId(column: ColumnDef<ReportFeatures, Record<string, unknown>>, index: number) {
  const candidate = column as {
    id?: string;
    accessorKey?: string | number | symbol;
  };

  if (candidate.id) return candidate.id;
  if (candidate.accessorKey != null) return String(candidate.accessorKey);
  return `col-${index}`;
}

function getLeafColumnIds(columns: ColumnDef<ReportFeatures, Record<string, unknown>>[]): string[] {
  return columns.flatMap((column, index) => {
    if ('columns' in column && Array.isArray(column.columns)) {
      return getLeafColumnIds(
        column.columns as ColumnDef<ReportFeatures, Record<string, unknown>>[],
      );
    }

    return getColumnId(column, index);
  });
}

function parsePreferences(value: string | null): StoredColumnPreferences | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<StoredColumnPreferences>;

    if (
      parsed.version !== 1 ||
      !Array.isArray(parsed.hiddenColumnIds) ||
      !Array.isArray(parsed.columnOrder)
    ) {
      return null;
    }

    return {
      version: 1,
      hiddenColumnIds: parsed.hiddenColumnIds.filter(
        (columnId): columnId is string => typeof columnId === 'string',
      ),
      columnOrder: parsed.columnOrder.filter(
        (columnId): columnId is string => typeof columnId === 'string',
      ),
    };
  } catch {
    return null;
  }
}

function toColumnState(
  preferences: StoredColumnPreferences | null,
  columnIds: string[],
): GradingReportColumnState {
  if (!preferences) {
    return {
      columnVisibility: {},
      columnOrder: [],
    };
  }

  const columnIdSet = new Set(columnIds);
  const columnVisibility = preferences.hiddenColumnIds.reduce<ColumnVisibilityState>(
    (visibility, columnId) => {
      if (columnIdSet.has(columnId)) visibility[columnId] = false;
      return visibility;
    },
    {},
  );

  return {
    columnVisibility,
    columnOrder: preferences.columnOrder.filter((columnId) => columnIdSet.has(columnId)),
  };
}

export function getGradingReportColumnIds(
  columns: ColumnDef<ReportFeatures, Record<string, unknown>>[],
) {
  return getLeafColumnIds(columns);
}

export function getStoredGradingReportColumnState(columnIds: string[]): GradingReportColumnState {
  const storage = getStorage();
  const preferences = parsePreferences(storage?.getItem(STORAGE_KEY) ?? null);

  return toColumnState(preferences, columnIds);
}

export function hasStoredGradingReportColumnState() {
  return parsePreferences(getStorage()?.getItem(STORAGE_KEY) ?? null) != null;
}

export function saveGradingReportColumnState(
  columnIds: string[],
  columnVisibility: ColumnVisibilityState,
  columnOrder: ColumnOrderState,
) {
  const storage = getStorage();
  if (!storage) return false;

  const columnIdSet = new Set(columnIds);
  const preferences: StoredColumnPreferences = {
    version: 1,
    hiddenColumnIds: columnIds.filter((columnId) => columnVisibility[columnId] === false),
    columnOrder: columnOrder.filter((columnId) => columnIdSet.has(columnId)),
  };

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    return true;
  } catch {
    return false;
  }
}

export function clearStoredGradingReportColumnState() {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

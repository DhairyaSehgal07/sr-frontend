import { format, isValid, parse, parseISO } from 'date-fns';
import type { Column, Row, Table } from '@tanstack/react-table';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';

import type { ShedBifurcationRow } from '@/features/shed-bifurcations-report/api/types';
import type {
  AdvancedFilterCondition,
  AdvancedReportGlobalFilter,
} from '@/features/shed-bifurcations-report/utils/report-filter-fns';
import {
  formatIndianInteger,
  formatIndianWeight,
  parseReportNumber,
} from '@/features/shed-bifurcations-report/utils/report-formatters';

const INTEGER_COLUMNS = new Set<keyof ShedBifurcationRow>(['lineQuantity', 'gatePassNo']);
const WEIGHT_COLUMNS = new Set<keyof ShedBifurcationRow>([]);
const NUMERIC_COLUMNS = new Set<keyof ShedBifurcationRow>([
  ...INTEGER_COLUMNS,
  'manualGatePassNumber',
  'accountNumber',
]);

const OPERATOR_LABELS: Record<string, string> = {
  contains: 'contains',
  notContains: 'does not contain',
  equals: 'equals',
  notEquals: 'does not equal',
  startsWith: 'starts with',
  endsWith: 'ends with',
  greaterThan: '>',
  greaterThanOrEqual: '>=',
  lessThan: '<',
  lessThanOrEqual: '<=',
  isEmpty: 'is blank',
  isNotEmpty: 'is not blank',
};

export type ExportCellValue =
  | { kind: 'text'; value: string }
  | { kind: 'number'; value: number; format: 'integer' | 'weight' }
  | { kind: 'empty' };

export function getColumnExportLabel(
  column: Column<ReportFeatures, ShedBifurcationRow, unknown>,
): string {
  return column.columnDef.meta?.filterLabel ?? column.id;
}

function formatReportDate(value: unknown): string | null {
  if (value == null || value === '') return null;

  const raw = String(value).trim();
  if (raw.length === 0) return null;

  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? parse(raw, 'yyyy-MM-dd', new Date())
    : parseISO(raw);

  if (!isValid(parsed)) return raw;

  return format(parsed, 'do MMMM yyyy');
}

function formatDisplayValue(
  value: unknown,
  column: Column<ReportFeatures, ShedBifurcationRow, unknown>,
): string {
  const meta = column.columnDef.meta;
  if (meta?.filterValueFormatter) return meta.filterValueFormatter(value);
  if (value == null || value === '') return 'Blank';
  return String(value);
}

export function formatExportCellValue(
  columnId: keyof ShedBifurcationRow,
  rawValue: unknown,
): ExportCellValue {
  if (rawValue == null || rawValue === '') {
    return { kind: 'empty' };
  }

  if (columnId === 'createdAt') {
    const formatted = formatReportDate(rawValue);
    return formatted ? { kind: 'text', value: formatted } : { kind: 'empty' };
  }

  if (INTEGER_COLUMNS.has(columnId)) {
    const parsed = parseReportNumber(rawValue);
    return parsed == null
      ? { kind: 'empty' }
      : { kind: 'number', value: parsed, format: 'integer' };
  }

  if (WEIGHT_COLUMNS.has(columnId)) {
    const parsed = parseReportNumber(rawValue);
    return parsed == null ? { kind: 'empty' } : { kind: 'number', value: parsed, format: 'weight' };
  }

  return { kind: 'text', value: String(rawValue) };
}

export function getExportCellForRow(
  row: Row<ReportFeatures, ShedBifurcationRow>,
  column: Column<ReportFeatures, ShedBifurcationRow, unknown>,
): ExportCellValue {
  const cell = row.getVisibleCells().find((item) => item.column.id === column.id);

  if (!cell) return { kind: 'empty' };

  const columnId = column.id as keyof ShedBifurcationRow;
  const meta = column.columnDef.meta;

  if (cell.getIsGrouped()) {
    const display = formatDisplayValue(cell.getValue(), column);
    const count = row.subRows.length.toLocaleString('en-IN');
    const indent = '  '.repeat(row.depth);
    return {
      kind: 'text',
      value: `${indent}${display} (${count})`,
    };
  }

  if (cell.getIsAggregated()) {
    if (meta?.numeric !== true) return { kind: 'empty' };
    return formatExportCellValue(columnId, cell.getValue());
  }

  if (cell.getIsPlaceholder()) {
    return { kind: 'empty' };
  }

  if (row.getIsGrouped()) {
    return { kind: 'empty' };
  }

  return formatExportCellValue(columnId, cell.getValue());
}

export function collectExportRows(
  table: Table<ReportFeatures, ShedBifurcationRow>,
): Row<ReportFeatures, ShedBifurcationRow>[] {
  const grouping = table.store.state.grouping;

  if (grouping.length === 0) {
    return table.getSortedRowModel().rows;
  }

  function flattenGroupedRows(
    rows: Row<ReportFeatures, ShedBifurcationRow>[],
  ): Row<ReportFeatures, ShedBifurcationRow>[] {
    const result: Row<ReportFeatures, ShedBifurcationRow>[] = [];

    for (const row of rows) {
      result.push(row);
      if (row.subRows.length > 0) {
        result.push(...flattenGroupedRows(row.subRows));
      }
    }

    return result;
  }

  return flattenGroupedRows(table.getGroupedRowModel().rows);
}

export function getFilteredLeafRowCount(table: Table<ReportFeatures, ShedBifurcationRow>): number {
  return table.getFilteredRowModel().flatRows.length;
}

function formatConditionLabel(
  table: Table<ReportFeatures, ShedBifurcationRow>,
  condition: AdvancedFilterCondition,
): string {
  const column = table.getColumn(String(condition.columnId));
  const columnLabel = column ? getColumnExportLabel(column) : String(condition.columnId);
  const operatorLabel = OPERATOR_LABELS[condition.operator] ?? condition.operator;

  if (condition.operator === 'isEmpty' || condition.operator === 'isNotEmpty') {
    return `${columnLabel} ${operatorLabel}`;
  }

  const value = condition.value.trim();
  if (value.length === 0) return '';

  return `${columnLabel} ${operatorLabel} "${value}"`;
}

function formatColumnFilterSummary(table: Table<ReportFeatures, ShedBifurcationRow>): string[] {
  const summaries: string[] = [];

  for (const filter of table.store.state.columnFilters) {
    if (!Array.isArray(filter.value) || filter.value.length === 0) continue;

    const column = table.getColumn(filter.id);
    if (!column) continue;

    const columnLabel = getColumnExportLabel(column);
    const formattedValues = filter.value.map((value) => {
      const meta = column.columnDef.meta;
      if (meta?.filterValueFormatter) {
        return meta.filterValueFormatter(value);
      }
      if (value == null || value === '') return 'Blank';
      return String(value);
    });

    summaries.push(`${columnLabel}: ${formattedValues.join(', ')}`);
  }

  return summaries;
}

function formatAdvancedFilterSummary(
  table: Table<ReportFeatures, ShedBifurcationRow>,
  globalFilter: AdvancedReportGlobalFilter,
): string[] {
  const summaries: string[] = [];

  const manualSearch = globalFilter.manualGatePassSearch?.trim();
  if (manualSearch) {
    summaries.push(`Gate pass search: "${manualSearch}"`);
  }

  const activeConditions = globalFilter.conditions
    .map((condition) => formatConditionLabel(table, condition))
    .filter((label) => label.length > 0);

  if (activeConditions.length > 0) {
    summaries.push(
      `Advanced (${globalFilter.logic}): ${activeConditions.join(
        globalFilter.logic === 'AND' ? ' · ' : ' | ',
      )}`,
    );
  }

  return summaries;
}

function formatGroupingSummary(table: Table<ReportFeatures, ShedBifurcationRow>): string | null {
  const grouping = table.store.state.grouping;
  if (grouping.length === 0) return null;

  const labels = grouping
    .map((columnId) => {
      const column = table.getColumn(columnId);
      return column ? getColumnExportLabel(column) : columnId;
    })
    .join(' → ');

  return `Grouped by: ${labels}`;
}

function formatSortingSummary(table: Table<ReportFeatures, ShedBifurcationRow>): string | null {
  const sorting = table.store.state.sorting;
  if (sorting.length === 0) return null;

  const labels = sorting
    .map((sort) => {
      const column = table.getColumn(sort.id);
      const columnLabel = column ? getColumnExportLabel(column) : sort.id;
      return `${columnLabel} (${sort.desc ? 'desc' : 'asc'})`;
    })
    .join(', ');

  return `Sorted by: ${labels}`;
}

export function buildFilterSummaryLines(
  table: Table<ReportFeatures, ShedBifurcationRow>,
): string[] {
  const globalFilter = table.store.state.globalFilter;

  const lines = [
    ...formatColumnFilterSummary(table),
    ...(typeof globalFilter === 'object' && globalFilter != null && 'conditions' in globalFilter
      ? formatAdvancedFilterSummary(table, globalFilter as AdvancedReportGlobalFilter)
      : []),
  ];

  const groupingSummary = formatGroupingSummary(table);
  if (groupingSummary) lines.push(groupingSummary);

  const sortingSummary = formatSortingSummary(table);
  if (sortingSummary) lines.push(sortingSummary);

  return lines;
}

export function exportCellValueToPrimitive(cell: ExportCellValue): string | number {
  if (cell.kind === 'empty') return '';
  if (cell.kind === 'number') return cell.value;
  return cell.value;
}

export function exportCellValueToDisplay(cell: ExportCellValue): string {
  if (cell.kind === 'empty') return '—';
  if (cell.kind === 'number') {
    const formatted =
      cell.format === 'integer' ? formatIndianInteger(cell.value) : formatIndianWeight(cell.value);
    return formatted ?? String(cell.value);
  }
  return cell.value;
}

export function isNumericExportColumn(columnId: string): boolean {
  return NUMERIC_COLUMNS.has(columnId as keyof ShedBifurcationRow);
}

export function isSummableExportColumn(columnId: string): columnId is keyof ShedBifurcationRow {
  return (
    INTEGER_COLUMNS.has(columnId as keyof ShedBifurcationRow) ||
    WEIGHT_COLUMNS.has(columnId as keyof ShedBifurcationRow)
  );
}

export function getExcelNumFmt(format: 'integer' | 'weight'): string {
  return format === 'integer' ? '#,##,##0' : '#,##,##0.000';
}

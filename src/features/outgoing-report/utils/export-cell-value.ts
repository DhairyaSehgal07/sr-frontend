import type { Column, Row, Table } from '@tanstack/react-table';
import { format, isValid, parse, parseISO } from 'date-fns';
import type { OutgoingReportRow } from '@/features/outgoing-report/api/types';
import type {
  AdvancedFilterCondition,
  AdvancedReportGlobalFilter,
} from '@/features/outgoing-report/utils/report-filter-fns';
import {
  formatIndianInteger,
  formatIndianWeight,
  parseReportNumber,
  sumBagSizeQuantity,
  sumReportNumericColumn,
} from '@/features/outgoing-report/utils/report-formatters';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';

const INTEGER_COLUMNS = new Set<string>([
  'totalBags',
  'accountNumber',
  'costPerBag',
  'billNumber',
  'biltiNumber',
  'manualGatePassNumber',
  'gatePassNo',
]);
const WEIGHT_COLUMNS = new Set<string>(['netWeightKg']);
const NUMERIC_COLUMNS = new Set<string>([...INTEGER_COLUMNS, ...WEIGHT_COLUMNS]);

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
  column: Column<ReportFeatures, OutgoingReportRow, unknown>,
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
  column: Column<ReportFeatures, OutgoingReportRow, unknown>,
): string {
  const meta = column.columnDef.meta;
  if (meta?.filterValueFormatter) return meta.filterValueFormatter(value);
  if (value == null || value === '') return 'Blank';
  return String(value);
}

function formatOrderLocation(item: OutgoingReportRow['orderDetails'][number]) {
  return [item.chamber, item.floor, item.row].filter(Boolean).join(' / ');
}

function formatSizeColumnExport(row: OutgoingReportRow, columnId: string): ExportCellValue {
  const size = columnId.replace(/^size-/, '');
  const items = row.orderDetails.filter((item) => item.size === size);

  if (items.length === 0) return { kind: 'empty' };

  const hasDetail = items.some((item) => item.bagType || formatOrderLocation(item));

  if (!hasDetail && items.length === 1) {
    return { kind: 'number', value: items[0].quantityIssued, format: 'integer' };
  }

  return {
    kind: 'text',
    value: items
      .map((item) => {
        const formatted = formatIndianInteger(item.quantityIssued) ?? String(item.quantityIssued);
        const details = [item.bagType, formatOrderLocation(item)].filter(Boolean);
        return details.length > 0 ? `${formatted} (${details.join(', ')})` : formatted;
      })
      .join('\n'),
  };
}

export function formatExportCellValue(
  columnId: string,
  rawValue: unknown,
  row?: OutgoingReportRow,
): ExportCellValue {
  if (columnId.startsWith('size-')) {
    if (row) return formatSizeColumnExport(row, columnId);

    const parsed = parseReportNumber(rawValue);
    return parsed == null
      ? { kind: 'empty' }
      : { kind: 'number', value: parsed, format: 'integer' };
  }

  if (rawValue == null || rawValue === '') {
    return { kind: 'empty' };
  }

  if (columnId === 'date') {
    const formatted = formatReportDate(rawValue);
    return formatted ? { kind: 'text', value: formatted } : { kind: 'empty' };
  }

  if (columnId === 'status') {
    if (rawValue === 'ACTIVE') return { kind: 'text', value: 'Active' };
    if (rawValue === 'CANCELLED') return { kind: 'text', value: 'Cancelled' };
    return { kind: 'text', value: String(rawValue) };
  }

  if (columnId === 'preSowingTreatment') {
    if (rawValue === 'true') return { kind: 'text', value: 'Yes' };
    if (rawValue === 'false') return { kind: 'text', value: 'No' };
    return { kind: 'empty' };
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
  row: Row<ReportFeatures, OutgoingReportRow>,
  column: Column<ReportFeatures, OutgoingReportRow, unknown>,
): ExportCellValue {
  const cell = row.getVisibleCells().find((item) => item.column.id === column.id);

  if (!cell) return { kind: 'empty' };

  const columnId = column.id;
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

  if (columnId.startsWith('size-')) {
    return formatSizeColumnExport(row.original, columnId);
  }

  return formatExportCellValue(columnId, cell.getValue());
}

export function collectExportRows(
  table: Table<ReportFeatures, OutgoingReportRow>,
): Row<ReportFeatures, OutgoingReportRow>[] {
  const grouping = table.store.state.grouping;

  if (grouping.length === 0) {
    return table.getSortedRowModel().rows;
  }

  function flattenGroupedRows(
    rows: Row<ReportFeatures, OutgoingReportRow>[],
  ): Row<ReportFeatures, OutgoingReportRow>[] {
    const result: Row<ReportFeatures, OutgoingReportRow>[] = [];

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

export function getFilteredLeafRowCount(table: Table<ReportFeatures, OutgoingReportRow>): number {
  return table.getFilteredRowModel().flatRows.length;
}

function formatConditionLabel(
  table: Table<ReportFeatures, OutgoingReportRow>,
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

function formatColumnFilterSummary(table: Table<ReportFeatures, OutgoingReportRow>): string[] {
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
  table: Table<ReportFeatures, OutgoingReportRow>,
  globalFilter: AdvancedReportGlobalFilter,
): string[] {
  const summaries: string[] = [];

  const manualSearch = globalFilter.manualGatePassSearch?.trim();
  if (manualSearch) {
    summaries.push(`Manual gate pass search: "${manualSearch}"`);
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

function formatGroupingSummary(table: Table<ReportFeatures, OutgoingReportRow>): string | null {
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

function formatSortingSummary(table: Table<ReportFeatures, OutgoingReportRow>): string | null {
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

export function buildFilterSummaryLines(table: Table<ReportFeatures, OutgoingReportRow>): string[] {
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
  return NUMERIC_COLUMNS.has(columnId) || columnId.startsWith('size-');
}

export function isIntegerSummableExportColumn(columnId: string): boolean {
  return columnId === 'totalBags' || columnId.startsWith('size-');
}

export function isSummableExportColumn(columnId: string): boolean {
  return isIntegerSummableExportColumn(columnId) || columnId === 'netWeightKg';
}

export function sumExportColumn(
  rows: readonly { original: OutgoingReportRow }[],
  columnId: string,
): number {
  if (columnId.startsWith('size-')) {
    return sumBagSizeQuantity(rows, columnId.replace(/^size-/, ''));
  }

  return sumReportNumericColumn(rows, columnId as keyof OutgoingReportRow);
}

export function getExcelNumFmt(format: 'integer' | 'weight'): string {
  return format === 'integer' ? '#,##,##0' : '#,##,##0.000';
}

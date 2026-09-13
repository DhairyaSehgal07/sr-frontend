import { format, isValid, parse, parseISO } from 'date-fns';
import type { Column, Row, Table } from '@tanstack/react-table';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';

import type { GradingGatePassReportRow } from '@/features/grading-report/api/types';
import type {
  AdvancedFilterCondition,
  AdvancedReportGlobalFilter,
} from '@/features/grading-report/utils/report-filter-fns';
import {
  averageReportNumericColumn,
  formatIndianInteger,
  formatIndianPercentage,
  formatIndianWeight,
  getIncomingGatePassObjects,
  parseReportNumber,
  sumIncomingGatePassNumericColumn,
  sumOrderDetailSizeQuantity,
  sumReportNumericColumn,
} from '@/features/grading-report/utils/report-formatters';

export const INCOMING_GATE_PASS_COLUMN_IDS = new Set([
  'incomingManualGatePassNumber',
  'incomingBagsReceived',
  'incomingStage',
  'incomingCategory',
  'incomingGatePassNetWeightKg',
]);

const INTEGER_COLUMNS = new Set<string>([
  'accountNumber',
  'gatePassNo',
  'manualGatePassNumber',
  'totalBags',
  'incomingBagsReceived',
]);

const WEIGHT_COLUMNS = new Set<string>([
  'incomingGatePassNetWeightKg',
  'incomingNetWeightKg',
  'netWeightKg',
  'wastageKg',
]);

const PERCENTAGE_COLUMNS = new Set(['wastagePercentage']);

const SUMMABLE_INTEGER_COLUMNS = new Set(['incomingBagsReceived', 'totalBags']);

const SUMMABLE_WEIGHT_COLUMNS = new Set([
  'incomingGatePassNetWeightKg',
  'incomingNetWeightKg',
  'netWeightKg',
]);

const AVERAGE_WEIGHT_COLUMNS = new Set(['wastageKg']);
const AVERAGE_PERCENTAGE_COLUMNS = new Set(['wastagePercentage']);

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
  | { kind: 'number'; value: number; format: 'integer' | 'weight' | 'percentage' }
  | { kind: 'empty' };

export type GradingExportLine = {
  row: Row<ReportFeatures, GradingGatePassReportRow>;
  incomingIndex: number;
  incomingCount: number;
};

type IncomingGatePassRow =
  | string
  | {
      manualGatePassNumber?: number | string;
      bagsReceived?: number | string;
      stage?: string;
      category?: string;
      netWeightKg?: number | string;
    };

export function getColumnExportLabel(
  column: Column<ReportFeatures, GradingGatePassReportRow, unknown>,
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
  column: Column<ReportFeatures, GradingGatePassReportRow, unknown>,
): string {
  const meta = column.columnDef.meta;
  if (meta?.filterValueFormatter) return meta.filterValueFormatter(value);
  if (value == null || value === '') return 'Blank';
  return String(value);
}

function formatOrderDetailText(detail: GradingGatePassReportRow['orderDetails'][number]): string {
  return `${detail.quantity.toLocaleString('en-IN')} bags - ${detail.bagType} (${detail.weightPerBagKg.toLocaleString(
    'en-IN',
    { maximumFractionDigits: 3 },
  )})`;
}

function getIncomingGatePassValue(
  gatePass: IncomingGatePassRow | undefined,
  columnId: string,
): ExportCellValue {
  if (!gatePass || typeof gatePass === 'string') return { kind: 'empty' };

  switch (columnId) {
    case 'incomingManualGatePassNumber': {
      const parsed = parseReportNumber(gatePass.manualGatePassNumber);
      return parsed == null
        ? { kind: 'empty' }
        : { kind: 'number', value: parsed, format: 'integer' };
    }
    case 'incomingBagsReceived': {
      const parsed = parseReportNumber(gatePass.bagsReceived);
      return parsed == null
        ? { kind: 'empty' }
        : { kind: 'number', value: parsed, format: 'integer' };
    }
    case 'incomingStage':
      return gatePass.stage ? { kind: 'text', value: gatePass.stage } : { kind: 'empty' };
    case 'incomingCategory':
      return gatePass.category ? { kind: 'text', value: gatePass.category } : { kind: 'empty' };
    case 'incomingGatePassNetWeightKg': {
      const parsed = parseReportNumber(gatePass.netWeightKg);
      return parsed == null
        ? { kind: 'empty' }
        : { kind: 'number', value: parsed, format: 'weight' };
    }
    default:
      return { kind: 'empty' };
  }
}

function formatSizeColumnValue(row: GradingGatePassReportRow, columnId: string): ExportCellValue {
  const size = columnId.replace(/^size-/, '');
  const details = row.orderDetails.filter((detail) => detail.size === size);

  if (!details.length) return { kind: 'empty' };

  return {
    kind: 'text',
    value: details.map(formatOrderDetailText).join('\n'),
  };
}

export function formatExportCellValue(
  columnId: string,
  rawValue: unknown,
  row?: GradingGatePassReportRow,
): ExportCellValue {
  if (columnId.startsWith('size-')) {
    return row ? formatSizeColumnValue(row, columnId) : { kind: 'empty' };
  }

  if (rawValue == null || rawValue === '') {
    return { kind: 'empty' };
  }

  if (columnId === 'date') {
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

  if (PERCENTAGE_COLUMNS.has(columnId)) {
    const parsed = parseReportNumber(rawValue);
    return parsed == null
      ? { kind: 'empty' }
      : { kind: 'number', value: parsed, format: 'percentage' };
  }

  return { kind: 'text', value: String(rawValue) };
}

export function getExportCellForLine(
  line: GradingExportLine,
  column: Column<ReportFeatures, GradingGatePassReportRow, unknown>,
): ExportCellValue {
  const { row, incomingIndex } = line;
  const columnId = column.id;
  const meta = column.columnDef.meta;

  if (row.getIsGrouped()) {
    const cell = row.getVisibleCells().find((item) => item.column.id === columnId);
    if (!cell) return { kind: 'empty' };

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
      return formatExportCellValue(columnId, cell.getValue(), row.original);
    }

    if (cell.getIsPlaceholder()) return { kind: 'empty' };
    return { kind: 'empty' };
  }

  if (INCOMING_GATE_PASS_COLUMN_IDS.has(columnId)) {
    const incomingGatePasses = getIncomingGatePassObjects(row.original);
    return getIncomingGatePassValue(incomingGatePasses[incomingIndex], columnId);
  }

  if (incomingIndex > 0) {
    return { kind: 'empty' };
  }

  const cell = row.getVisibleCells().find((item) => item.column.id === columnId);
  if (!cell) return { kind: 'empty' };

  if (columnId.startsWith('size-')) {
    return formatSizeColumnValue(row.original, columnId);
  }

  return formatExportCellValue(columnId, cell.getValue(), row.original);
}

export function collectExportRows(
  table: Table<ReportFeatures, GradingGatePassReportRow>,
): Row<ReportFeatures, GradingGatePassReportRow>[] {
  const grouping = table.store.state.grouping;

  if (grouping.length === 0) {
    return table.getSortedRowModel().rows;
  }

  function flattenGroupedRows(
    rows: Row<ReportFeatures, GradingGatePassReportRow>[],
  ): Row<ReportFeatures, GradingGatePassReportRow>[] {
    const result: Row<ReportFeatures, GradingGatePassReportRow>[] = [];

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

export function collectGradingExportLines(
  table: Table<ReportFeatures, GradingGatePassReportRow>,
): GradingExportLine[] {
  const lines: GradingExportLine[] = [];

  for (const row of collectExportRows(table)) {
    if (row.getIsGrouped()) {
      lines.push({ row, incomingIndex: 0, incomingCount: 1 });
      continue;
    }

    const incomingGatePasses = getIncomingGatePassObjects(row.original);
    const incomingCount = Math.max(incomingGatePasses.length, 1);

    for (let incomingIndex = 0; incomingIndex < incomingCount; incomingIndex += 1) {
      lines.push({ row, incomingIndex, incomingCount });
    }
  }

  return lines;
}

export function getFilteredLeafRowCount(
  table: Table<ReportFeatures, GradingGatePassReportRow>,
): number {
  return table.getFilteredRowModel().flatRows.length;
}

function formatConditionLabel(
  table: Table<ReportFeatures, GradingGatePassReportRow>,
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

function formatColumnFilterSummary(
  table: Table<ReportFeatures, GradingGatePassReportRow>,
): string[] {
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
  table: Table<ReportFeatures, GradingGatePassReportRow>,
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

function formatGroupingSummary(
  table: Table<ReportFeatures, GradingGatePassReportRow>,
): string | null {
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

function formatSortingSummary(
  table: Table<ReportFeatures, GradingGatePassReportRow>,
): string | null {
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
  table: Table<ReportFeatures, GradingGatePassReportRow>,
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
      cell.format === 'integer'
        ? formatIndianInteger(cell.value)
        : cell.format === 'percentage'
          ? formatIndianPercentage(cell.value)
          : formatIndianWeight(cell.value);
    return formatted ?? String(cell.value);
  }
  return cell.value;
}

export function isIncomingGatePassColumn(columnId: string): boolean {
  return INCOMING_GATE_PASS_COLUMN_IDS.has(columnId);
}

export function isSummableExportColumn(columnId: string): boolean {
  return (
    SUMMABLE_INTEGER_COLUMNS.has(columnId) ||
    SUMMABLE_WEIGHT_COLUMNS.has(columnId) ||
    columnId.startsWith('size-')
  );
}

export function isAverageExportColumn(columnId: string): boolean {
  return AVERAGE_WEIGHT_COLUMNS.has(columnId) || AVERAGE_PERCENTAGE_COLUMNS.has(columnId);
}

export function getFooterExportValue(
  columnId: string,
  rows: readonly Row<ReportFeatures, GradingGatePassReportRow>[],
): ExportCellValue {
  if (columnId.startsWith('size-')) {
    const total = sumOrderDetailSizeQuantity(rows, columnId.replace(/^size-/, ''));
    return { kind: 'number', value: total, format: 'integer' };
  }

  if (SUMMABLE_INTEGER_COLUMNS.has(columnId)) {
    if (columnId === 'incomingBagsReceived') {
      return {
        kind: 'number',
        value: sumIncomingGatePassNumericColumn(rows, 'bagsReceived'),
        format: 'integer',
      };
    }

    return {
      kind: 'number',
      value: sumReportNumericColumn(rows, columnId as keyof GradingGatePassReportRow),
      format: 'integer',
    };
  }

  if (SUMMABLE_WEIGHT_COLUMNS.has(columnId)) {
    if (columnId === 'incomingGatePassNetWeightKg') {
      return {
        kind: 'number',
        value: sumIncomingGatePassNumericColumn(rows, 'netWeightKg'),
        format: 'weight',
      };
    }

    return {
      kind: 'number',
      value: sumReportNumericColumn(rows, columnId as keyof GradingGatePassReportRow),
      format: 'weight',
    };
  }

  if (AVERAGE_WEIGHT_COLUMNS.has(columnId)) {
    const average = averageReportNumericColumn(rows, columnId as keyof GradingGatePassReportRow);
    return average == null
      ? { kind: 'empty' }
      : { kind: 'number', value: average, format: 'weight' };
  }

  if (AVERAGE_PERCENTAGE_COLUMNS.has(columnId)) {
    const average = averageReportNumericColumn(rows, columnId as keyof GradingGatePassReportRow);
    return average == null
      ? { kind: 'empty' }
      : { kind: 'number', value: average, format: 'percentage' };
  }

  return { kind: 'empty' };
}

export function getExcelNumFmt(format: 'integer' | 'weight' | 'percentage'): string {
  if (format === 'integer') return '#,##,##0';
  if (format === 'percentage') return '#,##,##0.00';
  return '#,##,##0.000';
}

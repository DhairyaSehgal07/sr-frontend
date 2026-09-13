import type { TransferStockReportRow } from '@/features/transfer-stock-report/api/types';
import type { ReportFilterFn } from '@/lib/tanstack-table/report-table-features';
import { parseReportNumber } from '@/features/transfer-stock-report/utils/report-formatters';

export type SelectedValuesFilterValue = string[];
export type AdvancedFilterLogic = 'AND' | 'OR';
export type AdvancedFilterOperator =
  | 'contains'
  | 'notContains'
  | 'equals'
  | 'notEquals'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'isEmpty'
  | 'isNotEmpty';

export type AdvancedFilterCondition = {
  id: string;
  columnId: keyof TransferStockReportRow;
  operator: AdvancedFilterOperator;
  value: string;
};

export type AdvancedReportGlobalFilter = {
  logic: AdvancedFilterLogic;
  conditions: AdvancedFilterCondition[];
  manualGatePassSearch?: string;
};

const ADVANCED_NUMERIC_COLUMN_IDS = new Set<keyof TransferStockReportRow>(['totalBags']);

export function isAdvancedNumericColumn(
  columnId: string,
): columnId is keyof TransferStockReportRow {
  return ADVANCED_NUMERIC_COLUMN_IDS.has(columnId as keyof TransferStockReportRow);
}

export function getReportFilterValueKey(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

export const selectedValuesFilterFn: ReportFilterFn<TransferStockReportRow> = (
  row,
  columnId,
  filterValue,
) => {
  if (!Array.isArray(filterValue)) return true;

  const selectedValues = new Set(filterValue.map(String));
  const rowValueKey = getReportFilterValueKey(row.getValue(columnId));

  return selectedValues.has(rowValueKey);
};

selectedValuesFilterFn.autoRemove = (filterValue) => filterValue == null;

function isAdvancedReportGlobalFilter(value: unknown): value is AdvancedReportGlobalFilter {
  return (
    typeof value === 'object' &&
    value != null &&
    'logic' in value &&
    'conditions' in value &&
    Array.isArray((value as AdvancedReportGlobalFilter).conditions)
  );
}

function normalizeText(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function evaluateCondition(row: TransferStockReportRow, condition: AdvancedFilterCondition) {
  const rawValue = row[condition.columnId];

  if (condition.operator === 'isEmpty') {
    return rawValue == null || String(rawValue).trim().length === 0;
  }

  if (condition.operator === 'isNotEmpty') {
    return rawValue != null && String(rawValue).trim().length > 0;
  }

  const filterValue = condition.value.trim();
  if (filterValue.length === 0) return true;

  const rowText = normalizeText(rawValue);
  const filterText = normalizeText(filterValue);
  const isNumericCondition = isAdvancedNumericColumn(String(condition.columnId));

  if (
    isNumericCondition &&
    (condition.operator === 'equals' || condition.operator === 'notEquals')
  ) {
    const rowNumber = parseReportNumber(rawValue);
    const filterNumber = parseReportNumber(filterValue);
    if (rowNumber == null || filterNumber == null) return false;
    return condition.operator === 'equals'
      ? rowNumber === filterNumber
      : rowNumber !== filterNumber;
  }

  switch (condition.operator) {
    case 'contains':
      return rowText.includes(filterText);
    case 'notContains':
      return !rowText.includes(filterText);
    case 'equals':
      return rowText === filterText;
    case 'notEquals':
      return rowText !== filterText;
    case 'startsWith':
      return rowText.startsWith(filterText);
    case 'endsWith':
      return rowText.endsWith(filterText);
    case 'greaterThan':
    case 'greaterThanOrEqual':
    case 'lessThan':
    case 'lessThanOrEqual': {
      const rowNumber = parseReportNumber(rawValue);
      const filterNumber = parseReportNumber(filterValue);
      if (rowNumber == null || filterNumber == null) return false;

      if (condition.operator === 'greaterThan') return rowNumber > filterNumber;
      if (condition.operator === 'greaterThanOrEqual') {
        return rowNumber >= filterNumber;
      }
      if (condition.operator === 'lessThan') return rowNumber < filterNumber;
      return rowNumber <= filterNumber;
    }
    default:
      return true;
  }
}

export const advancedReportGlobalFilterFn: ReportFilterFn<TransferStockReportRow> = (
  row,
  _columnId,
  filterValue,
) => {
  if (!isAdvancedReportGlobalFilter(filterValue)) return true;

  const gatePassSearch = filterValue.manualGatePassSearch?.trim();
  if (gatePassSearch) {
    const query = normalizeText(gatePassSearch);
    const matchesGatePass = normalizeText(row.original.gatePassNo).includes(query);
    const matchesManual = normalizeText(row.original.manualGatePassNumber).includes(query);

    if (!matchesGatePass && !matchesManual) {
      return false;
    }
  }

  const activeConditions = filterValue.conditions.filter((condition) => {
    if (condition.operator === 'isEmpty' || condition.operator === 'isNotEmpty') {
      return true;
    }

    return condition.value.trim().length > 0;
  });

  if (activeConditions.length === 0) return true;

  return filterValue.logic === 'AND'
    ? activeConditions.every((condition) => evaluateCondition(row.original, condition))
    : activeConditions.some((condition) => evaluateCondition(row.original, condition));
};

advancedReportGlobalFilterFn.autoRemove = (filterValue) =>
  !isAdvancedReportGlobalFilter(filterValue) ||
  ((filterValue.manualGatePassSearch?.trim().length ?? 0) === 0 &&
    filterValue.conditions.every(
      (condition) =>
        condition.operator !== 'isEmpty' &&
        condition.operator !== 'isNotEmpty' &&
        condition.value.trim().length === 0,
    ));

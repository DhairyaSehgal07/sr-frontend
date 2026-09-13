import type { Row } from '@tanstack/react-table';

import type { GradingGatePassReportRow } from '@/features/grading-report/api/types';
import { parseReportNumber } from '@/features/grading-report/utils/report-formatters';
import type { ReportFeatures, ReportFilterFn } from '@/lib/tanstack-table/report-table-features';

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

export type GradingReportColumnId =
  | keyof GradingGatePassReportRow
  | 'incomingManualGatePassNumber'
  | 'incomingBagsReceived'
  | 'incomingStage'
  | 'incomingCategory'
  | 'incomingGatePassNetWeightKg'
  | `size-${string}`;

export type AdvancedFilterCondition = {
  id: string;
  columnId: GradingReportColumnId;
  operator: AdvancedFilterOperator;
  value: string;
};

export type AdvancedReportGlobalFilter = {
  logic: AdvancedFilterLogic;
  conditions: AdvancedFilterCondition[];
  manualGatePassSearch?: string;
};

const ADVANCED_NUMERIC_COLUMN_IDS = new Set<GradingReportColumnId>([
  'incomingBagsReceived',
  'incomingGatePassNetWeightKg',
  'totalBags',
  'incomingNetWeightKg',
  'netWeightKg',
  'wastageKg',
  'wastagePercentage',
]);

export function isAdvancedNumericColumn(columnId: string): columnId is GradingReportColumnId {
  return (
    ADVANCED_NUMERIC_COLUMN_IDS.has(columnId as GradingReportColumnId) ||
    columnId.startsWith('size-')
  );
}

export function getReportFilterValueKey(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

export const selectedValuesFilterFn: ReportFilterFn<GradingGatePassReportRow> = (
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

function getAdvancedFilterRowValue(
  row: Row<ReportFeatures, GradingGatePassReportRow>,
  columnId: GradingReportColumnId,
) {
  return row.getValue(String(columnId));
}

function evaluateCondition(
  row: Row<ReportFeatures, GradingGatePassReportRow>,
  condition: AdvancedFilterCondition,
) {
  const rawValue = getAdvancedFilterRowValue(row, condition.columnId);

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
      if (condition.operator === 'greaterThanOrEqual') return rowNumber >= filterNumber;
      if (condition.operator === 'lessThan') return rowNumber < filterNumber;
      return rowNumber <= filterNumber;
    }
    default:
      return true;
  }
}

export const advancedReportGlobalFilterFn: ReportFilterFn<GradingGatePassReportRow> = (
  row,
  _columnId,
  filterValue,
) => {
  if (!isAdvancedReportGlobalFilter(filterValue)) return true;

  const manualGatePassSearch = filterValue.manualGatePassSearch?.trim();
  if (
    manualGatePassSearch &&
    !normalizeText(row.original.manualGatePassNumber).includes(normalizeText(manualGatePassSearch))
  ) {
    return false;
  }

  const activeConditions = filterValue.conditions.filter((condition) => {
    if (condition.operator === 'isEmpty' || condition.operator === 'isNotEmpty') return true;
    return condition.value.trim().length > 0;
  });

  if (activeConditions.length === 0) return true;

  return filterValue.logic === 'AND'
    ? activeConditions.every((condition) => evaluateCondition(row, condition))
    : activeConditions.some((condition) => evaluateCondition(row, condition));
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

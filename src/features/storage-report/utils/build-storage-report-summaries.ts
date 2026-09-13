import type { Table } from '@tanstack/react-table';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';

import { orderGradingSizeNames } from '@/features/analytics/lib/grading-size-order';
import type { StorageGatePass, StorageGatePassBagSize } from '@/features/storage/api/types';
import type { StorageQuantityMode } from '@/features/storage-report/components/columns';

export type StorageReportSummaryRow = {
  label: string;
  values: Record<string, number>;
  total: number;
};

export type StorageReportSummaryTable = {
  title: string;
  rowHeaderLabel: string;
  sizeNames: string[];
  rows: StorageReportSummaryRow[];
  totals: Record<string, number>;
  grandTotal: number;
};

const bagFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

export function formatSummaryBagCount(value: number): string {
  return bagFormatter.format(value);
}

function getBagQuantity(bag: StorageGatePassBagSize, quantityMode: StorageQuantityMode): number {
  return quantityMode === 'current' ? bag.currentQuantity : bag.initialQuantity;
}

export function getFilteredGatePassesForSummary(
  table: Table<ReportFeatures, StorageGatePass>,
): StorageGatePass[] {
  return table
    .getFilteredRowModel()
    .flatRows.filter((row) => row.subRows.length === 0)
    .map((row) => row.original);
}

function buildSizePivotSummary(
  gatePasses: StorageGatePass[],
  quantityMode: StorageQuantityMode,
  getRowKey: (gatePass: StorageGatePass) => string,
  title: string,
  rowHeaderLabel: string,
): StorageReportSummaryTable {
  const sizeSet = new Set<string>();
  const rowMap = new Map<string, Record<string, number>>();

  for (const gatePass of gatePasses) {
    const rowKey = getRowKey(gatePass);
    if (!rowMap.has(rowKey)) {
      rowMap.set(rowKey, {});
    }

    const values = rowMap.get(rowKey)!;

    for (const bag of gatePass.bagSizes) {
      sizeSet.add(bag.size);
      const quantity = getBagQuantity(bag, quantityMode);
      values[bag.size] = (values[bag.size] ?? 0) + quantity;
    }
  }

  const sizeNames = orderGradingSizeNames(sizeSet);
  const sortedLabels = [...rowMap.keys()].sort((a, b) => a.localeCompare(b, 'en-IN'));

  const rows: StorageReportSummaryRow[] = sortedLabels.map((label) => {
    const rawValues = rowMap.get(label) ?? {};
    const values: Record<string, number> = {};

    for (const sizeName of sizeNames) {
      values[sizeName] = Number(rawValues[sizeName] ?? 0);
    }

    const total = Object.values(values).reduce((sum, value) => sum + value, 0);

    return { label, values, total };
  });

  const totals: Record<string, number> = {};
  for (const sizeName of sizeNames) {
    totals[sizeName] = rows.reduce((sum, row) => sum + Number(row.values[sizeName] ?? 0), 0);
  }

  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);

  return {
    title,
    rowHeaderLabel,
    sizeNames,
    rows,
    totals,
    grandTotal,
  };
}

function formatStageLabel(stage: string | undefined): string {
  const trimmed = stage?.trim();
  return trimmed ? trimmed : '—';
}

export function buildStorageReportSummaries(
  table: Table<ReportFeatures, StorageGatePass>,
  quantityMode: StorageQuantityMode,
): StorageReportSummaryTable[] {
  const gatePasses = getFilteredGatePassesForSummary(table);

  return [
    buildSizePivotSummary(
      gatePasses,
      quantityMode,
      (gatePass) => gatePass.variety.trim() || '—',
      'Variety & size summary',
      'Varieties',
    ),
    buildSizePivotSummary(
      gatePasses,
      quantityMode,
      (gatePass) => gatePass.farmerStorageLinkId.farmerId.name.trim() || '—',
      'Farmer wise summary',
      'Farmer',
    ),
    buildSizePivotSummary(
      gatePasses,
      quantityMode,
      (gatePass) => formatStageLabel(gatePass.stage),
      'Stage wise summary',
      'Stage',
    ),
    buildSizePivotSummary(
      gatePasses,
      quantityMode,
      (gatePass) => gatePass.storageCategory.trim() || '—',
      'Storage category wise summary',
      'Storage category',
    ),
  ];
}

export function hasSummaryTableData(table: StorageReportSummaryTable): boolean {
  return table.rows.length > 0 && table.sizeNames.length > 0;
}

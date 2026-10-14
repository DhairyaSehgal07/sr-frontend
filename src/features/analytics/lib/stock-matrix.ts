import { BAG_SIZES, POTATO_VARIETIES } from '@/lib/constants';

import type { ColdStoreStock } from '../api/types';

export const ALL_STOCK_FILTERS = 'all';

export type QuantityMode = 'current' | 'initial' | 'outgoing';

export type StockCell = {
  quantity: number;
  stockId: string | null;
};

export type StockMatrixRow = {
  variety: string;
  cells: StockCell[];
  total: number;
};

export type StockHighlight = {
  name: string;
  total: number;
};

export type StockMatrix = {
  sizes: string[];
  rows: StockMatrixRow[];
  columnTotals: number[];
  grandTotal: number;
  topVariety: StockHighlight | null;
  topSize: StockHighlight | null;
};

function catalogLabel(value: string, catalog: readonly string[]): string {
  const match = catalog.find((item) => item.toLowerCase() === value.toLowerCase());
  return match ?? value;
}

function catalogRank(value: string, catalog: readonly string[]): number {
  const index = catalog.findIndex((item) => item.toLowerCase() === value.toLowerCase());
  return index === -1 ? catalog.length : index;
}

function finiteCount(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export function quantityFor(stock: ColdStoreStock, mode: QuantityMode): number {
  const current = finiteCount(stock.size.currentQuantity);
  const initial = finiteCount(stock.size.initialQuantity);
  if (mode === 'current') return current;
  if (mode === 'initial') return initial;
  return Math.max(0, initial - current);
}

export function stockFilterLabel(stock: ColdStoreStock): string {
  return stock.stockFilter?.trim() ?? '';
}

export function listStockFilters(stocks: readonly ColdStoreStock[]): string[] {
  const labels = new Map<string, string>();

  for (const stock of stocks) {
    const label = stockFilterLabel(stock);
    if (!label) continue;
    const key = label.toLowerCase();
    if (!labels.has(key)) labels.set(key, label);
  }

  return [...labels.values()].sort((a, b) => a.localeCompare(b, 'en-IN', { sensitivity: 'base' }));
}

export function filterStocks(
  stocks: readonly ColdStoreStock[],
  stockFilter: string,
): ColdStoreStock[] {
  if (stockFilter === ALL_STOCK_FILTERS) return [...stocks];

  const key = stockFilter.trim().toLowerCase();
  return stocks.filter((stock) => stockFilterLabel(stock).toLowerCase() === key);
}

export function stockMatrix(stocks: readonly ColdStoreStock[], mode: QuantityMode): StockMatrix {
  const entries = new Map<string, Map<string, StockCell>>();
  const varietyLabels = new Map<string, string>();
  const sizeLabels = new Map<string, string>();

  for (const stock of stocks) {
    const rawVariety = stock.variety?.trim() ?? '';
    const rawSize = stock.size?.name?.trim() ?? '';
    if (!rawVariety || !rawSize) continue;

    const varietyKey = rawVariety.toLowerCase();
    const sizeKey = rawSize.toLowerCase();
    varietyLabels.set(varietyKey, catalogLabel(rawVariety, POTATO_VARIETIES));
    sizeLabels.set(sizeKey, catalogLabel(rawSize, BAG_SIZES));

    const bySize = entries.get(varietyKey) ?? new Map<string, StockCell>();
    if (!bySize.has(sizeKey)) {
      bySize.set(sizeKey, { quantity: quantityFor(stock, mode), stockId: stock._id });
    }
    entries.set(varietyKey, bySize);
  }

  const sizes = [...sizeLabels.entries()]
    .sort((a, b) => {
      const byRank = catalogRank(a[1], BAG_SIZES) - catalogRank(b[1], BAG_SIZES);
      if (byRank !== 0) return byRank;
      return a[1].localeCompare(b[1], 'en-IN', { numeric: true, sensitivity: 'base' });
    })
    .map(([key, label]) => ({ key, label }));

  const rows = [...varietyLabels.entries()]
    .sort((a, b) => {
      const byRank = catalogRank(a[1], POTATO_VARIETIES) - catalogRank(b[1], POTATO_VARIETIES);
      if (byRank !== 0) return byRank;
      return a[1].localeCompare(b[1], 'en-IN', { sensitivity: 'base' });
    })
    .map(([varietyKey, variety]) => {
      const bySize = entries.get(varietyKey);
      const cells = sizes.map(({ key }) => bySize?.get(key) ?? { quantity: 0, stockId: null });
      const total = cells.reduce((sum, cell) => sum + cell.quantity, 0);
      return { variety, cells, total };
    });

  const columnTotals = sizes.map((_, index) =>
    rows.reduce((sum, row) => sum + (row.cells[index]?.quantity ?? 0), 0),
  );
  const grandTotal = columnTotals.reduce((sum, value) => sum + value, 0);

  const topVariety = rows.reduce<StockHighlight | null>((best, row) => {
    if (!best || row.total > best.total) return { name: row.variety, total: row.total };
    return best;
  }, null);

  const topSize = sizes.reduce<StockHighlight | null>((best, size, index) => {
    const total = columnTotals[index] ?? 0;
    if (!best || total > best.total) return { name: size.label, total };
    return best;
  }, null);

  return {
    sizes: sizes.map(({ label }) => label),
    rows,
    columnTotals,
    grandTotal,
    topVariety,
    topSize,
  };
}

import { BAG_SIZES, POTATO_VARIETIES } from '@/lib/constants';

import type { PartyGatePass } from '../api/types';

const weightFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

export function formatWeight(value: number): string {
  return weightFormatter.format(value);
}

export function gatePassBillBookId(pass: PartyGatePass): string {
  const ref = pass.billBookId;
  if (typeof ref === 'string') return ref;
  if (ref && typeof ref === 'object') return ref._id;
  return '';
}

export function gatePassBillBookName(pass: PartyGatePass): string {
  if (typeof pass.billBook === 'string' && pass.billBook.trim()) return pass.billBook;
  if (typeof pass.billBook === 'number') return String(pass.billBook);
  const ref = pass.billBookId;
  if (ref && typeof ref === 'object' && ref.name) return ref.name;
  return '—';
}

export function formatBilti(pass: PartyGatePass): string {
  const book = pass.biltiBook == null || pass.biltiBook === '' ? '' : String(pass.biltiBook);
  const number = pass.bitliNumber == null ? '' : String(pass.bitliNumber);
  if (book && number) return `${book} · ${number}`;
  return book || number || '—';
}

export function gatePassBags(pass: PartyGatePass): number {
  return pass.bagSize.reduce((sum, row) => {
    return sum + (Number.isFinite(row.quantityIssued) ? row.quantityIssued : 0);
  }, 0);
}

export function materialFromPasses(passes: readonly PartyGatePass[]) {
  let bags = 0;
  let netWeight = 0;

  for (const pass of passes) {
    bags += gatePassBags(pass);
    if (Number.isFinite(pass.netWeight)) netWeight += pass.netWeight;
  }

  return {
    passCount: passes.length,
    bags,
    netWeight,
  };
}

export function countNoun(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export type StockMatrixRow = {
  variety: string;
  quantities: number[];
  total: number;
};

export type StockMatrix = {
  sizes: string[];
  rows: StockMatrixRow[];
  columnTotals: number[];
  grandTotal: number;
};

function catalogLabel(value: string, catalog: readonly string[]): string {
  const match = catalog.find((item) => item.toLowerCase() === value.toLowerCase());
  return match ?? value;
}

function catalogRank(value: string, catalog: readonly string[]): number {
  const index = catalog.findIndex((item) => item.toLowerCase() === value.toLowerCase());
  return index === -1 ? catalog.length : index;
}

export function stockMatrixFromPasses(passes: readonly PartyGatePass[]): StockMatrix {
  const quantities = new Map<string, Map<string, number>>();
  const varietyLabels = new Map<string, string>();
  const sizeLabels = new Map<string, string>();

  for (const pass of passes) {
    for (const row of pass.bagSize) {
      const rawVariety = row.variety.trim();
      const rawSize = row.size.trim();
      if (!rawVariety || !rawSize) continue;

      const varietyKey = rawVariety.toLowerCase();
      const sizeKey = rawSize.toLowerCase();
      const variety = catalogLabel(rawVariety, POTATO_VARIETIES);
      const size = catalogLabel(rawSize, BAG_SIZES);
      const bags = Number.isFinite(row.quantityIssued) ? row.quantityIssued : 0;

      varietyLabels.set(varietyKey, variety);
      sizeLabels.set(sizeKey, size);

      const bySize = quantities.get(varietyKey) ?? new Map<string, number>();
      bySize.set(sizeKey, (bySize.get(sizeKey) ?? 0) + bags);
      quantities.set(varietyKey, bySize);
    }
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
      const bySize = quantities.get(varietyKey);
      const lineQuantities = sizes.map(({ key }) => bySize?.get(key) ?? 0);
      const total = lineQuantities.reduce((sum, value) => sum + value, 0);
      return { variety, quantities: lineQuantities, total };
    });

  const columnTotals = sizes.map((_, index) =>
    rows.reduce((sum, row) => sum + (row.quantities[index] ?? 0), 0),
  );
  const grandTotal = columnTotals.reduce((sum, value) => sum + value, 0);

  return {
    sizes: sizes.map(({ label }) => label),
    rows,
    columnTotals,
    grandTotal,
  };
}

import { describe, expect, it } from 'vitest';

import type { ColdStoreStock } from '../api/types';
import {
  ALL_STOCK_FILTERS,
  filterStocks,
  listStockFilters,
  quantityFor,
  stockMatrix,
} from './stock-matrix';

function stock(
  id: string,
  variety: string,
  size: string,
  currentQuantity: number,
  initialQuantity: number,
  stockFilter?: string,
): ColdStoreStock {
  return {
    _id: id,
    variety,
    stockFilter,
    size: { name: size, currentQuantity, initialQuantity },
  };
}

const rows = [
  stock('1', 'Atlantic', 'Keri', 200, 200, 'OWNED'),
  stock('2', 'Atlantic', 'Seed', 300, 400, 'FARMER'),
  stock('3', 'Chipsona 1', 'Goli', 1150, 1150, 'OWNED'),
  stock('4', 'K. Jyoti', 'Ration', 50, 80),
];

describe('stockMatrix', () => {
  it('pivots current quantities in catalog order and totals them', () => {
    const matrix = stockMatrix(rows, 'current');

    expect(matrix.sizes).toEqual(['Ration', 'Seed', 'Goli', 'Keri']);
    expect(matrix.rows.map((row) => row.variety)).toEqual(['Atlantic', 'Chipsona 1', 'K. Jyoti']);
    expect(matrix.rows[0]?.cells.map((cell) => cell.quantity)).toEqual([0, 300, 0, 200]);
    expect(matrix.rows[0]?.total).toBe(500);
    expect(matrix.columnTotals).toEqual([50, 300, 1150, 200]);
    expect(matrix.grandTotal).toBe(1700);
    expect(matrix.topVariety).toEqual({ name: 'Chipsona 1', total: 1150 });
    expect(matrix.topSize).toEqual({ name: 'Goli', total: 1150 });
    expect(matrix.rows[1]?.cells[2]?.stockId).toBe('3');
    expect(matrix.rows[0]?.cells[2]?.stockId).toBeNull();
  });

  it('uses initial quantity and outgoing as the drop from initial', () => {
    const seed = rows[1];
    expect(seed).toBeDefined();
    if (!seed) return;

    expect(quantityFor(seed, 'initial')).toBe(400);
    expect(quantityFor(seed, 'outgoing')).toBe(100);
    expect(stockMatrix(rows, 'outgoing').grandTotal).toBe(130);
  });

  it('lists filters and keeps unlabeled rows on All only', () => {
    expect(listStockFilters(rows)).toEqual(['FARMER', 'OWNED']);
    expect(filterStocks(rows, ALL_STOCK_FILTERS)).toHaveLength(4);
    expect(filterStocks(rows, 'OWNED').map((row) => row._id)).toEqual(['1', '3']);
    expect(filterStocks(rows, 'farmer')).toHaveLength(1);
  });
});

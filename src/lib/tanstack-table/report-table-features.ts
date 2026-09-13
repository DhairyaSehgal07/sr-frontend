import {
  aggregationFn_uniqueCount,
  columnFacetingFeature,
  columnFilteringFeature,
  columnGroupingFeature,
  columnOrderingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createGroupedRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  type FilterFn,
  globalFilteringFeature,
  type RowData,
  rowAggregationFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  type SortFn,
  sortFn_text,
  tableFeatures,
} from '@tanstack/react-table';

import { densityPlugin } from '@/lib/tanstack-table/density-feature';

type ReportFilterFns = {
  selectedValues: FilterFn<any, any>;
};

type ReportSortFns = {
  reportNumeric: SortFn<any, any>;
  reportDate: SortFn<any, any>;
};

export function createReportTableFeatures(options: {
  filterFns: ReportFilterFns;
  sortFns: ReportSortFns;
}) {
  return tableFeatures({
    densityPlugin,
    columnFilteringFeature,
    globalFilteringFeature,
    columnFacetingFeature,
    columnGroupingFeature,
    rowAggregationFeature,
    rowExpandingFeature,
    rowPaginationFeature,
    rowSortingFeature,
    columnVisibilityFeature,
    columnOrderingFeature,
    filteredRowModel: createFilteredRowModel(),
    groupedRowModel: createGroupedRowModel(),
    expandedRowModel: createExpandedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    facetedRowModel: createFacetedRowModel(),
    facetedUniqueValues: createFacetedUniqueValues(),
    sortedRowModel: createSortedRowModel(),
    filterFns: options.filterFns,
    sortFns: {
      text: sortFn_text,
      reportNumeric: options.sortFns.reportNumeric,
      reportDate: options.sortFns.reportDate,
    },
    aggregationFns: {
      uniqueCount: aggregationFn_uniqueCount,
    },
  });
}

export type ReportFeatures = ReturnType<typeof createReportTableFeatures>;

export type ReportFilterFn<TData extends RowData> = FilterFn<ReportFeatures, TData>;
export type ReportSortFn<TData extends RowData> = SortFn<ReportFeatures, TData>;

export type ReportColumnMeta = {
  align?: 'left' | 'right';
  wrap?: boolean;
  numeric?: boolean;
  mono?: boolean;
  groupStart?: boolean;
  emphasize?: boolean;
  filterLabel?: string;
  filterValueFormatter?: (value: unknown) => string;
};

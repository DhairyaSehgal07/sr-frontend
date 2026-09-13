import { createReportTableFeatures } from '@/lib/tanstack-table/report-table-features';
import { selectedValuesFilterFn } from '@/features/transfer-stock-report/utils/report-filter-fns';
import {
  reportDateSortingFn,
  reportNumericSortingFn,
} from '@/features/transfer-stock-report/utils/report-sorting-fns';

export const transferStockReportTableFeatures = createReportTableFeatures({
  filterFns: {
    selectedValues: selectedValuesFilterFn,
  },
  sortFns: {
    reportNumeric: reportNumericSortingFn,
    reportDate: reportDateSortingFn,
  },
});

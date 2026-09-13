import { createReportTableFeatures } from '@/lib/tanstack-table/report-table-features';
import { selectedValuesFilterFn } from '@/features/storage-report/utils/report-filter-fns';
import {
  reportDateSortingFn,
  reportNumericSortingFn,
} from '@/features/storage-report/utils/report-sorting-fns';

export const storageReportTableFeatures = createReportTableFeatures({
  filterFns: {
    selectedValues: selectedValuesFilterFn,
  },
  sortFns: {
    reportNumeric: reportNumericSortingFn,
    reportDate: reportDateSortingFn,
  },
});

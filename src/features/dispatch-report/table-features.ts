import { selectedValuesFilterFn } from '@/features/dispatch-report/utils/report-filter-fns';
import {
  reportDateSortingFn,
  reportNumericSortingFn,
} from '@/features/dispatch-report/utils/report-sorting-fns';
import { createReportTableFeatures } from '@/lib/tanstack-table/report-table-features';

export const dispatchReportTableFeatures = createReportTableFeatures({
  filterFns: {
    selectedValues: selectedValuesFilterFn,
  },
  sortFns: {
    reportNumeric: reportNumericSortingFn,
    reportDate: reportDateSortingFn,
  },
});

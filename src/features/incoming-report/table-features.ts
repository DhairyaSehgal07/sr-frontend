import { createReportTableFeatures } from '@/lib/tanstack-table/report-table-features';
import { selectedValuesFilterFn } from '@/features/incoming-report/utils/report-filter-fns';
import {
  reportDateSortingFn,
  reportNumericSortingFn,
} from '@/features/incoming-report/utils/report-sorting-fns';

export const incomingReportTableFeatures = createReportTableFeatures({
  filterFns: {
    selectedValues: selectedValuesFilterFn,
  },
  sortFns: {
    reportNumeric: reportNumericSortingFn,
    reportDate: reportDateSortingFn,
  },
});

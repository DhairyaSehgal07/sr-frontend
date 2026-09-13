import { createReportTableFeatures } from '@/lib/tanstack-table/report-table-features';
import { selectedValuesFilterFn } from '@/features/grading-report/utils/report-filter-fns';
import {
  reportDateSortingFn,
  reportNumericSortingFn,
} from '@/features/grading-report/utils/report-sorting-fns';

export const gradingReportTableFeatures = createReportTableFeatures({
  filterFns: {
    selectedValues: selectedValuesFilterFn,
  },
  sortFns: {
    reportNumeric: reportNumericSortingFn,
    reportDate: reportDateSortingFn,
  },
});

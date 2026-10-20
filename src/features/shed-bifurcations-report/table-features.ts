import { createReportTableFeatures } from '@/lib/tanstack-table/report-table-features';
import { selectedValuesFilterFn } from '@/features/shed-bifurcations-report/utils/report-filter-fns';
import {
  reportDateSortingFn,
  reportNumericSortingFn,
} from '@/features/shed-bifurcations-report/utils/report-sorting-fns';

export const shedBifurcationReportTableFeatures = createReportTableFeatures({
  filterFns: {
    selectedValues: selectedValuesFilterFn,
  },
  sortFns: {
    reportNumeric: reportNumericSortingFn,
    reportDate: reportDateSortingFn,
  },
});

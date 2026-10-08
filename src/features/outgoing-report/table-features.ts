import { selectedValuesFilterFn } from '@/features/outgoing-report/utils/report-filter-fns';
import {
  reportDateSortingFn,
  reportNumericSortingFn,
} from '@/features/outgoing-report/utils/report-sorting-fns';
import { createReportTableFeatures } from '@/lib/tanstack-table/report-table-features';

export const outgoingReportTableFeatures = createReportTableFeatures({
  filterFns: {
    selectedValues: selectedValuesFilterFn,
  },
  sortFns: {
    reportNumeric: reportNumericSortingFn,
    reportDate: reportDateSortingFn,
  },
});

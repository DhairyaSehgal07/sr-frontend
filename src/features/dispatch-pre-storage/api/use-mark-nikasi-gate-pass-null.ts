import { useMutation } from '@tanstack/react-query';

import { bookingKeys } from '@/features/booking/api/query-keys';
import { nikasiGatePassReportKeys } from '@/features/dispatch-report/api/query-keys';
import { financeKeys } from '@/features/finances/api/query-keys';
import { outgoingGatePassKeys } from '@/features/outgoing/api/query-keys';
import { queryClient } from '@/lib/queryClient';

import { markNikasiGatePassNull } from './mark-nikasi-gate-pass-null';
import { nikasiGatePassKeys } from './types';

export function useMarkNikasiGatePassNull() {
  return useMutation({
    mutationKey: nikasiGatePassKeys.markNull(),
    mutationFn: (id: string) => markNikasiGatePassNull(id),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({
        queryKey: nikasiGatePassKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: nikasiGatePassKeys.detail(id),
      });
      void queryClient.invalidateQueries({
        queryKey: nikasiGatePassReportKeys.all,
      });
      void queryClient.invalidateQueries({
        queryKey: financeKeys.salesLists(),
      });
      void queryClient.invalidateQueries({
        queryKey: financeKeys.summaries(),
      });
      void queryClient.invalidateQueries({
        queryKey: financeKeys.outstandingLists(),
      });
      void queryClient.invalidateQueries({
        queryKey: outgoingGatePassKeys.shedSummary(),
      });
      void queryClient.invalidateQueries({
        queryKey: bookingKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: bookingKeys.searches(),
      });
      void queryClient.invalidateQueries({
        queryKey: bookingKeys.summary(),
      });
      void queryClient.invalidateQueries({
        queryKey: bookingKeys.storageSummary(),
      });
    },
  });
}

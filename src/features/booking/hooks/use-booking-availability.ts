import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { bookingKeys } from '@/features/booking/api/query-keys';
import type { SummaryVariety } from '@/features/booking/api/summary-types';
import { useBookingStorageSummary } from '@/features/booking/api/use-booking-storage-summary';
import { buildNetAvailabilityMap } from '@/features/booking/lib/booking-availability';
import { outgoingGatePassKeys } from '@/features/outgoing/api/query-keys';
import { useShedSummary } from '@/features/outgoing/api/use-shed-summary';
import type { BookingVarietySummary } from '@/features/booking/types/booking-summary';
import { mapShedSummaryToVarietySummary } from '@/features/outgoing/utils/map-shed-summary';

export function useBookingAvailability() {
  const queryClient = useQueryClient();

  const cachedStorage = queryClient.getQueryData<SummaryVariety[]>(bookingKeys.storageSummary());
  const cachedShed = queryClient.getQueryData<BookingVarietySummary[]>(
    outgoingGatePassKeys.shedSummary(),
  );

  const storageQuery = useBookingStorageSummary({
    initialData: cachedStorage,
  });
  const shedQuery = useShedSummary({
    initialData: cachedShed,
  });

  const availabilityMap = useMemo(
    () =>
      buildNetAvailabilityMap(
        storageQuery.data ?? [],
        [],
        mapShedSummaryToVarietySummary(shedQuery.data ?? []),
      ),
    [storageQuery.data, shedQuery.data],
  );

  const isLoading =
    (storageQuery.isLoading && storageQuery.data === undefined) ||
    (shedQuery.isLoading && shedQuery.data === undefined);

  const isError =
    (storageQuery.isError && storageQuery.data === undefined) ||
    (shedQuery.isError && shedQuery.data === undefined);

  const isReady =
    !isLoading &&
    storageQuery.isFetched &&
    shedQuery.isFetched;

  return {
    availabilityMap,
    isLoading,
    isError,
    isReady,
    refetch: () => {
      void storageQuery.refetch();
      void shedQuery.refetch();
    },
  };
}

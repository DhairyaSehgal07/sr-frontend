import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { bookingKeys } from '@/features/booking/api/query-keys';
import type { SummaryVariety } from '@/features/booking/api/summary-types';
import { useBookingStorageSummary } from '@/features/booking/api/use-booking-storage-summary';
import { buildNetAvailabilityMap } from '@/features/booking/lib/booking-availability';
import type { ShedSummaryGroup } from '@/features/outgoing/api/types';
import { outgoingGatePassKeys } from '@/features/outgoing/api/query-keys';
import { useShedSummary } from '@/features/outgoing/api/use-shed-summary';
import { getShedGroupVarieties } from '@/features/outgoing/utils/map-shed-summary';

export function useBookingAvailability() {
  const queryClient = useQueryClient();

  const cachedStorage = queryClient.getQueryData<SummaryVariety[]>(bookingKeys.storageSummary());
  const cachedShed = queryClient.getQueryData<ShedSummaryGroup[]>(
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
        getShedGroupVarieties(shedQuery.data ?? [], 'all'),
      ),
    [storageQuery.data, shedQuery.data],
  );

  const isLoading =
    (storageQuery.isLoading && storageQuery.data === undefined) ||
    (shedQuery.isLoading && shedQuery.data === undefined);

  const isError =
    (storageQuery.isError && storageQuery.data === undefined) ||
    (shedQuery.isError && shedQuery.data === undefined);

  const isReady = !isLoading && storageQuery.isFetched && shedQuery.isFetched;

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

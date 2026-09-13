import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import { bookingKeys } from '@/features/booking/api/query-keys';
import type { UpdateBookingInput } from '@/features/booking/api/types';
import { updateBooking } from '@/features/booking/api/update-booking';
import { queryClient } from '@/lib/queryClient';

export function useUpdateBooking(id: string) {
  const router = useRouter();

  return useMutation({
    mutationKey: bookingKeys.update(id),
    mutationFn: (input: UpdateBookingInput) => updateBooking(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: bookingKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: bookingKeys.searches(),
      });
      void queryClient.invalidateQueries({
        queryKey: bookingKeys.summary(),
      });

      void router.navigate({ to: '/daybook', search: { tab: 'booking' } });
    },
  });
}

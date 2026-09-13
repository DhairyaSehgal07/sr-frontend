import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import { createBooking } from '@/features/booking/api/create-booking';
import { bookingKeys } from '@/features/booking/api/query-keys';
import type { CreateBookingInput } from '@/features/booking/api/types';
import { voucherNumberKeys } from '@/hooks/use-get-voucher-number';
import { queryClient } from '@/lib/queryClient';

export function useCreateBooking() {
  const router = useRouter();

  return useMutation({
    mutationKey: bookingKeys.create(),
    mutationFn: (input: CreateBookingInput) => createBooking(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: voucherNumberKeys.detail('booking-gate-pass'),
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

      void router.navigate({ to: '/daybook', search: { tab: 'booking' } });
    },
  });
}

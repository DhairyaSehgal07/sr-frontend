import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/lib/queryClient';
import { billBookKeys } from './query-keys';
import type { UpdateBillBookInput } from './types';
import { updateBillBook } from './update-bill-book';

export function useUpdateBillBook() {
  return useMutation({
    mutationKey: billBookKeys.update(),
    mutationFn: (input: UpdateBillBookInput) => updateBillBook(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: billBookKeys.lists(),
      });
    },
  });
}

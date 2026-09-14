import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/lib/queryClient';
import { createBillBook } from './create-bill-book';
import { billBookKeys } from './query-keys';
import type { CreateBillBookBody } from './types';

export function useCreateBillBook() {
  return useMutation({
    mutationKey: billBookKeys.create(),
    mutationFn: (body: CreateBillBookBody) => createBillBook(body),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: billBookKeys.lists(),
      });
    },
  });
}

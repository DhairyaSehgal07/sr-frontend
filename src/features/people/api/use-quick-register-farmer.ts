import { useMutation } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { peopleQueryKeys } from '@/features/people/api/query-keys';
import { quickRegisterFarmer } from '@/features/people/api/quick-register-farmer';
import type { AddFarmerPayload } from '@/features/people/schemas/add-farmer-form-schema';
import { queryClient } from '@/lib/queryClient';

export function useQuickRegisterFarmer() {
  const coldStorageId = useAuthStore((s) => s.user?.coldStorageId._id);
  const linkedById = useAuthStore((s) => s.user?._id);

  return useMutation({
    mutationKey: peopleQueryKeys.quickRegister(),
    mutationFn: (payload: AddFarmerPayload) => {
      if (!coldStorageId || !linkedById) {
        throw new Error('Session expired. Please sign in again.');
      }

      return quickRegisterFarmer(payload, { coldStorageId, linkedById });
    },
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.farmerStorageLinks(),
      });
    },
  });
}

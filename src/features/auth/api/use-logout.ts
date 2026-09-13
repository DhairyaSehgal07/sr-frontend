import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { router } from '@/router';
import { useAuthStore } from '../store/use-auth-store';
import type { LogoutResponse } from '../types';

async function logoutRequest(): Promise<LogoutResponse> {
  try {
    const { data } = await apiClient.post<LogoutResponse>('/store-admin/logout');

    if (!data.success) {
      throw new Error(data.message ?? 'Logout failed');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Logout failed'), { cause: error });
  }
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: logoutRequest,
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      void router.navigate({ to: '/', replace: true });
    },
  });
}

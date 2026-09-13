import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import apiClient, { getApiErrorMessage } from '@/lib/api-client';
import { useAuthStore } from '../store/use-auth-store';
import type { AuthResponse, LoginCredentials } from '../types';

async function loginRequest(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>('/store-admin/login', credentials);

    if (!data.success || !data.data?.token || !data.data.coldStorageId?._id) {
      throw new Error(data.message ?? 'Login failed');
    }

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Login failed'), { cause: error });
  }
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: loginRequest,
    // Wrong credentials / validation — never retry; UI shows toast in LoginForm.
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: ({ data }) => {
      if (!data) return;

      const { token, ...user } = data;
      setAuth(user, token);

      const redirectTo = router.state.location.search.redirect;
      if (redirectTo) {
        router.history.push(redirectTo);
        return;
      }

      router.navigate({ to: '/daybook', search: { tab: 'incoming' } });
    },
  });
}

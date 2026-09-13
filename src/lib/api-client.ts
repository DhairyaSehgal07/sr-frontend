import axios, { isAxiosError } from 'axios';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { router } from '@/router';
import { env } from './env';

export { getHttpStatusFromError } from './http-error';

export const apiClient = axios.create({
  baseURL: `${env.apiBaseUrl}/v1`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(error);
    }

    const { status } = error.response;

    if (status === 401) {
      useAuthStore.getState().clearAuth();

      if (window.location.pathname !== '/') {
        void router.navigate({ to: '/', replace: true });
      }
    }

    return Promise.reject(error);
  },
);

type ApiErrorBody = {
  message?: string;
  error?: { message?: string };
};

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    if (typeof data?.error?.message === 'string') return data.error.message;
    if (typeof data?.message === 'string') return data.message;
  }

  if (error instanceof Error) return error.message;

  return fallback;
}

export default apiClient;

import type { QueryClient } from '@tanstack/react-query';
import type { AuthUser } from '@/features/auth/types';

export interface AuthRouterContext {
  isAuthenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
}

export interface RouterContext {
  queryClient: QueryClient;
  auth: AuthRouterContext;
}

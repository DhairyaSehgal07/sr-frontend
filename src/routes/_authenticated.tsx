import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { AuthenticatedLayout } from './_authenticated/-layout';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    const isAuthenticated =
      context.auth.isAuthenticated || useAuthStore.getState().isAuthenticated();

    if (!isAuthenticated) {
      throw redirect({
        to: '/',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthenticatedLayout,
});

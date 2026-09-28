import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { TanStackAppDevtools } from '@/components/tanstack-devtools';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { env } from './lib/env';
import { queryClient } from './lib/queryClient';
import { router } from './router';

export function Providers() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      // next-themes also injects a <script> from React. React 19 does not run it
      // and logs a warning. Theme is applied in index.html before paint instead.
      scriptProps={{ type: 'application/json' }}
    >
      <TooltipProvider delayDuration={0}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider
            router={router}
            context={{
              queryClient,
              auth: {
                isAuthenticated: !!accessToken,
                user,
                accessToken,
              },
            }}
          />
          <Toaster />
          {env.enableDevtools ? <TanStackAppDevtools router={router} /> : null}
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

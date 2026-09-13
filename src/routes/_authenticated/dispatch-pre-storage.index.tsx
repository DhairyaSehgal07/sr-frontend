import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/dispatch-pre-storage/')({
  beforeLoad: () => {
    throw redirect({ to: '/dispatch' });
  },
});

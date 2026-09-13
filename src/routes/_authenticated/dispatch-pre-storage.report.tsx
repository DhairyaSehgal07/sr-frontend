import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/dispatch-pre-storage/report')({
  beforeLoad: () => {
    throw redirect({ to: '/dispatch/report' });
  },
});

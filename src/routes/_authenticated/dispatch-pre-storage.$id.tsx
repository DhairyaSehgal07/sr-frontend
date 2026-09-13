import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/dispatch-pre-storage/$id')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/dispatch/$id', params: { id: params.id } });
  },
});

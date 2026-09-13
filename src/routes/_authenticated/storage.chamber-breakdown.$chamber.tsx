import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/storage/chamber-breakdown/$chamber')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/storage/chamber-breakdown"!</div>;
}

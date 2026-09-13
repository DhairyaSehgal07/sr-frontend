import { createFileRoute } from '@tanstack/react-router';
import EditIncomingForm from '@/features/incoming/forms/edit-incoming-form';

export const Route = createFileRoute('/_authenticated/incoming/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <EditIncomingForm gatePassId={id} />;
}

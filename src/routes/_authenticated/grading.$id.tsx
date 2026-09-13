import { createFileRoute } from '@tanstack/react-router';
import EditGradingForm from '@/features/grading/forms/edit-grading-form';

export const Route = createFileRoute('/_authenticated/grading/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <EditGradingForm gatePassId={id} />;
}

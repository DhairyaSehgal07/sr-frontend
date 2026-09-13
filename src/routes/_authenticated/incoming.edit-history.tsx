import { createFileRoute } from '@tanstack/react-router';
import IncomingEditHistoryPage from '@/features/incoming/components/incoming-edit-history';

export const Route = createFileRoute('/_authenticated/incoming/edit-history')({
  component: IncomingEditHistoryPage,
});

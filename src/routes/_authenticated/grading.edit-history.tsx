import { createFileRoute } from '@tanstack/react-router';
import GradingEditHistoryPage from '@/features/grading/components/grading-edit-history';

export const Route = createFileRoute('/_authenticated/grading/edit-history')({
  component: GradingEditHistoryPage,
});

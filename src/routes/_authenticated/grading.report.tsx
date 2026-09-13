import { createFileRoute } from '@tanstack/react-router';
import GradingReportPage from '@/features/grading-report';

export const Route = createFileRoute('/_authenticated/grading/report')({
  component: GradingReportPage,
});

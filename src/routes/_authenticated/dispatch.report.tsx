import { createFileRoute } from '@tanstack/react-router';
import DispatchReportPage from '@/features/dispatch-report';

export const Route = createFileRoute('/_authenticated/dispatch/report')({
  component: DispatchReportPage,
});

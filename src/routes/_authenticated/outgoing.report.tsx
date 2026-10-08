import { createFileRoute } from '@tanstack/react-router';
import OutgoingReportPage from '@/features/outgoing-report';

export const Route = createFileRoute('/_authenticated/outgoing/report')({
  component: OutgoingReportPage,
});

import { createFileRoute } from '@tanstack/react-router';

import { ShedBifurcationsReportPage } from '@/features/shed-bifurcations-report';

export const Route = createFileRoute('/_authenticated/shed-bifurcations/report')({
  component: ShedBifurcationsReportPage,
});

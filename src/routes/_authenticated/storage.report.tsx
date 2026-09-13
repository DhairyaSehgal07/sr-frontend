import { createFileRoute } from '@tanstack/react-router';
import StorageReportPage from '@/features/storage-report';

export const Route = createFileRoute('/_authenticated/storage/report')({
  component: StorageReportPage,
});

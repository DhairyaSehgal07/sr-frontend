import { createFileRoute } from '@tanstack/react-router';

function DispatchPostStorageReportPage() {
  return <div>Dispatch post-storage report</div>;
}

export const Route = createFileRoute('/_authenticated/dispatch-post-storage/report')({
  component: DispatchPostStorageReportPage,
});

import { createFileRoute } from '@tanstack/react-router';
import StorageEditHistory from '@/features/storage/components/storage-edit-history';

export const Route = createFileRoute('/_authenticated/storage/edit-history')({
  component: StorageEditHistory,
});

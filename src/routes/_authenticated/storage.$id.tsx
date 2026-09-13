import { createFileRoute } from '@tanstack/react-router';
import { EditStorageRoute } from '@/features/storage/forms/edit-storage-form';

export const Route = createFileRoute('/_authenticated/storage/$id')({
  component: EditStorageRoute,
});

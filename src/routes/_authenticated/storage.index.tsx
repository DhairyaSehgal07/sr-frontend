import { createFileRoute } from '@tanstack/react-router';
import CreateStorageForm from '@/features/storage/forms/create-storage-form';

export const Route = createFileRoute('/_authenticated/storage/')({
  component: CreateStorageForm,
});

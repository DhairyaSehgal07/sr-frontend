import { createFileRoute } from '@tanstack/react-router';
import { EditDispatchPreStorageForm } from '@/features/dispatch-pre-storage/forms/edit-dispatch-pre-storage-form';

export const Route = createFileRoute('/_authenticated/dispatch/$id')({
  component: EditDispatchPreStorageForm,
});

import { createFileRoute } from '@tanstack/react-router';
import CreateDispatchPreStorageForm from '@/features/dispatch-pre-storage/forms/create-dispatch-pre-storage-form';

export const Route = createFileRoute('/_authenticated/dispatch/')({
  component: CreateDispatchPreStorageForm,
});

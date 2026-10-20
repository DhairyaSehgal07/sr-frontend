import { createFileRoute } from '@tanstack/react-router';
import CreateDispatchPreStorageForm from '@/features/dispatch-pre-storage/forms/create-dispatch-pre-storage-form';
import { dispatchCreateSearchSchema } from '@/features/dispatch-pre-storage/search';

export const Route = createFileRoute('/_authenticated/dispatch/')({
  validateSearch: dispatchCreateSearchSchema,
  component: CreateDispatchPreStorageForm,
});

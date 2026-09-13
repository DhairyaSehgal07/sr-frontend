import { createFileRoute } from '@tanstack/react-router';
import CreateGradingForm from '@/features/grading/forms/create-grading-form';

export const Route = createFileRoute('/_authenticated/grading/')({
  component: CreateGradingForm,
});

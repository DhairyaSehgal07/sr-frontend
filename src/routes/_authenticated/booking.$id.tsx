import { createFileRoute } from '@tanstack/react-router';
import { EditBookingForm } from '@/features/booking/forms/edit-booking-form';

export const Route = createFileRoute('/_authenticated/booking/$id')({
  component: EditBookingForm,
});

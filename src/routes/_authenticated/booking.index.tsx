import { createFileRoute } from '@tanstack/react-router';
import CreateBookingForm from '@/features/booking/forms/create-booking-form';

export const Route = createFileRoute('/_authenticated/booking/')({
  component: CreateBookingForm,
});

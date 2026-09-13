import { createFileRoute } from '@tanstack/react-router';
import BookingEditHistoryPage from '@/features/booking/components/booking-edit-history';

export const Route = createFileRoute('/_authenticated/booking/edit-history')({
  component: BookingEditHistoryPage,
});

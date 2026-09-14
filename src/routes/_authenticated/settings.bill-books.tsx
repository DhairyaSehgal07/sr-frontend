import { createFileRoute } from '@tanstack/react-router';
import { BillBooksPage } from '@/features/settings/bill-books';

export const Route = createFileRoute('/_authenticated/settings/bill-books')({
  component: BillBooksPage,
});

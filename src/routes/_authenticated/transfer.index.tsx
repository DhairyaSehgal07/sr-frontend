import { createFileRoute } from '@tanstack/react-router';
import CreateTransferStock from '@/features/transfer-stock/forms/create-transfer-stock';

export const Route = createFileRoute('/_authenticated/transfer/')({
  component: CreateTransferStock,
});

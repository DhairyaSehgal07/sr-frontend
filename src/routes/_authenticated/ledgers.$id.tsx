import { createFileRoute } from '@tanstack/react-router';

import DispatchLedgerDetailPage from '@/features/ledgers/dispatch-ledger-detail';

export const Route = createFileRoute('/_authenticated/ledgers/$id')({
  component: DispatchLedgerDetailPage,
});

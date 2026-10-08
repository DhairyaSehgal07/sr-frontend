import { createFileRoute } from '@tanstack/react-router';

import DispatchLedgerPage from '@/features/dispatch-ledger';

export const Route = createFileRoute('/_authenticated/dispatch-ledger')({
  component: DispatchLedgerPage,
});

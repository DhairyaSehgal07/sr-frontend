import { createFileRoute } from '@tanstack/react-router';

import LedgersPage from '@/features/ledgers';

export const Route = createFileRoute('/_authenticated/ledgers/')({
  component: LedgersPage,
});

import { createFileRoute } from '@tanstack/react-router';

import { StockFiltersPage } from '@/features/settings/stock-filters';

export const Route = createFileRoute('/_authenticated/settings/stock-filters')({
  component: StockFiltersPage,
});

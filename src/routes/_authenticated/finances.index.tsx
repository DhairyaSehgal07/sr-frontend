import { createFileRoute } from '@tanstack/react-router';

import FinancesPage from '@/features/finances';
import { financesSearchSchema } from '@/features/finances/search';

export const Route = createFileRoute('/_authenticated/finances/')({
  validateSearch: financesSearchSchema,
  component: FinancesPage,
});

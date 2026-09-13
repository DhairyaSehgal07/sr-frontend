import { createFileRoute } from '@tanstack/react-router';

import DaybookPage from '@/features/daybook';
import { daybookSearchSchema } from '@/features/daybook/search';

export const Route = createFileRoute('/_authenticated/daybook')({
  validateSearch: daybookSearchSchema,
  component: DaybookPage,
});

import { createFileRoute } from '@tanstack/react-router';

import PeoplePage from '@/features/people';
import { peopleSearchSchema } from '@/features/people/search';

export const Route = createFileRoute('/_authenticated/people/')({
  validateSearch: peopleSearchSchema,
  component: PeoplePage,
});

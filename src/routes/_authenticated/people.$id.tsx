import { createFileRoute } from '@tanstack/react-router';

import FarmerProfilePage from '@/features/people/farmer-profile';
import { farmerProfileSearchSchema } from '@/features/people/farmer-profile/search';

export const Route = createFileRoute('/_authenticated/people/$id')({
  validateSearch: farmerProfileSearchSchema,
  component: FarmerProfilePage,
});

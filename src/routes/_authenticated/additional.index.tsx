import { createFileRoute } from '@tanstack/react-router';
import { AdditionalPage } from '@/features/additional';

export const Route = createFileRoute('/_authenticated/additional/')({
  component: AdditionalPage,
});

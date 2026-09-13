import { createFileRoute } from '@tanstack/react-router';
import TemperaturePage from '@/features/additional/components/temperature';

export const Route = createFileRoute('/_authenticated/additional/temperature')({
  component: TemperaturePage,
});

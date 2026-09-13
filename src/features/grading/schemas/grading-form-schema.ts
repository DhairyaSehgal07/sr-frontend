import * as z from 'zod';
import { objectId } from '@/features/incoming/schemas/incoming-form-schema';
import { gradingFillDetailsSchema } from '@/features/grading/schemas/grading-fill-details-schema';

export const gradingSelectStepSchema = z.object({
  farmerStorageLinkId: objectId,
  variety: z.string().min(1, 'Select a variety.'),
  selectedIncomingGatePassIds: z.array(z.string()).min(1, 'Select at least one gate pass.'),
});

export const gradingFormSchema = gradingSelectStepSchema.merge(gradingFillDetailsSchema);

export type GradingFormValues = z.infer<typeof gradingFormSchema>;

export const GRADING_FORM_STEPS = [
  {
    id: 'select-gate-passes',
    title: 'Select Gate Passes',
    description: 'Choose incoming gate passes',
    schema: gradingSelectStepSchema,
  },
  {
    id: 'fill-details',
    title: 'Fill Details',
    description: 'Enter graded bag counts',
    schema: gradingFillDetailsSchema,
  },
] as const;

export {
  gradingFillDetailsSchema,
  createDefaultQuantities,
  createEmptyQuantityRow,
  type GradingFillDetailsValues,
  type GradingQuantityRow,
} from '@/features/grading/schemas/grading-fill-details-schema';

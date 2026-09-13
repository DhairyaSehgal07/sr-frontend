import { useForm } from '@tanstack/react-form';

import {
  gradingFormSchema,
  type GradingFormValues,
} from '@/features/grading/schemas/grading-form-schema';
import { defaultGradingSubmitMeta, type GradingSubmitMeta } from '@/features/grading/types';

type UseGradingFormOptions = {
  defaultValues: GradingFormValues;
  onOpenReview?: () => void;
  onSubmitParsed?: (values: GradingFormValues) => Promise<void>;
};

export function useGradingForm(options: UseGradingFormOptions) {
  return useForm({
    defaultValues: options.defaultValues,
    validators: {
      onChange: gradingFormSchema,
      onSubmit: gradingFormSchema,
    },
    onSubmitMeta: defaultGradingSubmitMeta,
    onSubmit: async ({ value, meta }) => {
      const parsed = gradingFormSchema.parse(value);

      if ((meta as GradingSubmitMeta).submitAction === 'review') {
        options.onOpenReview?.();
        return;
      }

      await options.onSubmitParsed?.(parsed);
    },
  });
}

export type GradingFormApi = ReturnType<typeof useGradingForm>;

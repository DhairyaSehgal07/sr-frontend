import {
  createDefaultQuantities,
  type GradingFormValues,
} from '@/features/grading/schemas/grading-form-schema';
import { useGradingForm, type GradingFormApi } from '@/features/grading/forms/use-grading-form';

export type { GradingFormValues, GradingFormApi };

/** @deprecated Use `GradingFormApi` */
export type CreateGradingFormApi = GradingFormApi;

type UseCreateGradingFormOptions = {
  onOpenReview?: () => void;
  onCreate?: (values: GradingFormValues) => Promise<void>;
};

export function useCreateGradingForm(options: UseCreateGradingFormOptions = {}) {
  const todayIso = new Date().toISOString();

  return useGradingForm({
    defaultValues: {
      farmerStorageLinkId: '',
      variety: '',
      selectedIncomingGatePassIds: [] as string[],
      manualGatePassNumber: undefined as number | undefined,
      date: todayIso,
      quantities: createDefaultQuantities(),
      remarks: '',
    },
    onOpenReview: options.onOpenReview,
    onSubmitParsed: options.onCreate,
  });
}

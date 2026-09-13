import {
  createDefaultQuantities,
  type GradingFormValues,
} from '@/features/grading/schemas/grading-form-schema';
import { useGradingForm, type GradingFormApi } from '@/features/grading/forms/use-grading-form';

export type { GradingFormValues, GradingFormApi };

type UseEditGradingFormOptions = {
  defaultValues: GradingFormValues;
  onOpenReview?: () => void;
  onUpdate?: (values: GradingFormValues) => Promise<void>;
};

export function useEditGradingForm(options: UseEditGradingFormOptions) {
  return useGradingForm({
    defaultValues: options.defaultValues,
    onOpenReview: options.onOpenReview,
    onSubmitParsed: options.onUpdate,
  });
}

export function createEmptyGradingFormValues(): GradingFormValues {
  return {
    farmerStorageLinkId: '',
    variety: '',
    selectedIncomingGatePassIds: [],
    manualGatePassNumber: undefined,
    date: new Date().toISOString(),
    quantities: createDefaultQuantities(),
    remarks: '',
  };
}

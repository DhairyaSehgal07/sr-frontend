import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateGradingGatePass } from '@/features/grading/api/use-create-grading-gate-pass';
import { useCreateGradingForm } from '@/features/grading/forms/use-create-grading-form';
import { GradingSummarySheet } from '@/features/grading/forms/grading-summary-sheet';
import {
  GRADING_FORM_STEPS,
  gradingFormSchema,
} from '@/features/grading/schemas/grading-form-schema';
import { useGetReceiptVoucherNumber, voucherNumberKeys } from '@/hooks/use-get-voucher-number';
import { queryClient } from '@/lib/queryClient';

import { Stepper } from '@/components/stepper';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FillDetailsStep } from '@/features/grading/forms/steps/fill-details-step';
import { SelectGatePassesStep } from '@/features/grading/forms/steps/select-gate-passes-step';
import type { GradingFormValues } from '@/features/grading/schemas/grading-form-schema';
import { scrollMainToTop } from '@/lib/scroll-to-top';
import { useFarmerLinkOptions } from '@/features/people/api/use-farmer-link-options';
import { farmerLinkOptionsToComboboxOptions } from '@/features/people/utils/farmer-link-combobox';

const STEPS = GRADING_FORM_STEPS;

const FILL_DETAILS_STEP_INDEX = 1;

const CreateGradingForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const formTopRef = useRef<HTMLDivElement>(null);
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;
  const {
    data: nextVoucherNumber,
    isLoading: isLoadingVoucherNumber,
    isError: isVoucherNumberError,
  } = useGetReceiptVoucherNumber('grading-gate-pass');
  const { mutateAsync: createGradingGatePass } = useCreateGradingGatePass();
  const form = useCreateGradingForm({
    onOpenReview: () => setReviewOpen(true),
    onCreate: async (parsed) => {
      const gatePassNo = queryClient.getQueryData<number>(
        voucherNumberKeys.detail('grading-gate-pass'),
      );

      if (gatePassNo == null) {
        toast.error('Gate pass number is unavailable. Refresh and try again.', {
          position: 'bottom-right',
        });
        return;
      }

      try {
        const { message } = await createGradingGatePass({
          form: parsed,
          gatePassNo,
        });

        toast.success(message ?? 'Grading gate pass created', {
          position: 'bottom-right',
        });
        setReviewOpen(false);
        form.reset();
        setCurrentStep(0);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to create grading gate pass', {
          position: 'bottom-right',
        });
      }
    },
  });
  const { data: farmerLinkOptions = [] } = useFarmerLinkOptions();
  const farmerOptions = useMemo(
    () => farmerLinkOptionsToComboboxOptions(farmerLinkOptions),
    [farmerLinkOptions],
  );

  const handleOpenReview = () => {
    void form.handleSubmit({ submitAction: 'review' });
  };

  const handleConfirmSubmit = () => {
    void form.handleSubmit({ submitAction: 'submit' });
  };

  const handleReset = () => {
    form.reset();
    setCurrentStep(0);
  };

  const touchSelectStepFields = () => {
    void form.validateField('farmerStorageLinkId', 'change');
    void form.validateField('variety', 'change');
    void form.validateField('selectedIncomingGatePassIds', 'change');
    form.setFieldMeta('farmerStorageLinkId', (prev) => ({
      ...prev,
      isTouched: true,
    }));
    form.setFieldMeta('variety', (prev) => ({
      ...prev,
      isTouched: true,
    }));
    form.setFieldMeta('selectedIncomingGatePassIds', (prev) => ({
      ...prev,
      isTouched: true,
    }));
  };

  useEffect(() => {
    if (currentStep !== FILL_DETAILS_STEP_INDEX) return;

    const frame = requestAnimationFrame(() => {
      scrollMainToTop();
      formTopRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    });

    return () => cancelAnimationFrame(frame);
  }, [currentStep]);

  const handleNext = (values: GradingFormValues) => {
    const isCurrentStepValid = STEPS[currentStep].schema.safeParse(values).success;
    if (isCurrentStepValid) {
      setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1));
      return;
    }
    if (currentStep === 0) {
      touchSelectStepFields();
    }
  };

  return (
    <Card ref={formTopRef} className="mx-auto w-full max-w-4xl scroll-mt-4 shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-6">
        <CardTitle className="text-2xl">
          Grading Gate Pass{' '}
          <span className="font-mono text-2xl tabular-nums text-primary">
            {isLoadingVoucherNumber
              ? '…'
              : isVoucherNumberError || nextVoucherNumber == null
                ? '—'
                : `#${nextVoucherNumber}`}
          </span>
        </CardTitle>
        <CardDescription className="text-base">
          Enter how many bags were created after grading a truck
        </CardDescription>
        <Stepper
          className="mt-6"
          steps={STEPS}
          currentStep={currentStep + 1}
          aria-label="Grading progress"
        />
      </CardHeader>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <CardContent className="pt-8 pb-8">
          {currentStep === 0 && <SelectGatePassesStep form={form} />}
          {currentStep === 1 && <FillDetailsStep form={form} />}
        </CardContent>

        <CardFooter className="flex justify-between border-t bg-muted/30 py-6">
          <Button
            type="button"
            variant="outline"
            disabled={isFirst}
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>

            <form.Subscribe
              selector={(state) => ({
                values: state.values,
                isSubmitting: state.isSubmitting,
              })}
              children={({ values, isSubmitting }) =>
                isLast ? (
                  <Button type="button" disabled={isSubmitting} onClick={handleOpenReview}>
                    {isSubmitting ? 'Validating…' : 'Review'}
                  </Button>
                ) : (
                  <Button type="button" onClick={() => handleNext(values)}>
                    Next
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                )
              }
            />
          </div>
        </CardFooter>
      </form>

      <form.Subscribe
        selector={(state) => ({
          values: state.values,
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
        children={({ values, canSubmit, isSubmitting }) => {
          const parsed = gradingFormSchema.safeParse(values);

          return (
            <GradingSummarySheet
              open={reviewOpen}
              onOpenChange={setReviewOpen}
              values={parsed.success ? parsed.data : null}
              farmerOptions={farmerOptions}
              onBack={() => setReviewOpen(false)}
              onSubmit={handleConfirmSubmit}
              canSubmit={canSubmit}
              isSubmitting={isSubmitting}
            />
          );
        }}
      />
    </Card>
  );
};

export default CreateGradingForm;

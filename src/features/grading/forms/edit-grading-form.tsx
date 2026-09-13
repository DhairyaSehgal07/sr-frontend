import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import type { GradingGatePass } from '@/features/grading/api/types';
import { useGradingGatePassById } from '@/features/grading/api/use-grading-gate-pass-by-id';
import { useUpdateGradingGatePass } from '@/features/grading/api/use-update-grading-gate-pass';
import { GradingSummarySheet } from '@/features/grading/forms/grading-summary-sheet';
import { FillDetailsStep } from '@/features/grading/forms/steps/fill-details-step';
import { SelectGatePassesStep } from '@/features/grading/forms/steps/select-gate-passes-step';
import { useEditGradingForm } from '@/features/grading/forms/use-edit-grading-form';
import {
  GRADING_FORM_STEPS,
  gradingFormSchema,
  type GradingFormValues,
} from '@/features/grading/schemas/grading-form-schema';
import {
  gradingGatePassToFormValues,
  gradingIncomingRefsToSelectRows,
  resolveGradingIncomingGatePassIds,
} from '@/features/grading/utils/grading-gate-pass-to-form-values';
import { useFarmerLinkOptions } from '@/features/people/api/use-farmer-link-options';
import { farmerLinkOptionsToComboboxOptions } from '@/features/people/utils/farmer-link-combobox';
import { scrollMainToTop } from '@/lib/scroll-to-top';

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

const STEPS = GRADING_FORM_STEPS;
const FILL_DETAILS_STEP_INDEX = 1;

type EditGradingFormProps = {
  gatePassId: string;
};

const EditGradingForm = ({ gatePassId }: EditGradingFormProps) => {
  const {
    gatePass,
    isLoading: isLoadingGatePass,
    isError: isGatePassError,
    error: gatePassError,
  } = useGradingGatePassById(gatePassId);

  if (isLoadingGatePass) {
    return (
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardContent className="flex min-h-64 items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading grading gate pass…
        </CardContent>
      </Card>
    );
  }

  if (isGatePassError) {
    return (
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardContent className="flex min-h-64 items-center justify-center py-12 text-center">
          <p className="text-sm text-destructive">
            {gatePassError?.message ?? 'Failed to load grading gate pass.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!gatePass) {
    return (
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardContent className="flex min-h-64 items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">Grading gate pass not found.</p>
        </CardContent>
      </Card>
    );
  }

  return <EditGradingFormFields key={gatePass._id} gatePass={gatePass} />;
};

type EditGradingFormFieldsProps = {
  gatePass: GradingGatePass;
};

function EditGradingFormFields({ gatePass }: EditGradingFormFieldsProps) {
  const queryClient = useQueryClient();
  const farmerStorageLinkId =
    typeof gatePass.farmerStorageLinkId === 'string'
      ? gatePass.farmerStorageLinkId
      : (gatePass.farmerStorageLinkId._id ?? '');
  const prefilledFarmerOption = useMemo(() => {
    if (typeof gatePass.farmerStorageLinkId === 'string') return undefined;
    const link = gatePass.farmerStorageLinkId;
    const id = link._id;
    if (!id) return undefined;
    const name = link.farmerId?.name ?? 'Farmer';

    return {
      id,
      label: `${name} (Account #${link.accountNumber ?? '—'})`,
      name,
      accountNumber: link.accountNumber ?? 0,
    };
  }, [gatePass.farmerStorageLinkId]);

  const selectedIncomingGatePassIds = useMemo(
    () =>
      resolveGradingIncomingGatePassIds(
        queryClient,
        gatePass.incomingGatePassIds,
        farmerStorageLinkId,
      ),
    [queryClient, gatePass.incomingGatePassIds, farmerStorageLinkId],
  );

  const linkedGatePasses = useMemo(
    () =>
      gradingIncomingRefsToSelectRows(
        gatePass.incomingGatePassIds,
        gatePass.variety,
        queryClient,
        farmerStorageLinkId,
      ),
    [queryClient, gatePass.incomingGatePassIds, gatePass.variety, farmerStorageLinkId],
  );

  const defaultValues = useMemo(
    () => gradingGatePassToFormValues(gatePass, selectedIncomingGatePassIds),
    [gatePass, selectedIncomingGatePassIds],
  );

  return (
    <EditGradingFormContent
      gatePass={gatePass}
      defaultValues={defaultValues}
      linkedGatePasses={linkedGatePasses}
      prefilledFarmerOption={prefilledFarmerOption}
    />
  );
}

type EditGradingFormContentProps = {
  gatePass: GradingGatePass;
  defaultValues: GradingFormValues;
  linkedGatePasses: ReturnType<typeof gradingIncomingRefsToSelectRows>;
  prefilledFarmerOption?: {
    id: string;
    label: string;
    name: string;
    accountNumber: number;
  };
};

function EditGradingFormContent({
  gatePass,
  defaultValues,
  linkedGatePasses,
  prefilledFarmerOption,
}: EditGradingFormContentProps) {
  const queryClient = useQueryClient();
  const farmerStorageLinkId =
    typeof gatePass.farmerStorageLinkId === 'string'
      ? gatePass.farmerStorageLinkId
      : (gatePass.farmerStorageLinkId._id ?? '');
  const [currentStep, setCurrentStep] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const formTopRef = useRef<HTMLDivElement>(null);
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;

  const { mutateAsync: updateGradingGatePass } = useUpdateGradingGatePass(gatePass._id);

  const form = useEditGradingForm({
    defaultValues,
    onOpenReview: () => setReviewOpen(true),
    onUpdate: async (parsed) => {
      try {
        const { message } = await updateGradingGatePass({
          id: gatePass._id,
          form: parsed,
        });

        toast.success(message ?? 'Grading gate pass updated', {
          position: 'bottom-right',
        });
        setReviewOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to update grading gate pass', {
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
    form.reset(defaultValues);
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

  useEffect(() => {
    const selectedIds = resolveGradingIncomingGatePassIds(
      queryClient,
      gatePass.incomingGatePassIds,
      farmerStorageLinkId,
    );
    form.setFieldValue('selectedIncomingGatePassIds', selectedIds);
  }, [form, gatePass.incomingGatePassIds, farmerStorageLinkId, queryClient]);

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
          Edit Grading Gate Pass{' '}
          <span className="font-mono text-2xl tabular-nums text-primary">
            #{gatePass.gatePassNo}
          </span>
        </CardTitle>
        <CardDescription className="text-base">
          Update incoming gate pass links and graded bag counts for this pass.
        </CardDescription>
        <Stepper
          className="mt-6"
          steps={STEPS}
          currentStep={currentStep + 1}
          aria-label="Grading edit progress"
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
          {currentStep === 0 && (
            <SelectGatePassesStep
              form={form}
              linkedGatePasses={linkedGatePasses}
              prefilledFarmerOption={prefilledFarmerOption}
              initialFarmerSearchLabel={prefilledFarmerOption?.label ?? ''}
              initialVariety={defaultValues.variety}
              showActionsColumn
              isFarmerLinkReadOnly
              gradingGatePassId={gatePass._id}
            />
          )}
          {currentStep === 1 && <FillDetailsStep form={form} linkedGatePasses={linkedGatePasses} />}
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
              linkedGatePasses={linkedGatePasses}
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
}

export default EditGradingForm;

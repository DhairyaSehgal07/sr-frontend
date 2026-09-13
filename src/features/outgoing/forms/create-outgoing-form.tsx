import { useMemo, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFarmerLinkOptions } from '@/features/people/api/use-farmer-link-options';
import { farmerLinkOptionsToComboboxOptions } from '@/features/people/utils/farmer-link-combobox';
import { OutgoingQuantitiesSection } from '@/features/outgoing/forms/outgoing-quantities-section';
import { OutgoingSummarySheet } from '@/features/outgoing/forms/outgoing-summary-sheet';
import { useCreateOutgoingForm } from '@/features/outgoing/forms/use-create-outgoing-form';
import {
  flattenOutgoingFormValues,
  outgoingFormSubmitSchema,
  outgoingStep1Schema,
  outgoingStep2SubmitSchema,
  type OutgoingFormValues,
} from '@/features/outgoing/schemas/outgoing-form-schema';
import { TransferGatePassesSection } from '@/features/transfer-stock/forms/transfer-gate-passes-section';
import { useStorageGatePassesForFarmer } from '@/features/transfer-stock/hooks/use-storage-gate-passes-for-farmer';
import { buildTransferItems } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { DatePickerInput } from '@/components/date-picker';
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from '@/components/searchable-option-combobox';
import { OUTGOING_CATEGORIES } from '@/lib/constants';

const CATEGORY_ITEMS = OUTGOING_CATEGORIES.map((value) => ({
  id: value,
  label: value,
}));

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

function parseOptionalPositiveNumber(value: string): number | undefined {
  if (value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

const numericInputProps = {
  type: 'number' as const,
  min: 0,
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
};

type OutgoingReviewSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmerStorageLinkId: string;
  values: OutgoingFormValues | null;
  farmerLabel: string;
  onBack: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
};

function OutgoingReviewSheet({
  open,
  onOpenChange,
  farmerStorageLinkId,
  values,
  farmerLabel,
  onBack,
  onSubmit,
  canSubmit,
  isSubmitting,
}: OutgoingReviewSheetProps) {
  const { data: passes } = useStorageGatePassesForFarmer(farmerStorageLinkId);
  const summaryValues = values != null ? flattenOutgoingFormValues(values) : null;
  const outgoingItems =
    summaryValues != null ? buildTransferItems(summaryValues.allocations, passes) : [];

  return (
    <OutgoingSummarySheet
      open={open}
      onOpenChange={onOpenChange}
      values={summaryValues}
      farmerLabel={farmerLabel}
      outgoingItems={outgoingItems}
      onBack={onBack}
      onSubmit={onSubmit}
      canSubmit={canSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

const CreateOutgoingForm = () => {
  const { data: farmerLinkOptions = [], isLoading: isLoadingFarmers } = useFarmerLinkOptions();
  const farmerOptions = useMemo<ComboboxOption[]>(
    () => farmerLinkOptionsToComboboxOptions(farmerLinkOptions),
    [farmerLinkOptions],
  );
  const [farmerSearch, setFarmerSearch] = useState('');
  const [farmerComboboxOpen, setFarmerComboboxOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryComboboxOpen, setCategoryComboboxOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [step, setStep] = useState(0);
  const submitStep1Ref = useRef<(() => void) | null>(null);

  const sortedFarmers = useMemo(
    () => filterAndSortOptions(farmerSearch, farmerOptions),
    [farmerSearch, farmerOptions],
  );

  const sortedCategories = useMemo(
    () => filterAndSortOptions(categorySearch, CATEGORY_ITEMS),
    [categorySearch],
  );

  function resetComboboxState() {
    setFarmerSearch('');
    setFarmerComboboxOpen(false);
    setCategorySearch('');
    setCategoryComboboxOpen(false);
  }

  const {
    form,
    nextVoucherNumber,
    isLoadingVoucherNumber,
    isVoucherNumberError,
    isGatePassNumberReady,
  } = useCreateOutgoingForm({
    onOpenReview: () => setReviewOpen(true),
    onCloseReview: () => setReviewOpen(false),
    onResetComboboxState: resetComboboxState,
  });

  const displayGatePassNo = isLoadingVoucherNumber
    ? '…'
    : isVoucherNumberError
      ? '—'
      : (nextVoucherNumber ?? '—');

  const getFarmerLabel = (farmerStorageLinkId: string) =>
    farmerOptions.find((option) => option.id === farmerStorageLinkId)?.label ?? farmerStorageLinkId;

  const handleOpenReview = () => {
    void form.handleSubmit({ submitAction: 'review' });
  };

  const handleConfirmSubmit = () => {
    void form.handleSubmit({ submitAction: 'submit' });
  };

  const handleReset = () => {
    form.reset();
    resetComboboxState();
    setStep(0);
    setReviewOpen(false);
  };

  return (
    <Card className="mx-auto w-full max-w-7xl shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-6">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          Outgoing{' '}
          <span className="font-mono text-xl tabular-nums text-primary sm:text-2xl">
            #{displayGatePassNo}
          </span>
        </CardTitle>
        <CardDescription className="text-base">
          Record stock leaving storage for a farmer account.
        </CardDescription>
        <p className="text-sm text-muted-foreground">
          Step {step + 1} of 2 · {step === 0 ? 'Outgoing details' : 'Bag quantities'}
        </p>
      </CardHeader>

      <form id="create-outgoing-form" noValidate onSubmit={(e) => e.preventDefault()}>
        <CardContent className="pt-8 pb-8">
          {step === 0 ? (
            <form.FormGroup
              name="step1"
              validators={{
                onChange: outgoingStep1Schema,
                onSubmit: outgoingStep1Schema,
              }}
              onGroupSubmit={() => setStep(1)}
              children={(group) => {
                submitStep1Ref.current = () => {
                  void group.handleSubmit();
                };

                return (
                <FieldGroup className="@container/field-group gap-10">
                  <FieldSet>
                    <FieldLegend className="font-heading text-base font-semibold">
                      Outgoing details
                    </FieldLegend>
                    <FieldDescription>
                      Select the farmer account and outgoing date.
                    </FieldDescription>
                    <FieldGroup className="mt-5 grid grid-cols-1 gap-6">
                      <form.Field name="step1.farmerStorageLinkId">
                        {(field) => {
                          const isInvalid = isFieldInvalid(field.state.meta);
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor="outgoing-farmer">Farmer</FieldLabel>
                              <SearchableOptionCombobox
                                id="outgoing-farmer"
                                name={field.name}
                                value={field.state.value}
                                onValueChange={(value) => {
                                  field.handleChange(value);
                                  form.setFieldValue('step1.allocations', {});
                                  form.setFieldValue('step2.weightsBySize', {});
                                }}
                                onBlur={field.handleBlur}
                                isInvalid={isInvalid}
                                placeholder={
                                  isLoadingFarmers ? 'Loading farmers…' : 'Search farmers…'
                                }
                                emptyMessage={
                                  isLoadingFarmers ? 'Loading farmers…' : 'No farmers found.'
                                }
                                options={farmerOptions}
                                sortedOptions={sortedFarmers}
                                search={farmerSearch}
                                setSearch={setFarmerSearch}
                                open={farmerComboboxOpen}
                                setOpen={setFarmerComboboxOpen}
                                disabled={isLoadingFarmers}
                              />
                              <FieldDescription>
                                Farmer account stock is outgoing from.
                              </FieldDescription>
                              {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                          );
                        }}
                      </form.Field>

                      <form.Field name="step1.date">
                        {(field) => {
                          const isInvalid = isFieldInvalid(field.state.meta);
                          return (
                            <Field data-invalid={isInvalid} className="@md/field-group:max-w-sm">
                              <DatePickerInput
                                id={field.name}
                                label="Date"
                                value={field.state.value ? new Date(field.state.value) : undefined}
                                onChange={(date) =>
                                  field.handleChange(date ? date.toISOString() : '')
                                }
                                onBlur={field.handleBlur}
                                aria-invalid={isInvalid}
                                placeholder="Pick a date"
                              />
                              {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                          );
                        }}
                      </form.Field>

                      <form.Field name="step1.manualGatePassNumber">
                        {(field) => {
                          const isInvalid = isFieldInvalid(field.state.meta);
                          return (
                            <Field data-invalid={isInvalid} className="@md/field-group:max-w-sm">
                              <FieldLabel htmlFor={field.name}>Manual gate pass no.</FieldLabel>
                              <Input
                                {...numericInputProps}
                                id={field.name}
                                name={field.name}
                                value={field.state.value != null ? String(field.state.value) : ''}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(parseOptionalPositiveNumber(e.target.value))
                                }
                                inputMode="numeric"
                                placeholder="Optional"
                                aria-invalid={isInvalid}
                                className="h-11 text-base tabular-nums"
                              />
                              <FieldDescription>
                                Optional reference number if used on the physical pass.
                              </FieldDescription>
                              {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                          );
                        }}
                      </form.Field>
                    </FieldGroup>
                  </FieldSet>

                  <FieldSet>
                    <FieldLegend className="font-heading text-base font-semibold">
                      Route &amp; vehicle
                    </FieldLegend>
                    <FieldDescription>
                      Source, destination, and truck for this outgoing dispatch.
                    </FieldDescription>
                    <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-3">
                      <form.Field name="step1.from">
                        {(field) => {
                          const isInvalid = isFieldInvalid(field.state.meta);
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>From</FieldLabel>
                              <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="e.g. Kapur Cold Storage"
                                autoComplete="off"
                                aria-invalid={isInvalid}
                                className="h-11 text-base"
                              />
                              {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                          );
                        }}
                      </form.Field>

                      <form.Field name="step1.to">
                        {(field) => {
                          const isInvalid = isFieldInvalid(field.state.meta);
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>To</FieldLabel>
                              <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="e.g. Azadpur Mandi"
                                autoComplete="off"
                                aria-invalid={isInvalid}
                                className="h-11 text-base"
                              />
                              {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                          );
                        }}
                      </form.Field>

                      <form.Field name="step1.truckNumber">
                        {(field) => {
                          const isInvalid = isFieldInvalid(field.state.meta);
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>Truck number</FieldLabel>
                              <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                                placeholder="Optional"
                                autoComplete="off"
                                aria-invalid={isInvalid}
                                className="h-11 text-base uppercase"
                              />
                              <FieldDescription>
                                Optional vehicle registration for this dispatch.
                              </FieldDescription>
                              {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                          );
                        }}
                      </form.Field>
                    </FieldGroup>
                  </FieldSet>

                  <FieldSet>
                    <FieldLegend className="font-heading text-base font-semibold">
                      Billing &amp; bilti
                    </FieldLegend>
                    <FieldDescription>
                      Category and bill/bilti reference numbers for this dispatch.
                    </FieldDescription>
                    <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2 @lg/field-group:grid-cols-3">
                      <form.Field name="step1.category">
                        {(field) => {
                          const isInvalid = isFieldInvalid(field.state.meta);
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor="outgoing-category">Category</FieldLabel>
                              <SearchableOptionCombobox
                                id="outgoing-category"
                                name={field.name}
                                value={field.state.value}
                                onValueChange={field.handleChange}
                                onBlur={field.handleBlur}
                                isInvalid={isInvalid}
                                placeholder="Select category"
                                emptyMessage="No categories found."
                                options={CATEGORY_ITEMS}
                                sortedOptions={sortedCategories}
                                search={categorySearch}
                                setSearch={setCategorySearch}
                                open={categoryComboboxOpen}
                                setOpen={setCategoryComboboxOpen}
                              />
                              {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                          );
                        }}
                      </form.Field>

                      <form.Field name="step1.billNumber">
                        {(field) => {
                          const isInvalid = isFieldInvalid(field.state.meta);
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>Bill number</FieldLabel>
                              <Input
                                {...numericInputProps}
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                inputMode="numeric"
                                placeholder="e.g. 1234"
                                aria-invalid={isInvalid}
                                className="h-11 text-base tabular-nums"
                              />
                              {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                          );
                        }}
                      </form.Field>

                      <form.Field name="step1.biltiNumber">
                        {(field) => {
                          const isInvalid = isFieldInvalid(field.state.meta);
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>Bilti number</FieldLabel>
                              <Input
                                {...numericInputProps}
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                inputMode="numeric"
                                placeholder="e.g. 5678"
                                aria-invalid={isInvalid}
                                className="h-11 text-base tabular-nums"
                              />
                              {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                          );
                        }}
                      </form.Field>

                      <form.Field name="step1.billBook">
                        {(field) => {
                          const isInvalid = isFieldInvalid(field.state.meta);
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>Bill book</FieldLabel>
                              <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="e.g. Book A"
                                aria-invalid={isInvalid}
                                className="h-11 text-base"
                              />
                              {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                          );
                        }}
                      </form.Field>

                      <form.Field name="step1.biltiBook">
                        {(field) => {
                          const isInvalid = isFieldInvalid(field.state.meta);
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>Bilti book</FieldLabel>
                              <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="e.g. Book B"
                                aria-invalid={isInvalid}
                                className="h-11 text-base"
                              />
                              {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                          );
                        }}
                      </form.Field>
                    </FieldGroup>
                  </FieldSet>

                  <form.Subscribe
                    selector={(state) => state.values.step1.farmerStorageLinkId}
                    children={(farmerStorageLinkId) => (
                      <FieldSet>
                        <FieldLegend className="font-heading text-base font-semibold">
                          Storage gate passes
                        </FieldLegend>
                        <FieldDescription>
                          Select vouchers and quantities to mark as outgoing.
                        </FieldDescription>
                        <div className="mt-5">
                          <form.Field name="step1.allocations">
                            {(allocField) => (
                              <TransferGatePassesSection
                                key={farmerStorageLinkId || 'no-farmer'}
                                fromFarmerStorageLinkId={farmerStorageLinkId}
                                allocations={allocField.state.value}
                                onAllocationsChange={allocField.handleChange}
                                farmerPromptLabel="farmer"
                              />
                            )}
                          </form.Field>
                        </div>
                      </FieldSet>
                    )}
                  />

                </FieldGroup>
                );
              }}
            />
          ) : (
            <form.FormGroup
              name="step2"
              validators={{
                onChange: outgoingStep2SubmitSchema,
                onSubmit: outgoingStep2SubmitSchema,
              }}
              children={() => (
                <FieldGroup className="@container/field-group gap-10">
                  <form.Subscribe
                    selector={(state) => ({
                      farmerStorageLinkId: state.values.step1.farmerStorageLinkId,
                      allocations: state.values.step1.allocations,
                    })}
                    children={({ farmerStorageLinkId, allocations }) => (
                      <OutgoingQuantitiesSection
                        form={form}
                        farmerStorageLinkId={farmerStorageLinkId}
                        allocations={allocations}
                        onBack={() => setStep(0)}
                      />
                    )}
                  />

                  <FieldSet>
                    <FieldLegend className="font-heading text-base font-semibold">
                      Additional notes
                    </FieldLegend>
                    <FieldGroup className="mt-5">
                      <form.Field name="step2.remarks">
                        {(field) => {
                          const isInvalid = isFieldInvalid(field.state.meta);
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name} className="sr-only">
                                Remarks
                              </FieldLabel>
                              <Textarea
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                aria-invalid={isInvalid}
                                placeholder="Add any additional comments or observations (optional)"
                                className="min-h-[120px] resize-y text-base"
                              />
                              {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                          );
                        }}
                      </form.Field>
                    </FieldGroup>
                  </FieldSet>
                </FieldGroup>
              )}
            />
          )}
        </CardContent>

        <CardFooter className="justify-end gap-3 border-t bg-muted/30 py-6">
          {step === 1 ? (
            <Button variant="outline" type="button" onClick={() => setStep(0)}>
              Back
            </Button>
          ) : null}
          <Button variant="outline" type="button" onClick={handleReset}>
            Reset form
          </Button>
          {step === 0 ? (
            <Button
              type="button"
              disabled={!isGatePassNumberReady}
              onClick={() => submitStep1Ref.current?.()}
            >
              Next
            </Button>
          ) : (
            <form.Subscribe
              selector={(state) => state.isSubmitting}
              children={(isSubmitting) => (
                <Button
                  type="button"
                  disabled={isSubmitting || !isGatePassNumberReady}
                  onClick={handleOpenReview}
                >
                  {isSubmitting ? 'Validating…' : 'Review'}
                </Button>
              )}
            />
          )}
        </CardFooter>
      </form>

      <form.Subscribe
        selector={(state) => ({
          values: state.values,
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
        children={({ values, canSubmit, isSubmitting }) => {
          const parsed = outgoingFormSubmitSchema.safeParse(values);
          const farmerId = parsed.success
            ? parsed.data.step1.farmerStorageLinkId
            : values.step1.farmerStorageLinkId;

          return (
            <OutgoingReviewSheet
              open={reviewOpen}
              onOpenChange={setReviewOpen}
              farmerStorageLinkId={farmerId}
              values={parsed.success ? parsed.data : null}
              farmerLabel={
                parsed.success ? getFarmerLabel(parsed.data.step1.farmerStorageLinkId) : ''
              }
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

export default CreateOutgoingForm;

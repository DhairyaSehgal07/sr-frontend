import { useEffect, useMemo, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IncomingSummarySheet } from '@/features/incoming/forms/incoming-summary-sheet';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePickerInput } from '@/components/date-picker';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { useFarmerLinkOptions } from '@/features/people/api/use-farmer-link-options';
import { useFarmerStorageLinks } from '@/features/people/api/use-farmer-storage-links';
import { AddFarmerDialog } from '@/features/people/components/add-farmer-dialog';
import type { FarmerStorageLink } from '@/features/people/types';
import { formatFarmerLinkLabel } from '@/features/people/utils/farmer-link-combobox';
import {
  farmerLinkOptionsToComboboxOptions,
  getFarmerLinkLabel,
} from '@/features/people/utils/farmer-link-combobox';
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from '@/components/searchable-option-combobox';
import {
  incomingFormSchema,
  weightSlipSchema,
} from '@/features/incoming/schemas/incoming-form-schema';
import { defaultSubmitMeta } from '@/features/incoming/types';
import { INCOMING_CATEGORIES, INCOMING_STAGES, POTATO_VARIETY_OPTIONS } from '@/lib/constants';
import { useCreateIncomingGatePass } from '@/features/incoming/api/use-create-incoming-gate-pass';
import { useGetReceiptVoucherNumber, voucherNumberKeys } from '@/hooks/use-get-voucher-number';
import { queryClient } from '@/lib/queryClient';

const CATEGORY_ITEMS = INCOMING_CATEGORIES.map((value) => ({
  id: value,
  label: value,
}));

const STAGE_ITEMS = INCOMING_STAGES.map((value) => ({
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

function parseNumber(value: string): number {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function parseWeightKgInput(value: string): number {
  if (value === '') return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/** Show empty input when stored value is 0 (cleared); keeps weight keys in form state. */
function formatWeightKgDisplay(value: number | undefined): string {
  return value == null || value === 0 ? '' : String(value);
}

const numericInputProps = {
  type: 'number' as const,
  min: 0,
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
};

const CreateIncomingForm = () => {
  const userId = useAuthStore((s) => s.user?._id ?? '');
  const todayIso = new Date().toISOString();
  const { data: farmerLinkOptions = [], isLoading: isLoadingFarmers } = useFarmerLinkOptions();
  const { data: farmerStorageLinks = [] } = useFarmerStorageLinks();
  const {
    data: nextVoucherNumber,
    isLoading: isLoadingVoucherNumber,
    isError: isVoucherNumberError,
  } = useGetReceiptVoucherNumber('incoming-gate-pass');
  const { mutateAsync: createIncomingGatePass } = useCreateIncomingGatePass();
  const isGatePassNumberReady =
    !isLoadingVoucherNumber && !isVoucherNumberError && nextVoucherNumber != null;
  const farmerOptions = useMemo<ComboboxOption[]>(
    () => farmerLinkOptionsToComboboxOptions(farmerLinkOptions),
    [farmerLinkOptions],
  );
  const [farmerSearch, setFarmerSearch] = useState('');
  const [farmerComboboxOpen, setFarmerComboboxOpen] = useState(false);
  const [varietySearch, setVarietySearch] = useState('');
  const [varietyComboboxOpen, setVarietyComboboxOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryComboboxOpen, setCategoryComboboxOpen] = useState(false);
  const [stageSearch, setStageSearch] = useState('');
  const [stageComboboxOpen, setStageComboboxOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [addFarmerOpen, setAddFarmerOpen] = useState(false);

  const sortedFarmers = useMemo(
    () => filterAndSortOptions(farmerSearch, farmerOptions),
    [farmerSearch, farmerOptions],
  );
  const sortedVarieties = useMemo(
    () => filterAndSortOptions(varietySearch, POTATO_VARIETY_OPTIONS),
    [varietySearch],
  );
  const sortedCategories = useMemo(
    () => filterAndSortOptions(categorySearch, CATEGORY_ITEMS),
    [categorySearch],
  );
  const sortedStages = useMemo(() => filterAndSortOptions(stageSearch, STAGE_ITEMS), [stageSearch]);

  const resetComboboxState = () => {
    setFarmerSearch('');
    setFarmerComboboxOpen(false);
    setVarietySearch('');
    setVarietyComboboxOpen(false);
    setCategorySearch('');
    setCategoryComboboxOpen(false);
    setStageSearch('');
    setStageComboboxOpen(false);
  };

  const form = useForm({
    defaultValues: {
      manualGatePassNumber: undefined as number | undefined,
      truckNumber: '',
      farmerStorageLinkId: '',
      createdBy: userId,
      variety: '',
      category: '',
      stage: '',
      date: todayIso,
      bagsReceived: 0,
      weightSlip: {
        slipNumber: '',
        grossWeightKg: 0,
        tareWeightKg: 0,
      },
      status: 'NOT_GRADED',
      remarks: '',
    },
    validators: {
      onBlur: incomingFormSchema,
      onSubmit: incomingFormSchema,
    },
    onSubmitMeta: defaultSubmitMeta,
    onSubmit: async ({ value, meta }) => {
      const parsed = incomingFormSchema.parse(value);

      if (meta.submitAction === 'review') {
        setReviewOpen(true);
        return;
      }

      const gatePassNo = queryClient.getQueryData<number>(
        voucherNumberKeys.detail('incoming-gate-pass'),
      );

      if (gatePassNo == null) {
        toast.error('Gate pass number is unavailable. Refresh and try again.', {
          position: 'bottom-right',
        });
        return;
      }

      try {
        const { message } = await createIncomingGatePass({
          form: parsed,
          gatePassNo,
        });

        toast.success(message ?? 'Incoming gate pass created', {
          position: 'bottom-right',
        });
        setReviewOpen(false);
        form.reset();
        resetComboboxState();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to create incoming gate pass',
          { position: 'bottom-right' },
        );
      }
    },
  });

  const getFarmerLabel = (farmerStorageLinkId: string) =>
    getFarmerLinkLabel(farmerStorageLinkId, farmerLinkOptions);

  const handleOpenReview = () => {
    void form.handleSubmit({ submitAction: 'review' });
  };

  const handleConfirmSubmit = () => {
    void form.handleSubmit({ submitAction: 'submit' });
  };

  const handleFarmerCreated = (link: FarmerStorageLink) => {
    form.setFieldValue('farmerStorageLinkId', link._id);
    setFarmerSearch(
      formatFarmerLinkLabel({
        farmerStorageLinkId: link._id,
        name: link.farmerId.name,
        accountNumber: link.accountNumber,
      }),
    );
    setFarmerComboboxOpen(false);
  };

  useEffect(() => {
    if (userId) {
      form.setFieldValue('createdBy', userId);
    }
  }, [userId]);

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-6">
        <CardTitle className="text-2xl">
          Incoming Gate Pass{' '}
          <span className="font-mono text-2xl tabular-nums text-primary">
            {isLoadingVoucherNumber
              ? '…'
              : isVoucherNumberError || nextVoucherNumber == null
                ? '—'
                : `#${nextVoucherNumber}`}
          </span>
        </CardTitle>
        <CardDescription className="text-base">
          Record transport, crop, and weighbridge details for a new incoming gate pass.
        </CardDescription>
      </CardHeader>

      {/* Wrap the content and footer inside the form so the submit
        button in the footer triggers the submission properly.
      */}
      <form id="create-incoming-form" noValidate onSubmit={(e) => e.preventDefault()}>
        <CardContent className="pt-8 pb-8">
          <FieldGroup className="@container/field-group gap-10">
            {/* General Information */}
            <FieldSet>
              <FieldLegend className="text-lg font-semibold">General Information</FieldLegend>
              <FieldDescription>Basic details regarding the transport and timing.</FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                <form.Field name="manualGatePassNumber">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Manual Gate Pass No.</FieldLabel>
                        <Input
                          {...numericInputProps}
                          id={field.name}
                          name={field.name}
                          value={field.state.value ?? ''}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(parseOptionalPositiveNumber(e.target.value))
                          }
                          aria-invalid={isInvalid}
                          placeholder="e.g. 1024 (optional)"
                        />
                        <FieldDescription>
                          Leave blank if no manual slip number was issued.
                        </FieldDescription>
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="truckNumber">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Truck Number</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="e.g. PB08 AB 1234"
                          className="uppercase"
                          autoComplete="off"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="date">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <DatePickerInput
                          id={field.name}
                          label="Date"
                          value={field.state.value ? new Date(field.state.value) : undefined}
                          onChange={(date) => field.handleChange(date ? date.toISOString() : '')}
                          onBlur={field.handleBlur}
                          aria-invalid={isInvalid}
                          placeholder="Pick a date"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="farmerStorageLinkId">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid} className="@md/field-group:col-span-2">
                        <FieldLabel htmlFor="create-incoming-farmer">Farmer</FieldLabel>
                        <div className="flex gap-2">
                          <div className="min-w-0 flex-1">
                            <SearchableOptionCombobox
                              id="create-incoming-farmer"
                              name={field.name}
                              value={field.state.value}
                              onValueChange={field.handleChange}
                              onBlur={field.handleBlur}
                              isInvalid={isInvalid}
                              placeholder={
                                isLoadingFarmers ? 'Loading farmers...' : 'Search farmers...'
                              }
                              emptyMessage={
                                isLoadingFarmers ? 'Loading farmers...' : 'No farmers found.'
                              }
                              options={farmerOptions}
                              sortedOptions={sortedFarmers}
                              search={farmerSearch}
                              setSearch={setFarmerSearch}
                              open={farmerComboboxOpen}
                              setOpen={setFarmerComboboxOpen}
                              disabled={isLoadingFarmers}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            className="h-auto min-h-9 shrink-0 gap-1.5 px-3"
                            onClick={() => setAddFarmerOpen(true)}
                            aria-label="Add farmer"
                          >
                            <UserPlus className="size-4 shrink-0" />
                            <span className="hidden sm:inline">Add Farmer</span>
                          </Button>
                        </div>
                        <FieldDescription>
                          Link this pass to a storage account. If the farmer is not listed, add them
                          here without leaving this form.
                        </FieldDescription>
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            {/* Crop Information */}
            <FieldSet>
              <FieldLegend className="text-lg font-semibold">Crop Information</FieldLegend>
              <FieldDescription>
                Variety, grade, and quantity received at the gate.
              </FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                <form.Field name="variety">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="create-incoming-variety">Variety</FieldLabel>
                        <SearchableOptionCombobox
                          id="create-incoming-variety"
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          placeholder="Search varieties..."
                          emptyMessage="No varieties found."
                          options={POTATO_VARIETY_OPTIONS}
                          sortedOptions={sortedVarieties}
                          search={varietySearch}
                          setSearch={setVarietySearch}
                          open={varietyComboboxOpen}
                          setOpen={setVarietyComboboxOpen}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="category">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="create-incoming-category">Category</FieldLabel>
                        <SearchableOptionCombobox
                          id="create-incoming-category"
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          placeholder="Search categories..."
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

                <form.Field name="stage">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="create-incoming-stage">Stage</FieldLabel>
                        <SearchableOptionCombobox
                          id="create-incoming-stage"
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          placeholder="Search stages..."
                          emptyMessage="No stages found."
                          options={STAGE_ITEMS}
                          sortedOptions={sortedStages}
                          search={stageSearch}
                          setSearch={setStageSearch}
                          open={stageComboboxOpen}
                          setOpen={setStageComboboxOpen}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="bagsReceived">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Bags Received</FieldLabel>
                        <Input
                          {...numericInputProps}
                          id={field.name}
                          name={field.name}
                          value={field.state.value || ''}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(parseNumber(e.target.value))}
                          aria-invalid={isInvalid}
                          placeholder="Quantity count"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            {/* Weight Slip Data */}
            <FieldSet>
              <FieldLegend className="text-lg font-semibold">Weight Slip Data</FieldLegend>
              <FieldDescription>Details captured from the weighbridge slip.</FieldDescription>
              <form.Field name="weightSlip" validators={{ onBlur: weightSlipSchema }}>
                {(field) => {
                  const weightSlip = field.state.value;
                  const isInvalid = isFieldInvalid(field.state.meta);
                  const gross = weightSlip.grossWeightKg ?? 0;
                  const tare = weightSlip.tareWeightKg ?? 0;
                  const net = gross - tare;
                  const showNet = gross > 0 && tare >= 0 && net >= 0;

                  const patchWeightSlip = (patch: Partial<typeof weightSlip>) => {
                    field.handleChange({ ...weightSlip, ...patch });
                  };

                  return (
                    <>
                      <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-3">
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="create-incoming-slip-number">Slip Number</FieldLabel>
                          <Input
                            id="create-incoming-slip-number"
                            name="weightSlip.slipNumber"
                            value={weightSlip.slipNumber}
                            onBlur={field.handleBlur}
                            onChange={(e) => patchWeightSlip({ slipNumber: e.target.value })}
                            aria-invalid={isInvalid}
                            placeholder="e.g. WS-001"
                            autoComplete="off"
                          />
                        </Field>

                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="create-incoming-gross-weight">
                            Gross Weight (kg)
                          </FieldLabel>
                          <Input
                            {...numericInputProps}
                            id="create-incoming-gross-weight"
                            name="weightSlip.grossWeightKg"
                            value={formatWeightKgDisplay(weightSlip.grossWeightKg)}
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                              patchWeightSlip({
                                grossWeightKg: parseWeightKgInput(e.target.value),
                              })
                            }
                            aria-invalid={isInvalid}
                            placeholder="Total weight"
                          />
                        </Field>

                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="create-incoming-tare-weight">
                            Tare Weight (kg)
                          </FieldLabel>
                          <Input
                            {...numericInputProps}
                            id="create-incoming-tare-weight"
                            name="weightSlip.tareWeightKg"
                            value={formatWeightKgDisplay(weightSlip.tareWeightKg)}
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                              patchWeightSlip({
                                tareWeightKg: parseWeightKgInput(e.target.value),
                              })
                            }
                            aria-invalid={isInvalid}
                            placeholder="Tare Weight"
                          />
                        </Field>
                      </FieldGroup>

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} className="mt-2" />
                      )}

                      {showNet && (
                        <div className="mt-6 flex items-center justify-between rounded-md border bg-muted/50 px-4 py-3">
                          <span className="text-sm font-medium text-muted-foreground">
                            Calculated Net Weight
                          </span>
                          <span className="text-lg font-semibold tracking-tight text-foreground tabular-nums">
                            {net.toLocaleString('en-IN')} kg
                          </span>
                        </div>
                      )}
                    </>
                  );
                }}
              </form.Field>
            </FieldSet>

            <FieldSeparator />

            {/* Additional Notes */}
            <FieldSet>
              <FieldLegend className="text-lg font-semibold">Additional Notes</FieldLegend>
              <FieldGroup className="mt-5">
                <form.Field name="remarks">
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
                          placeholder="Add any additional comments or observations (Optional)"
                          className="min-h-[120px] resize-y"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </CardContent>

        <CardFooter className="justify-end gap-3 border-t bg-muted/30 py-6">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              form.reset();
              resetComboboxState();
            }}
          >
            Reset Form
          </Button>
          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button
                type="button"
                disabled={isSubmitting || !isGatePassNumberReady}
                onClick={handleOpenReview}
              >
                {isLoadingVoucherNumber
                  ? 'Loading pass no…'
                  : isSubmitting
                    ? 'Validating…'
                    : 'Review'}
              </Button>
            )}
          />
        </CardFooter>
      </form>

      <form.Subscribe
        selector={(state) => ({
          values: state.values,
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
        children={({ values, canSubmit, isSubmitting }) => {
          const parsed = incomingFormSchema.safeParse(values);

          return (
            <IncomingSummarySheet
              open={reviewOpen}
              onOpenChange={setReviewOpen}
              values={parsed.success ? parsed.data : null}
              farmerLabel={parsed.success ? getFarmerLabel(parsed.data.farmerStorageLinkId) : ''}
              onBack={() => setReviewOpen(false)}
              onSubmit={handleConfirmSubmit}
              canSubmit={canSubmit}
              isSubmitting={isSubmitting}
            />
          );
        }}
      />

      <AddFarmerDialog
        open={addFarmerOpen}
        onOpenChange={setAddFarmerOpen}
        links={farmerStorageLinks}
        onSuccess={handleFarmerCreated}
      />
    </Card>
  );
};

export default CreateIncomingForm;

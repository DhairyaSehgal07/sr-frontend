import { useEffect, useMemo, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Loader2 } from 'lucide-react';
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
import type { IncomingGatePass } from '@/features/incoming/api/types';
import { useIncomingGatePassById } from '@/features/incoming/api/use-incoming-gate-pass-by-id';
import { useUpdateIncomingGatePass } from '@/features/incoming/api/use-update-incoming-gate-pass';
import { useFarmerLinkOptions } from '@/features/people/api/use-farmer-link-options';
import {
  farmerLinkOptionsToComboboxOptions,
  getFarmerLinkLabel,
} from '@/features/people/utils/farmer-link-combobox';
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from '@/components/searchable-option-combobox';
import { incomingFormSchema } from '@/features/incoming/schemas/incoming-form-schema';
import { defaultSubmitMeta } from '@/features/incoming/types';
import { incomingGatePassToFormValues } from '@/features/incoming/utils/incoming-gate-pass-to-form-values';
import { INCOMING_CATEGORIES, INCOMING_STAGES, POTATO_VARIETY_OPTIONS } from '@/lib/constants';

const CATEGORY_ITEMS = INCOMING_CATEGORIES.map((value) => ({
  id: value,
  label: value,
}));

const STAGE_ITEMS = INCOMING_STAGES.map((value) => ({
  id: value,
  label: value,
}));

function ensureOptionInList(
  options: ComboboxOption[],
  value: string | undefined,
): ComboboxOption[] {
  if (!value?.trim()) return options;
  if (options.some((o) => o.id === value)) return options;
  return [...options, { id: value, label: value }];
}

function farmerSearchLabelFromGatePass(gatePass: IncomingGatePass): string {
  const link = gatePass.farmerStorageLinkId;
  if (!link || typeof link === 'string') return '';
  const name = link.farmerId?.name ?? '';
  return `${name} (Account #${link.accountNumber})`;
}

type EditIncomingFormProps = {
  gatePassId: string;
};

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

const numericInputProps = {
  type: 'number' as const,
  min: 0,
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
};

const EditIncomingForm = ({ gatePassId }: EditIncomingFormProps) => {
  const {
    gatePass,
    isLoading: isLoadingGatePass,
    isError: isGatePassError,
    error: gatePassError,
  } = useIncomingGatePassById(gatePassId);

  if (isLoadingGatePass) {
    return (
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardContent className="flex min-h-64 items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading gate pass…
        </CardContent>
      </Card>
    );
  }

  if (isGatePassError) {
    return (
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardContent className="flex min-h-64 items-center justify-center py-12 text-center">
          <p className="text-sm text-destructive">
            {gatePassError?.message ?? 'Failed to load incoming gate pass.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!gatePass) {
    return (
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardContent className="flex min-h-64 items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">Incoming gate pass not found.</p>
        </CardContent>
      </Card>
    );
  }

  return <EditIncomingFormFields key={gatePass._id} gatePass={gatePass} />;
};

type EditIncomingFormFieldsProps = {
  gatePass: IncomingGatePass;
};

function EditIncomingFormFields({ gatePass }: EditIncomingFormFieldsProps) {
  const userId = useAuthStore((s) => s.user?._id ?? '');
  const { mutateAsync: updateIncomingGatePass } = useUpdateIncomingGatePass(gatePass._id);
  const { data: farmerLinkOptions = [], isLoading: isLoadingFarmers } = useFarmerLinkOptions();

  const farmerOptions = useMemo<ComboboxOption[]>(() => {
    const base = farmerLinkOptionsToComboboxOptions(farmerLinkOptions);
    const link = gatePass.farmerStorageLinkId;
    if (!link || typeof link === 'string') return base;
    const id = link._id;
    if (!id || base.some((o) => o.id === id)) return base;
    const name = link.farmerId?.name ?? 'Farmer';
    return [
      ...base,
      {
        id,
        label: `${name} (Account #${link.accountNumber})`,
        name,
        accountNumber: link.accountNumber,
      },
    ];
  }, [farmerLinkOptions, gatePass]);

  const varietyOptions = useMemo(
    () => ensureOptionInList(POTATO_VARIETY_OPTIONS, gatePass.variety),
    [gatePass.variety],
  );
  const categoryOptions = useMemo(
    () => ensureOptionInList(CATEGORY_ITEMS, gatePass.category),
    [gatePass.category],
  );
  const stageOptions = useMemo(
    () => ensureOptionInList(STAGE_ITEMS, gatePass.stage),
    [gatePass.stage],
  );

  const [farmerSearch, setFarmerSearch] = useState(() => farmerSearchLabelFromGatePass(gatePass));
  const [farmerComboboxOpen, setFarmerComboboxOpen] = useState(false);
  const [varietySearch, setVarietySearch] = useState(() => gatePass.variety);
  const [varietyComboboxOpen, setVarietyComboboxOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState(() => gatePass.category);
  const [categoryComboboxOpen, setCategoryComboboxOpen] = useState(false);
  const [stageSearch, setStageSearch] = useState(() => gatePass.stage ?? '');
  const [stageComboboxOpen, setStageComboboxOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const sortedFarmers = useMemo(
    () => filterAndSortOptions(farmerSearch, farmerOptions),
    [farmerSearch, farmerOptions],
  );
  const sortedVarieties = useMemo(
    () => filterAndSortOptions(varietySearch, varietyOptions),
    [varietySearch, varietyOptions],
  );
  const sortedCategories = useMemo(
    () => filterAndSortOptions(categorySearch, categoryOptions),
    [categorySearch, categoryOptions],
  );
  const sortedStages = useMemo(
    () => filterAndSortOptions(stageSearch, stageOptions),
    [stageSearch, stageOptions],
  );

  const form = useForm({
    defaultValues: incomingGatePassToFormValues(gatePass, userId),
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

      try {
        const { message } = await updateIncomingGatePass({
          id: gatePass._id,
          form: parsed,
        });

        toast.success(message ?? 'Incoming gate pass updated', {
          position: 'bottom-right',
        });
        setReviewOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to update incoming gate pass',
          { position: 'bottom-right' },
        );
      }
    },
  });

  const getFarmerLabel = (farmerStorageLinkId: string) => {
    const fromList = getFarmerLinkLabel(farmerStorageLinkId, farmerLinkOptions);
    if (fromList !== farmerStorageLinkId) return fromList;
    const link = gatePass.farmerStorageLinkId;
    if (typeof link !== 'string' && link?._id === farmerStorageLinkId) {
      return farmerSearchLabelFromGatePass(gatePass);
    }
    return fromList;
  };

  const handleOpenReview = () => {
    void form.handleSubmit({ submitAction: 'review' });
  };

  const handleConfirmSubmit = () => {
    void form.handleSubmit({ submitAction: 'submit' });
  };

  const handleResetForm = () => {
    form.reset(incomingGatePassToFormValues(gatePass, userId));
    setFarmerSearch(farmerSearchLabelFromGatePass(gatePass));
    setFarmerComboboxOpen(false);
    setVarietySearch(gatePass.variety);
    setVarietyComboboxOpen(false);
    setCategorySearch(gatePass.category);
    setCategoryComboboxOpen(false);
    setStageSearch(gatePass.stage ?? '');
    setStageComboboxOpen(false);
  };

  useEffect(() => {
    if (userId) {
      form.setFieldValue('createdBy', userId);
    }
  }, [userId, form]);

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-6">
        <CardTitle className="text-2xl">
          Edit Incoming Gate Pass{' '}
          <span className="font-mono text-2xl tabular-nums text-primary">
            #{gatePass.gatePassNo}
          </span>
        </CardTitle>
        <CardDescription className="text-base">
          Update transport, crop, and weighbridge details for this incoming gate pass.
        </CardDescription>
      </CardHeader>

      {/* Wrap the content and footer inside the form so the submit
        button in the footer triggers the submission properly.
      */}
      <form id="edit-incoming-form" noValidate onSubmit={(e) => e.preventDefault()}>
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
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="edit-incoming-farmer">Farmer Link</FieldLabel>
                        <SearchableOptionCombobox
                          id="edit-incoming-farmer"
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
                        <FieldDescription>Link this pass to a storage account.</FieldDescription>
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
                        <FieldLabel htmlFor="edit-incoming-variety">Variety</FieldLabel>
                        <SearchableOptionCombobox
                          id="edit-incoming-variety"
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          placeholder="Search varieties..."
                          emptyMessage="No varieties found."
                          options={varietyOptions}
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
                        <FieldLabel htmlFor="edit-incoming-category">Category</FieldLabel>
                        <SearchableOptionCombobox
                          id="edit-incoming-category"
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          placeholder="Search categories..."
                          emptyMessage="No categories found."
                          options={categoryOptions}
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
                        <FieldLabel htmlFor="edit-incoming-stage">Stage</FieldLabel>
                        <SearchableOptionCombobox
                          id="edit-incoming-stage"
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          placeholder="Search stages..."
                          emptyMessage="No stages found."
                          options={stageOptions}
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
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-3">
                <form.Field name="weightSlip.slipNumber">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Slip Number</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="e.g. WS-001"
                          autoComplete="off"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="weightSlip.grossWeightKg">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Gross Weight (kg)</FieldLabel>
                        <Input
                          {...numericInputProps}
                          id={field.name}
                          name={field.name}
                          value={field.state.value || ''}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(parseNumber(e.target.value))}
                          aria-invalid={isInvalid}
                          placeholder="Total weight"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="weightSlip.tareWeightKg">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Tare Weight (kg)</FieldLabel>
                        <Input
                          {...numericInputProps}
                          id={field.name}
                          name={field.name}
                          value={field.state.value || ''}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(parseNumber(e.target.value))}
                          aria-invalid={isInvalid}
                          placeholder="Vehicle empty weight"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>

              {/* Elevated visual presentation for Calculated Data */}
              <form.Subscribe
                selector={(state) => state.values.weightSlip}
                children={(weightSlip) => {
                  const net = weightSlip.grossWeightKg - weightSlip.tareWeightKg;
                  const showNet =
                    weightSlip.grossWeightKg > 0 && weightSlip.tareWeightKg >= 0 && net >= 0;

                  if (!showNet) return null;

                  return (
                    <div className="mt-6 flex items-center justify-between rounded-md border bg-muted/50 px-4 py-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        Calculated Net Weight
                      </span>
                      <span className="text-lg font-semibold text-foreground tracking-tight">
                        {net.toLocaleString()} kg
                      </span>
                    </div>
                  );
                }}
              />
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
          <Button variant="outline" type="button" onClick={handleResetForm}>
            Reset Form
          </Button>
          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button type="button" disabled={isSubmitting} onClick={handleOpenReview}>
                {isSubmitting ? 'Validating…' : 'Review'}
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
    </Card>
  );
}

export default EditIncomingForm;

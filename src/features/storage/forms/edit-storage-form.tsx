import { useEffect, useMemo, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { Loader2, UserPlus } from 'lucide-react';
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
import { StorageQuantitiesSection } from '@/features/storage/forms/storage-quantities-section';
import { StorageSummarySheet } from '@/features/storage/forms/storage-summary-sheet';
import { useCreateStorageForm } from '@/features/storage/forms/use-create-storage-form';
import { storageGatePassToFormValues } from '@/features/storage/forms/storage-gate-pass-to-form-values';
import { useStorageGatePassById } from '@/features/storage/api/use-storage-gate-pass-by-id';
import { useUpdateStorageGatePass } from '@/features/storage/api/use-update-storage-gate-pass';
import type { StorageGatePass } from '@/features/storage/api/types';
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
import {
  farmerLinkOptionsToComboboxOptions,
  formatFarmerLinkLabel,
  getFarmerLinkLabel,
} from '@/features/people/utils/farmer-link-combobox';
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from '@/components/searchable-option-combobox';
import { storageFormSchema } from '@/features/storage/schemas/storage-form-schema';
import { INCOMING_STAGES, POTATO_VARIETY_OPTIONS, STORAGE_CATEGORIES } from '@/lib/constants';

const CATEGORY_ITEMS = STORAGE_CATEGORIES.map((value) => ({
  id: value,
  label: value,
}));

const STAGE_ITEMS = INCOMING_STAGES.map((value) => ({
  id: value,
  label: value,
}));

type EditStorageFormProps = {
  gatePassId: string;
};

export function EditStorageRoute() {
  const { id } = useParams({ from: '/_authenticated/storage/$id' });

  return <EditStorageForm gatePassId={id} />;
}

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

function parseOptionalPositiveNumber(value: string): number | undefined {
  if (value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function ensureOptionInList(
  options: ComboboxOption[],
  value: string | undefined,
): ComboboxOption[] {
  if (!value?.trim()) return options;
  if (options.some((o) => o.id === value)) return options;
  return [...options, { id: value, label: value }];
}

function farmerSearchLabelFromGatePass(gatePass: StorageGatePass): string {
  const link = gatePass.farmerStorageLinkId;
  if (!link || typeof link === 'string') return '';
  const name = link.farmerId?.name ?? '';
  return `${name} (Account #${link.accountNumber})`;
}

const numericInputProps = {
  type: 'number' as const,
  min: 0,
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
};

const EditStorageForm = ({ gatePassId }: EditStorageFormProps) => {
  const {
    gatePass,
    isLoading: isLoadingGatePass,
    isError: isGatePassError,
    error: gatePassError,
  } = useStorageGatePassById(gatePassId);

  if (isLoadingGatePass) {
    return (
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardContent className="text-muted-foreground flex min-h-64 items-center justify-center gap-2 py-12 text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading storage gate pass…
        </CardContent>
      </Card>
    );
  }

  if (isGatePassError) {
    return (
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardContent className="flex min-h-64 items-center justify-center py-12 text-center">
          <p className="text-destructive text-sm">
            {gatePassError?.message ?? 'Failed to load storage gate pass.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!gatePass) {
    return (
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardContent className="flex min-h-64 items-center justify-center py-12 text-center">
          <p className="text-muted-foreground text-sm">Storage gate pass not found.</p>
        </CardContent>
      </Card>
    );
  }

  return <EditStorageFormFields key={gatePass._id} gatePass={gatePass} />;
};

type EditStorageFormFieldsProps = {
  gatePass: StorageGatePass;
};

function EditStorageFormFields({ gatePass }: EditStorageFormFieldsProps) {
  const userId = useAuthStore((s) => s.user?._id ?? '');
  const { mutateAsync: updateStorageGatePass } = useUpdateStorageGatePass(gatePass._id);
  const { data: farmerLinkOptions = [], isLoading: isLoadingFarmers } = useFarmerLinkOptions();
  const { data: farmerStorageLinks = [] } = useFarmerStorageLinks();
  const defaultValues = useMemo(
    () => storageGatePassToFormValues(gatePass, userId),
    [gatePass, userId],
  );

  const farmerOptions = useMemo<ComboboxOption[]>(() => {
    const base = farmerLinkOptionsToComboboxOptions(farmerLinkOptions);
    const link = gatePass.farmerStorageLinkId;
    if (!link || typeof link === 'string') return base;
    const id = link._id;
    if (!id || base.some((o) => o.id === id)) return base;
    const name = link.farmerId?.name ?? 'Farmer';
    const option: ComboboxOption = {
      id,
      label: `${name} (Account #${link.accountNumber})`,
      name,
    };
    if (typeof link.accountNumber === 'number') {
      option.accountNumber = link.accountNumber;
    }
    return [...base, option];
  }, [farmerLinkOptions, gatePass]);

  const varietyOptions = useMemo(
    () => ensureOptionInList(POTATO_VARIETY_OPTIONS, gatePass.variety),
    [gatePass.variety],
  );
  const categoryOptions = useMemo(
    () => ensureOptionInList(CATEGORY_ITEMS, gatePass.storageCategory),
    [gatePass.storageCategory],
  );
  const stageOptions = useMemo(
    () => ensureOptionInList(STAGE_ITEMS, gatePass.stage),
    [gatePass.stage],
  );

  const [farmerSearch, setFarmerSearch] = useState(() => farmerSearchLabelFromGatePass(gatePass));
  const [farmerComboboxOpen, setFarmerComboboxOpen] = useState(false);
  const [varietySearch, setVarietySearch] = useState(() => gatePass.variety);
  const [varietyComboboxOpen, setVarietyComboboxOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState(() => gatePass.storageCategory);
  const [categoryComboboxOpen, setCategoryComboboxOpen] = useState(false);
  const [stageSearch, setStageSearch] = useState(() => gatePass.stage ?? '');
  const [stageComboboxOpen, setStageComboboxOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [addFarmerOpen, setAddFarmerOpen] = useState(false);

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

  const form = useCreateStorageForm({
    defaultValues,
    onOpenReview: () => setReviewOpen(true),
    onCreate: async (parsed) => {
      try {
        const { message } = await updateStorageGatePass({
          id: gatePass._id,
          form: parsed,
        });

        toast.success(message ?? 'Storage gate pass updated', {
          position: 'bottom-right',
        });
        setReviewOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to update storage gate pass', {
          position: 'bottom-right',
        });
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

  const resetComboboxState = () => {
    setFarmerSearch(farmerSearchLabelFromGatePass(gatePass));
    setFarmerComboboxOpen(false);
    setVarietySearch(gatePass.variety);
    setVarietyComboboxOpen(false);
    setCategorySearch(gatePass.storageCategory);
    setCategoryComboboxOpen(false);
    setStageSearch(gatePass.stage ?? '');
    setStageComboboxOpen(false);
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

  const handleResetForm = () => {
    form.reset(defaultValues);
    resetComboboxState();
  };

  const handleOpenReview = () => {
    void form.handleSubmit({ submitAction: 'review' });
  };

  const handleConfirmSubmit = () => {
    void form.handleSubmit({ submitAction: 'submit' });
  };

  useEffect(() => {
    if (userId) {
      form.setFieldValue('createdBy', userId);
    }
  }, [userId, form]);

  return (
    <Card className="mx-auto w-full max-w-4xl shadow-sm">
      <CardHeader className="bg-muted/30 border-b pb-6">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          Edit Storage Gate Pass{' '}
          <span className="text-primary font-mono tabular-nums sm:text-2xl">
            #{gatePass.gatePassNo}
          </span>
        </CardTitle>
        <CardDescription className="text-base">
          Update crop and account details for this storage gate pass.
        </CardDescription>
      </CardHeader>

      <form id="edit-storage-form" noValidate onSubmit={(e) => e.preventDefault()}>
        <CardContent className="pt-8 pb-8">
          <FieldGroup className="@container/field-group gap-10">
            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                General Information
              </FieldLegend>
              <FieldDescription>
                Gate pass reference, date, and linked farmer account.
              </FieldDescription>
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
                        <FieldLabel htmlFor="edit-storage-farmer">Farmer</FieldLabel>
                        <div className="flex gap-2">
                          <div className="min-w-0 flex-1">
                            <SearchableOptionCombobox
                              id="edit-storage-farmer"
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

            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Crop Information
              </FieldLegend>
              <FieldDescription>Variety and grade for stock entering storage.</FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                <form.Field name="variety">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="edit-storage-variety">Variety</FieldLabel>
                        <SearchableOptionCombobox
                          id="edit-storage-variety"
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
                        <FieldLabel htmlFor="edit-storage-category">Category</FieldLabel>
                        <SearchableOptionCombobox
                          id="edit-storage-category"
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
                        <FieldLabel htmlFor="edit-storage-stage">Stage</FieldLabel>
                        <SearchableOptionCombobox
                          id="edit-storage-stage"
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
                        <FieldDescription>
                          Optional grading stage for this storage stock.
                        </FieldDescription>
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <StorageQuantitiesSection form={form} />

            <FieldSeparator />

            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Additional Notes
              </FieldLegend>
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
                          placeholder="Add any additional comments or observations (optional)"
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

        <CardFooter className="bg-muted/30 justify-end gap-3 border-t py-6">
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
          const parsed = storageFormSchema.safeParse(values);

          return (
            <StorageSummarySheet
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
}

export default EditStorageForm;

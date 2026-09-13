import { useEffect, useMemo, useState } from 'react';
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
import { StorageQuantitiesSection } from '@/features/storage/forms/storage-quantities-section';
import { StorageSummarySheet } from '@/features/storage/forms/storage-summary-sheet';
import { useCreateStorageGatePass } from '@/features/storage/api/use-create-storage-gate-pass';
import { useCreateStorageForm } from '@/features/storage/forms/use-create-storage-form';
import { createDefaultStorageQuantities } from '@/features/storage/schemas/storage-form-schema';
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
import { useGetReceiptVoucherNumber, voucherNumberKeys } from '@/hooks/use-get-voucher-number';
import { queryClient } from '@/lib/queryClient';
import { INCOMING_STAGES, POTATO_VARIETY_OPTIONS, STORAGE_CATEGORIES } from '@/lib/constants';

const CATEGORY_ITEMS = STORAGE_CATEGORIES.map((value) => ({
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

const numericInputProps = {
  type: 'number' as const,
  min: 0,
  onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
};

const CreateStorageForm = () => {
  const userId = useAuthStore((s) => s.user?._id ?? '');
  const { data: farmerLinkOptions = [], isLoading: isLoadingFarmers } = useFarmerLinkOptions();
  const { data: farmerStorageLinks = [] } = useFarmerStorageLinks();
  const {
    data: nextVoucherNumber,
    isLoading: isLoadingVoucherNumber,
    isError: isVoucherNumberError,
  } = useGetReceiptVoucherNumber('storage-gate-pass');
  const { mutateAsync: createStorageGatePass } = useCreateStorageGatePass();
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

  const form = useCreateStorageForm({
    onOpenReview: () => setReviewOpen(true),
    onCreate: async (parsed) => {
      const gatePassNo = queryClient.getQueryData<number>(
        voucherNumberKeys.detail('storage-gate-pass'),
      );

      if (gatePassNo == null) {
        toast.error('Gate pass number is unavailable. Refresh and try again.', {
          position: 'bottom-right',
        });
        return;
      }

      try {
        const { message } = await createStorageGatePass({
          form: parsed,
          gatePassNo,
        });

        toast.success(message ?? 'Storage gate pass created', {
          position: 'bottom-right',
        });
        setReviewOpen(false);
        form.reset();
        form.setFieldValue('quantities', createDefaultStorageQuantities());
        resetComboboxState();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to create storage gate pass', {
          position: 'bottom-right',
        });
      }
    },
  });

  const getFarmerLabel = (farmerStorageLinkId: string) =>
    getFarmerLinkLabel(farmerStorageLinkId, farmerLinkOptions);

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
  }, [userId]);

  return (
    <Card className="mx-auto w-full max-w-4xl shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-6">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          Storage Gate Pass{' '}
          <span className="font-mono tabular-nums text-primary sm:text-2xl">
            {isLoadingVoucherNumber
              ? '…'
              : isVoucherNumberError || nextVoucherNumber == null
                ? '—'
                : `#${nextVoucherNumber}`}
          </span>
        </CardTitle>
        <CardDescription className="text-base">
          Record crop and account details for a new storage gate pass.
        </CardDescription>
      </CardHeader>

      <form id="create-storage-form" noValidate onSubmit={(e) => e.preventDefault()}>
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
                        <FieldLabel htmlFor="create-storage-farmer">Farmer</FieldLabel>
                        <div className="flex gap-2">
                          <div className="min-w-0 flex-1">
                            <SearchableOptionCombobox
                              id="create-storage-farmer"
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
                        <FieldLabel htmlFor="create-storage-variety">Variety</FieldLabel>
                        <SearchableOptionCombobox
                          id="create-storage-variety"
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
                        <FieldLabel htmlFor="create-storage-category">Category</FieldLabel>
                        <SearchableOptionCombobox
                          id="create-storage-category"
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
                        <FieldLabel htmlFor="create-storage-stage">Stage</FieldLabel>
                        <SearchableOptionCombobox
                          id="create-storage-stage"
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

        <CardFooter className="justify-end gap-3 border-t bg-muted/30 py-6">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              form.reset();
              form.setFieldValue('quantities', createDefaultStorageQuantities());
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
};

export default CreateStorageForm;

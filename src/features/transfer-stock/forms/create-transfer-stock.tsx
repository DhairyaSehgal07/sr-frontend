import { useMemo, useState } from 'react';
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
import { TransferGatePassesSection } from '@/features/transfer-stock/forms/transfer-gate-passes-section';
import { TransferStockSummarySheet } from '@/features/transfer-stock/forms/transfer-stock-summary-sheet';
import { useCreateTransferStockForm } from '@/features/transfer-stock/forms/use-create-transfer-stock-form';
import { useStorageGatePassesForFarmer } from '@/features/transfer-stock/hooks/use-storage-gate-passes-for-farmer';
import {
  transferStockFormSchema,
  type TransferStockFormValues,
} from '@/features/transfer-stock/schemas/transfer-stock-form-schema';
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
import { STORAGE_CATEGORIES } from '@/lib/constants';

const CATEGORY_ITEMS = STORAGE_CATEGORIES.map((value) => ({
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

type TransferStockReviewSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromFarmerStorageLinkId: string;
  values: TransferStockFormValues | null;
  fromFarmerLabel: string;
  toFarmerLabel: string;
  onBack: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
};

function TransferStockReviewSheet({
  open,
  onOpenChange,
  fromFarmerStorageLinkId,
  values,
  fromFarmerLabel,
  toFarmerLabel,
  onBack,
  onSubmit,
  canSubmit,
  isSubmitting,
}: TransferStockReviewSheetProps) {
  const { data: passes } = useStorageGatePassesForFarmer(fromFarmerStorageLinkId);
  const transferItems = values != null ? buildTransferItems(values.allocations, passes) : [];

  return (
    <TransferStockSummarySheet
      open={open}
      onOpenChange={onOpenChange}
      values={values}
      transferItems={transferItems}
      fromFarmerLabel={fromFarmerLabel}
      toFarmerLabel={toFarmerLabel}
      onBack={onBack}
      onSubmit={onSubmit}
      canSubmit={canSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

const CreateTransferStock = () => {
  const { data: farmerLinkOptions = [], isLoading: isLoadingFarmers } = useFarmerLinkOptions();
  const farmerOptions = useMemo<ComboboxOption[]>(
    () => farmerLinkOptionsToComboboxOptions(farmerLinkOptions),
    [farmerLinkOptions],
  );
  const [fromFarmerSearch, setFromFarmerSearch] = useState('');
  const [fromFarmerComboboxOpen, setFromFarmerComboboxOpen] = useState(false);
  const [toFarmerSearch, setToFarmerSearch] = useState('');
  const [toFarmerComboboxOpen, setToFarmerComboboxOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryComboboxOpen, setCategoryComboboxOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const sortedFromFarmers = useMemo(
    () => filterAndSortOptions(fromFarmerSearch, farmerOptions),
    [fromFarmerSearch, farmerOptions],
  );
  const sortedToFarmers = useMemo(
    () => filterAndSortOptions(toFarmerSearch, farmerOptions),
    [toFarmerSearch, farmerOptions],
  );
  const sortedCategories = useMemo(
    () => filterAndSortOptions(categorySearch, CATEGORY_ITEMS),
    [categorySearch],
  );

  function resetComboboxState() {
    setFromFarmerSearch('');
    setFromFarmerComboboxOpen(false);
    setToFarmerSearch('');
    setToFarmerComboboxOpen(false);
    setCategorySearch('');
    setCategoryComboboxOpen(false);
  }

  const {
    form,
    nextTransferGatePassNo,
    isLoadingVoucherNumbers,
    isVoucherNumbersError,
    isGatePassNumbersReady,
  } = useCreateTransferStockForm({
    farmerLinkOptions,
    onOpenReview: () => setReviewOpen(true),
    onCloseReview: () => setReviewOpen(false),
    onResetComboboxState: resetComboboxState,
  });

  const displayGatePassNo = isLoadingVoucherNumbers
    ? '…'
    : isVoucherNumbersError
      ? '—'
      : (nextTransferGatePassNo ?? '—');

  const getFarmerLabel = (farmerStorageLinkId: string) =>
    farmerOptions.find((option) => option.id === farmerStorageLinkId)?.label ?? farmerStorageLinkId;

  const handleOpenReview = () => {
    void form.handleSubmit({ submitAction: 'review' });
  };

  const handleConfirmSubmit = () => {
    void form.handleSubmit({ submitAction: 'submit' });
  };

  return (
    <Card className="mx-auto w-full max-w-7xl shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-6">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          Transfer Stock{' '}
          <span className="font-mono text-xl tabular-nums text-primary sm:text-2xl">
            #{displayGatePassNo}
          </span>
        </CardTitle>
        <CardDescription className="text-base">
          Move stock between farmer storage accounts.
          {isVoucherNumbersError ? (
            <span className="mt-1 block text-destructive">
              Gate pass numbers could not be loaded. Refresh the page and try again.
            </span>
          ) : null}
        </CardDescription>
      </CardHeader>

      <form id="create-transfer-stock-form" noValidate onSubmit={(e) => e.preventDefault()}>
        <CardContent className="pt-8 pb-8">
          <FieldGroup className="@container/field-group gap-10">
            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Transfer details
              </FieldLegend>
              <FieldDescription>
                Select source and destination accounts, then the transfer date.
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
                          className="h-11 text-base"
                        />
                        <FieldDescription>
                          Leave blank if no manual slip number was issued.
                        </FieldDescription>
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="fromFarmerStorageLinkId">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid} className="@md/field-group:col-span-2">
                        <FieldLabel htmlFor="transfer-stock-from-farmer">From</FieldLabel>
                        <SearchableOptionCombobox
                          id="transfer-stock-from-farmer"
                          name={field.name}
                          value={field.state.value}
                          onValueChange={(value) => {
                            field.handleChange(value);
                            form.setFieldValue('allocations', {});
                          }}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          placeholder={isLoadingFarmers ? 'Loading farmers…' : 'Search farmers…'}
                          emptyMessage={isLoadingFarmers ? 'Loading farmers…' : 'No farmers found.'}
                          options={farmerOptions}
                          sortedOptions={sortedFromFarmers}
                          search={fromFarmerSearch}
                          setSearch={setFromFarmerSearch}
                          open={fromFarmerComboboxOpen}
                          setOpen={setFromFarmerComboboxOpen}
                          disabled={isLoadingFarmers}
                        />
                        <FieldDescription>
                          Farmer account stock is transferred from.
                        </FieldDescription>
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="toFarmerStorageLinkId">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid} className="@md/field-group:col-span-2">
                        <FieldLabel htmlFor="transfer-stock-to-farmer">To</FieldLabel>
                        <SearchableOptionCombobox
                          id="transfer-stock-to-farmer"
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          placeholder={isLoadingFarmers ? 'Loading farmers…' : 'Search farmers…'}
                          emptyMessage={isLoadingFarmers ? 'Loading farmers…' : 'No farmers found.'}
                          options={farmerOptions}
                          sortedOptions={sortedToFarmers}
                          search={toFarmerSearch}
                          setSearch={setToFarmerSearch}
                          open={toFarmerComboboxOpen}
                          setOpen={setToFarmerComboboxOpen}
                          disabled={isLoadingFarmers}
                        />
                        <FieldDescription>
                          Farmer account receiving the transferred stock.
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
                      <Field data-invalid={isInvalid} className="@md/field-group:max-w-sm">
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

                <form.Field name="category">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="transfer-stock-category">Category</FieldLabel>
                        <SearchableOptionCombobox
                          id="transfer-stock-category"
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
                        <FieldDescription>
                          Gate pass category for the transfer, same as incoming.
                        </FieldDescription>
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <form.Subscribe
              selector={(state) => state.values.fromFarmerStorageLinkId}
              children={(fromFarmerStorageLinkId) => (
                <FieldSet>
                  <FieldLegend className="font-heading text-base font-semibold">
                    Storage gate passes
                  </FieldLegend>
                  <FieldDescription>
                    Select vouchers and quantities to transfer from the source account.
                  </FieldDescription>
                  <div className="mt-5">
                    <form.Field name="allocations">
                      {(allocField) => (
                        <TransferGatePassesSection
                          key={fromFarmerStorageLinkId || 'no-farmer'}
                          fromFarmerStorageLinkId={fromFarmerStorageLinkId}
                          allocations={allocField.state.value}
                          onAllocationsChange={allocField.handleChange}
                        />
                      )}
                    </form.Field>
                  </div>
                </FieldSet>
              )}
            />

            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">Vehicle</FieldLegend>
              <FieldDescription>
                Truck used to move stock between accounts (optional).
              </FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:max-w-sm">
                <form.Field name="truckNumber">
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
                          placeholder="e.g. HR-12-AB-1234"
                          autoComplete="off"
                          aria-invalid={isInvalid}
                          className="h-11 text-base uppercase"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                Additional notes
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
            Reset form
          </Button>
          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button
                type="button"
                disabled={isSubmitting || !isGatePassNumbersReady}
                onClick={handleOpenReview}
              >
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
          const parsed = transferStockFormSchema.safeParse(values);
          const fromFarmerId = parsed.success
            ? parsed.data.fromFarmerStorageLinkId
            : values.fromFarmerStorageLinkId;

          return (
            <TransferStockReviewSheet
              open={reviewOpen}
              onOpenChange={setReviewOpen}
              fromFarmerStorageLinkId={fromFarmerId}
              values={parsed.success ? parsed.data : null}
              fromFarmerLabel={
                parsed.success ? getFarmerLabel(parsed.data.fromFarmerStorageLinkId) : ''
              }
              toFarmerLabel={
                parsed.success ? getFarmerLabel(parsed.data.toFarmerStorageLinkId) : ''
              }
              onBack={() => setReviewOpen(false)}
              onSubmit={handleConfirmSubmit}
              canSubmit={canSubmit && isGatePassNumbersReady}
              isSubmitting={isSubmitting}
            />
          );
        }}
      />
    </Card>
  );
};

export default CreateTransferStock;

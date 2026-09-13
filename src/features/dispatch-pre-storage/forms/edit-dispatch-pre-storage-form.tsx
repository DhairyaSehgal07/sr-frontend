import { useMemo, useState } from 'react';
import { Loader2, Plus, Trash2, UserPlus } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerInput } from '@/components/date-picker';
import { BagSizeSelectField, FixedBagSizeLabel } from '@/components/bag-quantity-size-field';
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from '@/components/searchable-option-combobox';
import { DISPATCH_PRE_STORAGE_CATEGORIES, POTATO_VARIETY_OPTIONS } from '@/lib/constants';
import { useDispatchLedgers } from '@/features/people/api/use-dispatch-ledgers';
import type { NikasiGatePass } from '@/features/dispatch-pre-storage/api/types';
import { useNikasiGatePassById } from '@/features/dispatch-pre-storage/api/use-nikasi-gate-pass-by-id';
import { useUpdateNikasiGatePass } from '@/features/dispatch-pre-storage/api/use-update-nikasi-gate-pass';
import { DispatchPreStorageSummarySheet } from '@/features/dispatch-pre-storage/forms/dispatch-pre-storage-summary-sheet';
import {
  buildSummaryValues,
  calculateAverageWeightPerBagKg,
  canSubmitSummaryValues,
  createDefaultBagSizeRows,
  createEmptyBagSizeRow,
  formatOptionalNumber,
  formatWeightKg,
  numericInputProps,
  parseOptionalNumber,
  type DispatchPreStorageBagSizeRow,
} from '@/features/dispatch-pre-storage/forms/dispatch-pre-storage-form-utils';
import { isValidRequiredPositiveInt } from '@/features/dispatch-pre-storage/schemas/dispatch-pre-storage-form-schema';
import { nikasiGatePassToEditFormValues } from '@/features/dispatch-pre-storage/utils/nikasi-gate-pass-to-edit-form-values';

const CATEGORY_ITEMS: ComboboxOption[] = DISPATCH_PRE_STORAGE_CATEGORIES.map((value) => ({
  id: value,
  label: value,
}));

export function EditDispatchPreStorageForm() {
  const { id } = useParams({ from: '/_authenticated/dispatch/$id' });
  const { data: gatePass, isLoading, isError, error } = useNikasiGatePassById(id);

  if (isLoading) {
    return (
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardContent className="flex min-h-64 items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading nikasi gate pass…
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardContent className="flex min-h-64 items-center justify-center py-12 text-center">
          <p className="text-sm text-destructive">
            {error?.message ?? 'Failed to load nikasi gate pass.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!gatePass) {
    return (
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardContent className="flex min-h-64 items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">Nikasi gate pass not found.</p>
        </CardContent>
      </Card>
    );
  }

  return <EditDispatchPreStorageFormFields key={gatePass._id} gatePass={gatePass} />;
}

type EditDispatchPreStorageFormFieldsProps = {
  gatePass: NikasiGatePass;
};

function EditDispatchPreStorageFormFields({ gatePass }: EditDispatchPreStorageFormFieldsProps) {
  const navigate = useNavigate();
  const initialValues = useMemo(() => nikasiGatePassToEditFormValues(gatePass), [gatePass]);

  const { data: dispatchLedgersData } = useDispatchLedgers();
  const { mutateAsync: updateNikasiGatePass, isPending: isSubmitting } = useUpdateNikasiGatePass(
    gatePass._id,
  );

  const dispatchLedgerOptions = useMemo<ComboboxOption[]>(
    () =>
      (dispatchLedgersData ?? []).map((ledger) => ({
        id: ledger._id,
        label: ledger.name,
      })),
    [dispatchLedgersData],
  );

  const [manualGatePassNumber, setManualGatePassNumber] = useState(
    initialValues.manualGatePassNumber,
  );
  const [date, setDate] = useState<Date | undefined>(() => new Date(initialValues.date));
  const [dispatchLedgerId, setDispatchLedgerId] = useState(initialValues.dispatchLedgerId);
  const [category, setCategory] = useState(initialValues.category);
  const [billNumber, setBillNumber] = useState(initialValues.billNumber);
  const [biltiNo, setBiltiNo] = useState(initialValues.biltiNo);
  const [billBook, setBillBook] = useState(initialValues.billBook);
  const [biltiBook, setBiltiBook] = useState(initialValues.biltiBook);
  const [from, setFrom] = useState(initialValues.from);
  const [to, setTo] = useState(initialValues.to);
  const [truckNumber, setTruckNumber] = useState(initialValues.truckNumber);
  const [bagSize, setBagSize] = useState<DispatchPreStorageBagSizeRow[]>(
    () => initialValues.bagSize as DispatchPreStorageBagSizeRow[],
  );
  const [netWeight, setNetWeight] = useState(initialValues.netWeight);
  const [remarks, setRemarks] = useState(initialValues.remarks);

  const [dispatchLedgerSearch, setDispatchLedgerSearch] = useState(
    () => gatePass.dispatchLedgerId.name ?? '',
  );
  const [dispatchLedgerComboboxOpen, setDispatchLedgerComboboxOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState(initialValues.category);
  const [categoryComboboxOpen, setCategoryComboboxOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [billBookTouched, setBillBookTouched] = useState(false);
  const [biltiBookTouched, setBiltiBookTouched] = useState(false);

  const sortedDispatchLedgers = useMemo(
    () => filterAndSortOptions(dispatchLedgerSearch, dispatchLedgerOptions),
    [dispatchLedgerSearch, dispatchLedgerOptions],
  );
  const sortedCategories = useMemo(
    () => filterAndSortOptions(categorySearch, CATEGORY_ITEMS),
    [categorySearch],
  );

  const totalQuantityIssued = useMemo(
    () =>
      bagSize.reduce((sum, row) => {
        const parsed = Number(row.quantityIssued);
        return sum + (Number.isNaN(parsed) ? 0 : parsed);
      }, 0),
    [bagSize],
  );

  const netWeightKg = useMemo(() => parseOptionalNumber(netWeight), [netWeight]);

  const averageWeightPerBagKg = useMemo(
    () => calculateAverageWeightPerBagKg(netWeightKg, totalQuantityIssued),
    [netWeightKg, totalQuantityIssued],
  );

  const displayGatePassNo = String(gatePass.gatePassNo);

  const summaryValues = useMemo(
    () =>
      buildSummaryValues({
        gatePassNo: displayGatePassNo,
        manualGatePassNumber,
        date,
        dispatchLedgerId,
        category,
        billNumber,
        biltiNo,
        billBook,
        biltiBook,
        from,
        to,
        truckNumber,
        bagSize,
        netWeight,
        remarks,
      }),
    [
      displayGatePassNo,
      manualGatePassNumber,
      date,
      dispatchLedgerId,
      category,
      billNumber,
      biltiNo,
      billBook,
      biltiBook,
      from,
      to,
      truckNumber,
      bagSize,
      netWeight,
      remarks,
    ],
  );

  const dispatchLedgerLabel = useMemo(
    () => dispatchLedgerOptions.find((o) => o.id === dispatchLedgerId)?.label ?? '—',
    [dispatchLedgerId, dispatchLedgerOptions],
  );

  const canSubmit = canSubmitSummaryValues(summaryValues, {
    requireGatePassNo: true,
  });

  const handleOpenReview = () => {
    if (!summaryValues) {
      toast.error('Pick a date before reviewing.', { position: 'bottom-right' });
      return;
    }
    setReviewOpen(true);
  };

  const handleConfirmSubmit = async (isBooked: boolean) => {
    if (!canSubmit || !summaryValues) return;

    try {
      const { message } = await updateNikasiGatePass({
        id: gatePass._id,
        summaryValues,
        isBooked,
      });
      toast.success(message ?? 'Nikasi gate pass updated.', {
        position: 'bottom-right',
      });
      setReviewOpen(false);
      void navigate({ to: '/dispatch/report' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update nikasi gate pass.', {
        position: 'bottom-right',
      });
    }
  };

  const resetComboboxState = () => {
    setDispatchLedgerSearch(gatePass.dispatchLedgerId.name ?? '');
    setDispatchLedgerComboboxOpen(false);
    setCategorySearch(initialValues.category);
    setCategoryComboboxOpen(false);
  };

  const resetForm = () => {
    setManualGatePassNumber(initialValues.manualGatePassNumber);
    setDate(new Date(initialValues.date));
    setDispatchLedgerId(initialValues.dispatchLedgerId);
    setCategory(initialValues.category);
    setBillNumber(initialValues.billNumber);
    setBiltiNo(initialValues.biltiNo);
    setBillBook(initialValues.billBook);
    setBiltiBook(initialValues.biltiBook);
    setFrom(initialValues.from);
    setTo(initialValues.to);
    setTruckNumber(initialValues.truckNumber);
    setBagSize(initialValues.bagSize as DispatchPreStorageBagSizeRow[]);
    setNetWeight(initialValues.netWeight);
    setRemarks(initialValues.remarks);
    setBillBookTouched(false);
    setBiltiBookTouched(false);
    resetComboboxState();
  };

  const updateBagSizeRow = (index: number, patch: Partial<DispatchPreStorageBagSizeRow>) => {
    setBagSize((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );
  };

  return (
    <>
      <Card className="mx-auto w-full max-w-4xl shadow-sm">
        <CardHeader className="border-b bg-muted/30 pb-6">
          <CardTitle className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            Edit Dispatch (Pre-Storage) Gate Pass{' '}
            <span className="font-mono tabular-nums text-primary sm:text-2xl">
              #{displayGatePassNo}
            </span>
          </CardTitle>
          <CardDescription className="text-base">
            Update this nikasi gate pass before storage booking.
          </CardDescription>
        </CardHeader>

        <form id="edit-dispatch-pre-storage-form" noValidate onSubmit={(e) => e.preventDefault()}>
          <CardContent className="pb-8 pt-8">
            <FieldGroup className="@container/field-group gap-10">
              <FieldSet>
                <FieldLegend className="font-heading text-base font-semibold">
                  Gate Pass Details
                </FieldLegend>
                <FieldDescription>
                  Manual reference, date, booking flag, and category.
                </FieldDescription>
                <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="dispatch-pre-storage-manual-gate-pass">
                      Manual Gate Pass No.
                    </FieldLabel>
                    <Input
                      {...numericInputProps}
                      id="dispatch-pre-storage-manual-gate-pass"
                      name="manualGatePassNumber"
                      value={manualGatePassNumber}
                      onChange={(e) => setManualGatePassNumber(e.target.value)}
                      inputMode="numeric"
                      placeholder="e.g. 101"
                      className="tabular-nums"
                    />
                  </Field>

                  <DatePickerInput
                    id="dispatch-pre-storage-date"
                    label="Date"
                    value={date}
                    onChange={setDate}
                    placeholder="Pick a date"
                  />

                  <Field>
                    <FieldLabel htmlFor="dispatch-pre-storage-category">Category</FieldLabel>
                    <SearchableOptionCombobox
                      id="dispatch-pre-storage-category"
                      name="category"
                      value={category}
                      onValueChange={setCategory}
                      onBlur={() => {}}
                      isInvalid={false}
                      placeholder="Search categories..."
                      emptyMessage="No categories found."
                      options={CATEGORY_ITEMS}
                      sortedOptions={sortedCategories}
                      search={categorySearch}
                      setSearch={setCategorySearch}
                      open={categoryComboboxOpen}
                      setOpen={setCategoryComboboxOpen}
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>

              <FieldSeparator />

              <FieldSet>
                <FieldLegend className="font-heading text-base font-semibold">
                  Account Links
                </FieldLegend>
                <FieldDescription>
                  Select the dispatch ledger this pass belongs to.
                </FieldDescription>
                <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="dispatch-pre-storage-dispatch-ledger">
                      Dispatch Ledger
                    </FieldLabel>
                    <div className="flex gap-2">
                      <div className="min-w-0 flex-1">
                        <SearchableOptionCombobox
                          id="dispatch-pre-storage-dispatch-ledger"
                          name="dispatchLedgerId"
                          value={dispatchLedgerId}
                          onValueChange={setDispatchLedgerId}
                          onBlur={() => {}}
                          isInvalid={false}
                          placeholder="Search dispatch ledgers..."
                          emptyMessage="No dispatch ledgers found."
                          options={dispatchLedgerOptions}
                          sortedOptions={sortedDispatchLedgers}
                          search={dispatchLedgerSearch}
                          setSearch={setDispatchLedgerSearch}
                          open={dispatchLedgerComboboxOpen}
                          setOpen={setDispatchLedgerComboboxOpen}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-auto min-h-9 shrink-0 gap-1.5 px-3"
                        aria-label="Add dispatch ledger"
                      >
                        <UserPlus className="size-4 shrink-0" />
                        <span className="hidden sm:inline">Add</span>
                      </Button>
                    </div>
                  </Field>
                </FieldGroup>
              </FieldSet>

              <FieldSeparator />

              <FieldSet>
                <FieldLegend className="font-heading text-base font-semibold">
                  Route &amp; Vehicle
                </FieldLegend>
                <FieldDescription>
                  Source, destination, vehicle, bill number, and bilti for the dispatch.
                </FieldDescription>
                <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-3">
                  <Field>
                    <FieldLabel htmlFor="dispatch-pre-storage-from">From</FieldLabel>
                    <Input
                      id="dispatch-pre-storage-from"
                      name="from"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="e.g. Cold Storage A"
                      autoComplete="off"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="dispatch-pre-storage-to">To</FieldLabel>
                    <Input
                      id="dispatch-pre-storage-to"
                      name="to"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="e.g. Market Yard"
                      autoComplete="off"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="dispatch-pre-storage-truck-number">
                      Truck Number
                    </FieldLabel>
                    <Input
                      id="dispatch-pre-storage-truck-number"
                      name="truckNumber"
                      value={truckNumber}
                      onChange={(e) => setTruckNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. PB10AB1234"
                      autoComplete="off"
                      className="uppercase"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="dispatch-pre-storage-bill-number">Bill Number</FieldLabel>
                    <Input
                      {...numericInputProps}
                      id="dispatch-pre-storage-bill-number"
                      name="billNumber"
                      value={billNumber}
                      onChange={(e) => setBillNumber(e.target.value)}
                      inputMode="numeric"
                      placeholder="e.g. 1001"
                      className="tabular-nums"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="dispatch-pre-storage-bilti-no">Bilti No.</FieldLabel>
                    <Input
                      {...numericInputProps}
                      id="dispatch-pre-storage-bilti-no"
                      name="biltiNo"
                      value={biltiNo}
                      onChange={(e) => setBiltiNo(e.target.value)}
                      inputMode="numeric"
                      placeholder="e.g. 42"
                      className="tabular-nums"
                    />
                  </Field>

                  <Field data-invalid={billBookTouched && !isValidRequiredPositiveInt(billBook)}>
                    <FieldLabel htmlFor="dispatch-pre-storage-bill-book">Bill book</FieldLabel>
                    <Input
                      {...numericInputProps}
                      id="dispatch-pre-storage-bill-book"
                      name="billBook"
                      value={billBook}
                      onBlur={() => setBillBookTouched(true)}
                      onChange={(e) => setBillBook(e.target.value)}
                      inputMode="numeric"
                      placeholder="e.g. 1"
                      aria-invalid={billBookTouched && !isValidRequiredPositiveInt(billBook)}
                      className="tabular-nums"
                    />
                    {billBookTouched && !isValidRequiredPositiveInt(billBook) ? (
                      <FieldError>Must be a whole number greater than zero.</FieldError>
                    ) : null}
                  </Field>

                  <Field data-invalid={biltiBookTouched && !isValidRequiredPositiveInt(biltiBook)}>
                    <FieldLabel htmlFor="dispatch-pre-storage-bilti-book">Bilti book</FieldLabel>
                    <Input
                      {...numericInputProps}
                      id="dispatch-pre-storage-bilti-book"
                      name="biltiBook"
                      value={biltiBook}
                      onBlur={() => setBiltiBookTouched(true)}
                      onChange={(e) => setBiltiBook(e.target.value)}
                      inputMode="numeric"
                      placeholder="e.g. 2"
                      aria-invalid={biltiBookTouched && !isValidRequiredPositiveInt(biltiBook)}
                      className="tabular-nums"
                    />
                    {biltiBookTouched && !isValidRequiredPositiveInt(biltiBook) ? (
                      <FieldError>Must be a whole number greater than zero.</FieldError>
                    ) : null}
                  </Field>
                </FieldGroup>
              </FieldSet>

              <FieldSeparator />

              <FieldSet>
                <FieldLegend className="font-heading text-base font-semibold">
                  Bag Lines
                </FieldLegend>
                <FieldDescription>
                  Enter variety and quantity issued for each bag size. Use Add more for an extra
                  size line. Rows with zero quantity are ignored on submit.
                </FieldDescription>

                <div className="mt-5 rounded-lg border border-border">
                  <div className="hidden border-b border-border bg-muted/50 px-3 py-2.5 lg:grid lg:grid-cols-12 lg:gap-2">
                    <div className="col-span-3 text-sm font-medium text-muted-foreground">Size</div>
                    <div className="col-span-4 text-sm font-medium text-muted-foreground">
                      Variety
                    </div>
                    <div className="col-span-3 text-right text-sm font-medium text-muted-foreground">
                      Quantity Issued
                    </div>
                    <div className="col-span-2" aria-hidden />
                  </div>

                  <div className="divide-y divide-border">
                    {bagSize.map((row, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 gap-3 px-3 py-3 lg:grid-cols-12 lg:items-start lg:gap-2 lg:py-2.5"
                      >
                        <div className="lg:col-span-3">
                          {row.isExtra ? (
                            <BagSizeSelectField
                              id={`dispatch-pre-storage-bag-size-${index}-size`}
                              name={`bagSize.${index}.size`}
                              value={row.size}
                              rowIndex={index}
                              labelClassName="lg:sr-only"
                              isInvalid={false}
                              onBlur={() => {}}
                              onValueChange={(value) => updateBagSizeRow(index, { size: value })}
                            />
                          ) : (
                            <FixedBagSizeLabel size={row.size} rowIndex={index} />
                          )}
                        </div>

                        <div className="lg:col-span-4">
                          <Field>
                            <FieldLabel
                              htmlFor={`dispatch-pre-storage-bag-size-${index}-variety`}
                              className="lg:sr-only"
                            >
                              Variety (row {index + 1})
                            </FieldLabel>
                            <Select
                              value={row.variety || undefined}
                              onValueChange={(value) => updateBagSizeRow(index, { variety: value })}
                            >
                              <SelectTrigger
                                id={`dispatch-pre-storage-bag-size-${index}-variety`}
                                className="w-full"
                              >
                                <SelectValue placeholder="Select variety" />
                              </SelectTrigger>
                              <SelectContent>
                                {POTATO_VARIETY_OPTIONS.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                        </div>

                        <div className="lg:col-span-3">
                          <Field>
                            <FieldLabel
                              htmlFor={`dispatch-pre-storage-bag-size-${index}-quantity-issued`}
                              className="lg:sr-only"
                            >
                              Quantity Issued (row {index + 1})
                            </FieldLabel>
                            <Input
                              {...numericInputProps}
                              id={`dispatch-pre-storage-bag-size-${index}-quantity-issued`}
                              name={`bagSize.${index}.quantityIssued`}
                              inputMode="numeric"
                              value={row.quantityIssued}
                              onChange={(e) =>
                                updateBagSizeRow(index, {
                                  quantityIssued: e.target.value,
                                })
                              }
                              placeholder="e.g. 100"
                              className="text-right tabular-nums"
                            />
                          </Field>
                        </div>

                        <div className="flex justify-end lg:col-span-2">
                          {row.isExtra ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="size-11 shrink-0 lg:size-10"
                              aria-label={`Remove bag size row ${index + 1}`}
                              onClick={() =>
                                setBagSize((current) =>
                                  current.filter((_, rowIndex) => rowIndex !== index),
                                )
                              }
                            >
                              <Trash2 className="size-4" aria-hidden />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 border-t border-border px-3 py-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11"
                      onClick={() => setBagSize((current) => [...current, createEmptyBagSizeRow()])}
                    >
                      <Plus className="mr-2 size-4" aria-hidden />
                      Add more
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11"
                      onClick={() => setBagSize(createDefaultBagSizeRows())}
                    >
                      Clear quantities
                    </Button>
                  </div>
                </div>
              </FieldSet>

              <FieldSeparator />

              <FieldSet>
                <FieldLegend className="font-heading text-base font-semibold">
                  Weight &amp; Remarks
                </FieldLegend>
                <FieldDescription>
                  Net weight and remarks. Average weight per bag is calculated from net weight
                  divided by total bags issued.
                </FieldDescription>
                <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="dispatch-pre-storage-net-weight">Net Weight</FieldLabel>
                    <Input
                      {...numericInputProps}
                      id="dispatch-pre-storage-net-weight"
                      name="netWeight"
                      value={netWeight}
                      onChange={(e) => setNetWeight(e.target.value)}
                      inputMode="decimal"
                      placeholder="e.g. 5000"
                      className="tabular-nums"
                    />
                    <FieldDescription>Enter weight in kg.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="dispatch-pre-storage-average-weight">
                      Average Weight Per Bag
                    </FieldLabel>
                    <Input
                      id="dispatch-pre-storage-average-weight"
                      name="averageWeightPerBag"
                      value={
                        totalQuantityIssued > 0 && netWeightKg > 0
                          ? averageWeightPerBagKg.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : ''
                      }
                      readOnly
                      tabIndex={-1}
                      placeholder="—"
                      className="tabular-nums bg-muted/30"
                    />
                    <FieldDescription>
                      Net weight ÷ quantity issued (2 decimal places).
                    </FieldDescription>
                  </Field>

                  <Field className="@md/field-group:col-span-2">
                    <FieldLabel htmlFor="dispatch-pre-storage-remarks">Remarks</FieldLabel>
                    <Textarea
                      id="dispatch-pre-storage-remarks"
                      name="remarks"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g. First nikasi gate pass"
                      className="min-h-[120px] resize-y"
                    />
                  </Field>
                </FieldGroup>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <div className="text-sm font-medium text-muted-foreground">Quantity issued</div>
                    <div className="mt-1 font-heading text-xl font-semibold tabular-nums text-foreground">
                      {totalQuantityIssued.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <div className="text-sm font-medium text-muted-foreground">Net weight</div>
                    <div className="mt-1 font-heading text-xl font-semibold tabular-nums text-foreground">
                      {formatOptionalNumber(netWeight)} kg
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <div className="text-sm font-medium text-muted-foreground">Avg. per bag</div>
                    <div className="mt-1 font-heading text-xl font-semibold tabular-nums text-foreground">
                      {formatWeightKg(averageWeightPerBagKg)}
                    </div>
                  </div>
                </div>
              </FieldSet>
            </FieldGroup>
          </CardContent>

          <CardFooter className="justify-end gap-3 border-t bg-muted/30 py-6">
            <Button variant="outline" type="button" onClick={resetForm}>
              Reset changes
            </Button>
            <Button type="button" onClick={handleOpenReview} disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Review'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <DispatchPreStorageSummarySheet
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        values={summaryValues}
        dispatchLedgerLabel={dispatchLedgerLabel}
        onBack={() => setReviewOpen(false)}
        onSubmit={handleConfirmSubmit}
        canSubmit={canSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}

import { useForm } from '@tanstack/react-form';
import { Loader2, Pencil, UserPlus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { toast } from 'sonner';

import { DatePickerInput } from '@/components/date-picker';
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from '@/components/searchable-option-combobox';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type { DaybookOutgoingEntry } from '@/features/daybook/api/types';
import { resolveOutgoingDispatchLedger } from '@/features/daybook/utils/outgoing-dispatch-ledger';
import { useUpdateOutgoingGatePass } from '@/features/outgoing/api/use-update-outgoing-gate-pass';
import { editOutgoingFormSchema } from '@/features/outgoing/schemas/edit-outgoing-form-schema';
import { outgoingGatePassToEditFormValues } from '@/features/outgoing/utils/outgoing-gate-pass-to-edit-form-values';
import { useDispatchLedgers } from '@/features/people/api/use-dispatch-ledgers';
import { AddDispatchLedgerDialog } from '@/features/people/components/add-dispatch-ledger-dialog';
import type { DispatchLedger } from '@/features/people/types';
import { useBillBooks } from '@/features/settings/api/use-bill-books';
import {
  isDirectSaleOutgoing,
  isOutgoingToShed,
  OUTGOING_CATEGORIES,
  OUTGOING_SHEDS,
} from '@/lib/constants';

const CATEGORY_ITEMS = OUTGOING_CATEGORIES.map((value) => ({
  id: value,
  label: value,
}));

const SHED_ITEMS = OUTGOING_SHEDS.map((value) => ({
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

type EditOutgoingGatePassSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gatePass: DaybookOutgoingEntry;
};

type EditOutgoingFormFieldsProps = {
  gatePass: DaybookOutgoingEntry;
  onClose: () => void;
  comboboxPortalContainer: RefObject<HTMLDivElement | null>;
};

function EditOutgoingFormFields({
  gatePass,
  onClose,
  comboboxPortalContainer,
}: EditOutgoingFormFieldsProps) {
  const { mutateAsync: updateOutgoingGatePass, isPending } = useUpdateOutgoingGatePass(
    gatePass._id,
  );
  const { data: billBooksData, isLoading: isLoadingBillBooks } = useBillBooks({
    isActive: 'true',
  });
  const { data: dispatchLedgers = [], isFetched: dispatchLedgersFetched } = useDispatchLedgers();

  const defaultValues = useMemo(() => outgoingGatePassToEditFormValues(gatePass), [gatePass]);
  const savedLedgerName = useMemo(
    () => resolveOutgoingDispatchLedger(gatePass.dispatchLedgerId)?.name.trim() ?? '',
    [gatePass.dispatchLedgerId],
  );

  const categoryOptions = useMemo(
    () => ensureOptionInList(CATEGORY_ITEMS, defaultValues.category),
    [defaultValues.category],
  );
  const shedOptions = useMemo(
    () => ensureOptionInList(SHED_ITEMS, defaultValues.shed),
    [defaultValues.shed],
  );
  const billBookOptions = useMemo<ComboboxOption[]>(() => {
    const options = (billBooksData ?? []).map((book) => ({
      id: book._id,
      label: book.name,
    }));
    const saved = defaultValues.billBook.trim();
    if (saved && !options.some((book) => book.label === saved)) {
      return [...options, { id: saved, label: saved }];
    }
    return options;
  }, [billBooksData, defaultValues.billBook]);
  const dispatchLedgerOptions = useMemo<ComboboxOption[]>(() => {
    const base = dispatchLedgers.map((ledger) => ({
      id: ledger._id,
      label: ledger.name,
    }));
    const savedId = defaultValues.dispatchLedgerId;
    if (!savedId || base.some((option) => option.id === savedId)) return base;
    if (!dispatchLedgersFetched && !savedLedgerName) return base;
    return [...base, { id: savedId, label: savedLedgerName || savedId }];
  }, [defaultValues.dispatchLedgerId, dispatchLedgers, dispatchLedgersFetched, savedLedgerName]);
  const biltiBookOptions = useMemo<ComboboxOption[]>(
    () =>
      ensureOptionInList(
        (billBooksData ?? []).map((book) => ({
          id: book.name,
          label: book.name,
        })),
        defaultValues.biltiBook,
      ),
    [billBooksData, defaultValues.biltiBook],
  );

  const [categorySearch, setCategorySearch] = useState(() => defaultValues.category);
  const [categoryComboboxOpen, setCategoryComboboxOpen] = useState(false);
  const [shedSearch, setShedSearch] = useState(() => defaultValues.shed);
  const [shedComboboxOpen, setShedComboboxOpen] = useState(false);
  const [ledgerSearch, setLedgerSearch] = useState(savedLedgerName);
  const ledgerSearchSynced = useRef(savedLedgerName.length > 0);
  const [ledgerComboboxOpen, setLedgerComboboxOpen] = useState(false);
  const [addLedgerOpen, setAddLedgerOpen] = useState(false);
  const [billBookSearch, setBillBookSearch] = useState('');
  const [billBookComboboxOpen, setBillBookComboboxOpen] = useState(false);
  const [biltiBookSearch, setBiltiBookSearch] = useState('');
  const [biltiBookComboboxOpen, setBiltiBookComboboxOpen] = useState(false);

  const sortedCategories = useMemo(
    () => filterAndSortOptions(categorySearch, categoryOptions),
    [categorySearch, categoryOptions],
  );
  const sortedSheds = useMemo(
    () => filterAndSortOptions(shedSearch, shedOptions),
    [shedSearch, shedOptions],
  );
  const sortedLedgers = useMemo(
    () => filterAndSortOptions(ledgerSearch, dispatchLedgerOptions),
    [ledgerSearch, dispatchLedgerOptions],
  );
  const sortedBillBooks = useMemo(
    () => filterAndSortOptions(billBookSearch, billBookOptions),
    [billBookSearch, billBookOptions],
  );
  const sortedBiltiBooks = useMemo(
    () => filterAndSortOptions(biltiBookSearch, biltiBookOptions),
    [biltiBookSearch, biltiBookOptions],
  );

  useEffect(() => {
    if (ledgerComboboxOpen || ledgerSearchSynced.current || !dispatchLedgersFetched) return;
    const label = dispatchLedgerOptions.find(
      (option) => option.id === defaultValues.dispatchLedgerId,
    )?.label;
    if (!label) return;
    ledgerSearchSynced.current = true;
    setLedgerSearch(label);
  }, [
    defaultValues.dispatchLedgerId,
    dispatchLedgerOptions,
    dispatchLedgersFetched,
    ledgerComboboxOpen,
  ]);

  const handleLedgerSearch = (value: string) => {
    if (ledgerComboboxOpen) ledgerSearchSynced.current = true;
    setLedgerSearch(value);
  };

  const handleLedgerOpen = (open: boolean) => {
    if (open) ledgerSearchSynced.current = true;
    setLedgerComboboxOpen(open);
  };

  const form = useForm({
    defaultValues,
    validators: {
      onChange: editOutgoingFormSchema,
      onSubmit: editOutgoingFormSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = editOutgoingFormSchema.parse(value);

      try {
        const { message } = await updateOutgoingGatePass({
          id: gatePass._id,
          form: parsed,
        });

        toast.success(message ?? 'Outgoing gate pass updated.', {
          position: 'bottom-right',
        });
        onClose();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to update outgoing gate pass',
          { position: 'bottom-right' },
        );
      }
    },
  });

  const resetComboboxState = () => {
    setCategorySearch(defaultValues.category);
    setCategoryComboboxOpen(false);
    setShedSearch(defaultValues.shed);
    setShedComboboxOpen(false);
    ledgerSearchSynced.current = savedLedgerName.length > 0;
    setLedgerSearch(savedLedgerName);
    setLedgerComboboxOpen(false);
    setBillBookSearch('');
    setBillBookComboboxOpen(false);
    setBiltiBookSearch('');
    setBiltiBookComboboxOpen(false);
  };

  const handleReset = () => {
    form.reset(defaultValues);
    resetComboboxState();
  };

  const handleLedgerCreated = (ledger: DispatchLedger) => {
    form.setFieldValue('dispatchLedgerId', ledger._id);
    ledgerSearchSynced.current = true;
    setLedgerSearch(ledger.name);
    setLedgerComboboxOpen(false);
  };

  return (
    <>
      <form
        id={`edit-outgoing-form-${gatePass._id}`}
        noValidate
        className="flex flex-1 flex-col overflow-hidden"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <FieldGroup className="gap-8">
            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">
                General details
              </FieldLegend>
              <FieldDescription>
                Update the outgoing date, optional manual pass number, and category.
              </FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6">
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

                <form.Field name="manualGatePassNumber">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Manual gate pass no.</FieldLabel>
                        <Input
                          {...numericInputProps}
                          id={field.name}
                          name={field.name}
                          value={field.state.value != null ? String(field.state.value) : ''}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(parseOptionalPositiveNumber(event.target.value))
                          }
                          inputMode="numeric"
                          placeholder="Optional"
                          aria-invalid={isInvalid}
                          className="h-11 text-base tabular-nums"
                        />
                        <FieldDescription>
                          Leave blank if no manual slip number was issued.
                        </FieldDescription>
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
                        <FieldLabel htmlFor="edit-outgoing-category">Category</FieldLabel>
                        <SearchableOptionCombobox
                          id="edit-outgoing-category"
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          placeholder="Select category"
                          emptyMessage="No categories found."
                          options={categoryOptions}
                          sortedOptions={sortedCategories}
                          search={categorySearch}
                          setSearch={setCategorySearch}
                          open={categoryComboboxOpen}
                          setOpen={setCategoryComboboxOpen}
                          disabled={isPending}
                          portalContainer={comboboxPortalContainer}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="shed">
                  {(field) => (
                    <form.Subscribe selector={(state) => state.values.category}>
                      {(category) => {
                        const shedRequired = isOutgoingToShed(category);
                        const isInvalid = shedRequired
                          ? field.state.meta.errors.length > 0
                          : isFieldInvalid(field.state.meta);
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor="edit-outgoing-shed">Shed</FieldLabel>
                            <SearchableOptionCombobox
                              id="edit-outgoing-shed"
                              name={field.name}
                              value={field.state.value}
                              onValueChange={field.handleChange}
                              onBlur={field.handleBlur}
                              isInvalid={isInvalid}
                              placeholder="Select shed"
                              emptyMessage="No sheds found."
                              options={shedOptions}
                              sortedOptions={sortedSheds}
                              search={shedSearch}
                              setSearch={setShedSearch}
                              open={shedComboboxOpen}
                              setOpen={setShedComboboxOpen}
                              disabled={isPending}
                              portalContainer={comboboxPortalContainer}
                            />
                            <FieldDescription>
                              {shedRequired
                                ? 'Required when the category is Outgoing to Shed.'
                                : 'Optional. Leave blank if no shed applies.'}
                            </FieldDescription>
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                          </Field>
                        );
                      }}
                    </form.Subscribe>
                  )}
                </form.Field>

                <form.Field name="preSowingTreatment">
                  {(field) => (
                    <Field orientation="horizontal" className="min-h-11">
                      <Checkbox
                        id="edit-outgoing-pre-sowing-treatment"
                        name={field.name}
                        checked={field.state.value}
                        onCheckedChange={(checked) => field.handleChange(checked === true)}
                        onBlur={field.handleBlur}
                        disabled={isPending}
                      />
                      <FieldLabel htmlFor="edit-outgoing-pre-sowing-treatment">
                        Pre-sowing treatment
                      </FieldLabel>
                    </Field>
                  )}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <form.Subscribe
              selector={(state) => state.values.category}
              children={(category) =>
                isDirectSaleOutgoing(category) ? (
                  <>
                    <FieldSet>
                      <FieldLegend className="font-heading text-base font-semibold">
                        Dispatch ledger
                      </FieldLegend>
                      <FieldDescription>
                        Select the dispatch ledger this direct sale belongs to.
                      </FieldDescription>
                      <FieldGroup className="mt-5 grid grid-cols-1 gap-6">
                        <form.Field name="dispatchLedgerId">
                          {(field) => {
                            const isInvalid = isFieldInvalid(field.state.meta);
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor="edit-outgoing-dispatch-ledger">
                                  Dispatch ledger
                                </FieldLabel>
                                <div className="flex gap-2">
                                  <div className="min-w-0 flex-1">
                                    <SearchableOptionCombobox
                                      id="edit-outgoing-dispatch-ledger"
                                      name={field.name}
                                      value={field.state.value}
                                      onValueChange={field.handleChange}
                                      onBlur={field.handleBlur}
                                      isInvalid={isInvalid}
                                      placeholder="Search dispatch ledgers..."
                                      emptyMessage="No dispatch ledgers found."
                                      options={dispatchLedgerOptions}
                                      sortedOptions={sortedLedgers}
                                      search={ledgerSearch}
                                      setSearch={handleLedgerSearch}
                                      open={ledgerComboboxOpen}
                                      setOpen={handleLedgerOpen}
                                      disabled={isPending}
                                      portalContainer={comboboxPortalContainer}
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    className="h-11 shrink-0 gap-1.5 px-3"
                                    onClick={() => setAddLedgerOpen(true)}
                                    disabled={isPending}
                                    aria-label="Add dispatch ledger"
                                  >
                                    <UserPlus className="size-4 shrink-0" />
                                    <span className="hidden sm:inline">Add</span>
                                  </Button>
                                </div>
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
                        Optional source, destination, and vehicle details for this dispatch.
                      </FieldDescription>
                      <FieldGroup className="mt-5 grid grid-cols-1 gap-6">
                        <form.Field name="from">
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
                                  onChange={(event) => field.handleChange(event.target.value)}
                                  placeholder="Optional"
                                  autoComplete="off"
                                  aria-invalid={isInvalid}
                                  className="h-11 text-base"
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                              </Field>
                            );
                          }}
                        </form.Field>

                        <form.Field name="to">
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
                                  onChange={(event) => field.handleChange(event.target.value)}
                                  placeholder="Optional"
                                  autoComplete="off"
                                  aria-invalid={isInvalid}
                                  className="h-11 text-base"
                                />
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
                                  onChange={(event) =>
                                    field.handleChange(event.target.value.toUpperCase())
                                  }
                                  placeholder="Optional"
                                  autoComplete="off"
                                  aria-invalid={isInvalid}
                                  className="h-11 text-base uppercase"
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                              </Field>
                            );
                          }}
                        </form.Field>

                        <form.Field name="transportCompany">
                          {(field) => {
                            const isInvalid = isFieldInvalid(field.state.meta);
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>Transport company</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) => field.handleChange(event.target.value)}
                                  placeholder="Optional"
                                  autoComplete="organization"
                                  aria-invalid={isInvalid}
                                  className="h-11 text-base"
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                              </Field>
                            );
                          }}
                        </form.Field>

                        <form.Field name="LSNumber">
                          {(field) => {
                            const isInvalid = isFieldInvalid(field.state.meta);
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>L.S. No.</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) => field.handleChange(event.target.value)}
                                  placeholder="Optional"
                                  autoComplete="off"
                                  aria-invalid={isInvalid}
                                  className="h-11 text-base"
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                              </Field>
                            );
                          }}
                        </form.Field>

                        <form.Field name="driverName">
                          {(field) => {
                            const isInvalid = isFieldInvalid(field.state.meta);
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>Driver name</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) => field.handleChange(event.target.value)}
                                  placeholder="Optional"
                                  autoComplete="name"
                                  aria-invalid={isInvalid}
                                  className="h-11 text-base"
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                              </Field>
                            );
                          }}
                        </form.Field>

                        <form.Field name="driverMobile">
                          {(field) => {
                            const isInvalid = isFieldInvalid(field.state.meta);
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>Driver mobile</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  type="tel"
                                  inputMode="tel"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) => field.handleChange(event.target.value)}
                                  placeholder="Optional"
                                  autoComplete="tel"
                                  aria-invalid={isInvalid}
                                  className="h-11 text-base"
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                              </Field>
                            );
                          }}
                        </form.Field>

                        <form.Field name="owner">
                          {(field) => {
                            const isInvalid = isFieldInvalid(field.state.meta);
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>Owner</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) => field.handleChange(event.target.value)}
                                  placeholder="Optional"
                                  autoComplete="name"
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

                    <FieldSet>
                      <FieldLegend className="font-heading text-base font-semibold">
                        Bill &amp; bilti
                      </FieldLegend>
                      <FieldDescription>
                        Cost per bag is required. Bill number, bilti number, and book references are
                        optional.
                      </FieldDescription>
                      <FieldGroup className="mt-5 grid grid-cols-1 gap-6">
                        <form.Field name="costPerBag">
                          {(field) => {
                            const isInvalid = isFieldInvalid(field.state.meta);
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>Cost per bag</FieldLabel>
                                <Input
                                  {...numericInputProps}
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) => field.handleChange(event.target.value)}
                                  inputMode="decimal"
                                  placeholder="e.g. 450"
                                  aria-invalid={isInvalid}
                                  disabled={isPending}
                                  className="h-11 text-base tabular-nums"
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                              </Field>
                            );
                          }}
                        </form.Field>

                        <form.Field name="billNumber">
                          {(field) => {
                            const isInvalid = isFieldInvalid(field.state.meta);
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>Bill Number</FieldLabel>
                                <Input
                                  {...numericInputProps}
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) => field.handleChange(event.target.value)}
                                  inputMode="numeric"
                                  placeholder="Optional"
                                  aria-invalid={isInvalid}
                                  disabled={isPending}
                                  className="h-11 text-base tabular-nums"
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                              </Field>
                            );
                          }}
                        </form.Field>

                        <form.Field name="biltiNumber">
                          {(field) => {
                            const isInvalid = isFieldInvalid(field.state.meta);
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>Bilti No.</FieldLabel>
                                <Input
                                  {...numericInputProps}
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) => field.handleChange(event.target.value)}
                                  inputMode="numeric"
                                  placeholder="Optional"
                                  aria-invalid={isInvalid}
                                  disabled={isPending}
                                  className="h-11 text-base tabular-nums"
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                              </Field>
                            );
                          }}
                        </form.Field>

                        <form.Field name="billBook">
                          {(field) => {
                            const isInvalid = isFieldInvalid(field.state.meta);
                            const selectedId =
                              billBookOptions.find((book) => book.label === field.state.value)
                                ?.id ?? '';
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor="edit-outgoing-bill-book">Bill book</FieldLabel>
                                <SearchableOptionCombobox
                                  id="edit-outgoing-bill-book"
                                  name={field.name}
                                  value={selectedId}
                                  onValueChange={(bookId) => {
                                    const label =
                                      billBookOptions.find((book) => book.id === bookId)?.label ??
                                      '';
                                    field.handleChange(label);
                                  }}
                                  onBlur={field.handleBlur}
                                  isInvalid={isInvalid}
                                  placeholder={
                                    isLoadingBillBooks ? 'Loading bill books…' : 'Optional'
                                  }
                                  emptyMessage={
                                    isLoadingBillBooks
                                      ? 'Loading bill books…'
                                      : 'No active bill books.'
                                  }
                                  options={billBookOptions}
                                  sortedOptions={sortedBillBooks}
                                  search={billBookSearch}
                                  setSearch={setBillBookSearch}
                                  open={billBookComboboxOpen}
                                  setOpen={setBillBookComboboxOpen}
                                  disabled={isPending || isLoadingBillBooks}
                                  portalContainer={comboboxPortalContainer}
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                              </Field>
                            );
                          }}
                        </form.Field>

                        <form.Field name="biltiBook">
                          {(field) => {
                            const isInvalid = isFieldInvalid(field.state.meta);
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor="edit-outgoing-bilti-book">
                                  Bilti book
                                </FieldLabel>
                                <SearchableOptionCombobox
                                  id="edit-outgoing-bilti-book"
                                  name={field.name}
                                  value={field.state.value}
                                  onValueChange={field.handleChange}
                                  onBlur={field.handleBlur}
                                  isInvalid={isInvalid}
                                  placeholder={
                                    isLoadingBillBooks ? 'Loading bill books…' : 'Optional'
                                  }
                                  emptyMessage={
                                    isLoadingBillBooks
                                      ? 'Loading bill books…'
                                      : 'No active bill books.'
                                  }
                                  options={biltiBookOptions}
                                  sortedOptions={sortedBiltiBooks}
                                  search={biltiBookSearch}
                                  setSearch={setBiltiBookSearch}
                                  open={biltiBookComboboxOpen}
                                  setOpen={setBiltiBookComboboxOpen}
                                  disabled={isPending || isLoadingBillBooks}
                                  portalContainer={comboboxPortalContainer}
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                              </Field>
                            );
                          }}
                        </form.Field>
                      </FieldGroup>
                    </FieldSet>
                  </>
                ) : null
              }
            />

            <FieldSet>
              <FieldLegend className="font-heading text-base font-semibold">Remarks</FieldLegend>
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
                          onChange={(event) => field.handleChange(event.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Add any additional comments or observations (optional)"
                          className="min-h-[120px] resize-y text-base"
                          disabled={isPending}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </div>

        <SheetFooter className="flex-row gap-2.5 border-t border-border/40 px-5 py-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={handleReset}
          >
            Reset
          </Button>
          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button
                type="submit"
                size="sm"
                className="flex-1"
                disabled={isSubmitting || isPending}
              >
                {isSubmitting || isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            )}
          />
        </SheetFooter>
      </form>
      <AddDispatchLedgerDialog
        open={addLedgerOpen}
        onOpenChange={setAddLedgerOpen}
        onSuccess={handleLedgerCreated}
      />
    </>
  );
}

export function EditOutgoingGatePassSheet({
  open,
  onOpenChange,
  gatePass,
}: EditOutgoingGatePassSheetProps) {
  const comboboxPortalContainerRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange} modal={false}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 data-[side=right]:max-w-full sm:data-[side=right]:max-w-md"
      >
        <div
          ref={comboboxPortalContainerRef}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <SheetHeader className="border-b border-border/40 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Pencil className="size-4" />
              </span>
              <div className="min-w-0 space-y-0.5">
                <SheetTitle className="text-base leading-none font-semibold">
                  Edit OGP <span className="font-mono tabular-nums">#{gatePass.gatePassNo}</span>
                </SheetTitle>
                <SheetDescription className="text-xs leading-snug text-muted-foreground">
                  Update the dispatch ledger, route, truck, billing details, and remarks for this
                  outgoing pass.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {open ? (
            <EditOutgoingFormFields
              key={gatePass._id}
              gatePass={gatePass}
              onClose={() => handleOpenChange(false)}
              comboboxPortalContainer={comboboxPortalContainerRef}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

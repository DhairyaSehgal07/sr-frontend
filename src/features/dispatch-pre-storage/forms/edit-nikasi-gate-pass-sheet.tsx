import { useMemo, useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
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
import { DatePickerInput } from '@/components/date-picker';
import {
  ManagedSearchableOptionCombobox,
  type ComboboxOption,
} from '@/components/searchable-option-combobox';
import { DISPATCH_PRE_STORAGE_CATEGORIES } from '@/lib/constants';
import { usePatchNikasiGatePass } from '@/features/dispatch-pre-storage/api/use-patch-nikasi-gate-pass';
import type { NikasiGatePass } from '@/features/dispatch-pre-storage/api/types';
import { useDispatchLedgers } from '@/features/people/api/use-dispatch-ledgers';
import { numericInputProps } from '@/features/dispatch-pre-storage/forms/dispatch-pre-storage-form-utils';
import {
  buildNikasiGatePassPatch,
  draftFromNikasiGatePass,
  nikasiGatePassEditFieldErrors,
  type NikasiGatePassEditDraft,
} from '@/features/dispatch-pre-storage/forms/build-nikasi-gate-pass-patch';

const fieldInputClassName = 'h-11 text-base md:text-base';

type EditNikasiGatePassSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gatePass: NikasiGatePass;
};

export function EditNikasiGatePassSheet({
  open,
  onOpenChange,
  gatePass,
}: EditNikasiGatePassSheetProps) {
  const { mutateAsync: patchGatePass, isPending } = usePatchNikasiGatePass(gatePass._id);

  const handleOpenChange = (next: boolean) => {
    if (isPending) return;
    onOpenChange(next);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:max-w-full sm:data-[side=right]:max-w-lg"
      >
        <SheetHeader className="border-b border-border/40 px-5 py-4 pr-14">
          <SheetTitle className="font-heading text-base font-semibold tracking-tight">
            Edit NGP <span className="font-mono tabular-nums">#{gatePass.gatePassNo}</span>
          </SheetTitle>
          <SheetDescription>Update pass details. Only changed fields are saved.</SheetDescription>
        </SheetHeader>

        {open ? (
          <EditNikasiGatePassSheetFields
            key={`${gatePass._id}:${gatePass.updatedAt ?? ''}`}
            gatePass={gatePass}
            isPending={isPending}
            onCancel={() => handleOpenChange(false)}
            onSave={async (patch) => {
              const { message } = await patchGatePass(patch);
              toast.success(message ?? 'Nikasi gate pass updated.', {
                position: 'bottom-right',
              });
              onOpenChange(false);
            }}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

type EditNikasiGatePassSheetFieldsProps = {
  gatePass: NikasiGatePass;
  isPending: boolean;
  onCancel: () => void;
  onSave: (patch: ReturnType<typeof buildNikasiGatePassPatch>) => Promise<void>;
};

function EditNikasiGatePassSheetFields({
  gatePass,
  isPending,
  onCancel,
  onSave,
}: EditNikasiGatePassSheetFieldsProps) {
  const [draft, setDraft] = useState<NikasiGatePassEditDraft>(() =>
    draftFromNikasiGatePass(gatePass),
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: dispatchLedgersData } = useDispatchLedgers();

  const categoryOptions = useMemo<ComboboxOption[]>(() => {
    const options: ComboboxOption[] = DISPATCH_PRE_STORAGE_CATEGORIES.map((value) => ({
      id: value,
      label: value,
    }));
    const current = gatePass.category.trim();
    if (current && !options.some((option) => option.id === current)) {
      options.unshift({ id: current, label: current });
    }
    return options;
  }, [gatePass.category]);

  const dispatchLedgerOptions = useMemo<ComboboxOption[]>(() => {
    const options: ComboboxOption[] = (dispatchLedgersData ?? []).map((ledger) => ({
      id: ledger._id,
      label: ledger.name,
    }));
    const currentId = gatePass.dispatchLedgerId._id;
    const currentName = gatePass.dispatchLedgerId.name;
    if (currentId && currentName && !options.some((option) => option.id === currentId)) {
      options.unshift({ id: currentId, label: currentName });
    }
    return options;
  }, [dispatchLedgersData, gatePass.dispatchLedgerId._id, gatePass.dispatchLedgerId.name]);

  const errors = useMemo(() => nikasiGatePassEditFieldErrors(draft), [draft]);
  const patch = useMemo(() => buildNikasiGatePassPatch(gatePass, draft), [gatePass, draft]);
  const hasChanges = Object.keys(patch).length > 0;
  const canSave = hasChanges && Object.keys(errors).length === 0 && !isPending;

  const updateDraft = (next: Partial<NikasiGatePassEditDraft>) => {
    setSubmitError(null);
    setDraft((current) => ({ ...current, ...next }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;

    try {
      await onSave(patch);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update nikasi gate pass.';
      setSubmitError(message);
      toast.error(message, { position: 'bottom-right' });
    }
  };

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => void handleSubmit(event)}>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.manualGatePassNumber)}>
            <FieldLabel htmlFor="nikasi-edit-manual-gate-pass">Manual gate pass no.</FieldLabel>
            <Input
              {...numericInputProps}
              id="nikasi-edit-manual-gate-pass"
              name="manualGatePassNumber"
              value={draft.manualGatePassNumber}
              onChange={(event) => updateDraft({ manualGatePassNumber: event.target.value })}
              inputMode="numeric"
              placeholder="e.g. 1204"
              aria-invalid={Boolean(errors.manualGatePassNumber)}
              className={`${fieldInputClassName} tabular-nums`}
            />
            {errors.manualGatePassNumber ? (
              <FieldError>{errors.manualGatePassNumber}</FieldError>
            ) : null}
          </Field>

          <div>
            <DatePickerInput
              id="nikasi-edit-date"
              label="Date"
              value={draft.date}
              onChange={(date) => updateDraft({ date })}
              placeholder="Pick a date"
              aria-invalid={Boolean(errors.date)}
            />
            {errors.date ? <FieldError>{errors.date}</FieldError> : null}
          </div>
        </div>

        <Field data-invalid={Boolean(errors.category)}>
          <FieldLabel htmlFor="nikasi-edit-category">Category</FieldLabel>
          <ManagedSearchableOptionCombobox
            id="nikasi-edit-category"
            name="category"
            value={draft.category}
            onValueChange={(category) => updateDraft({ category })}
            onBlur={() => {}}
            isInvalid={Boolean(errors.category)}
            placeholder="Search categories..."
            emptyMessage="No categories found."
            options={categoryOptions}
          />
          {errors.category ? <FieldError>{errors.category}</FieldError> : null}
        </Field>

        <Field data-invalid={Boolean(errors.dispatchLedgerId)}>
          <FieldLabel htmlFor="nikasi-edit-dispatch-ledger">Dispatch ledger</FieldLabel>
          <ManagedSearchableOptionCombobox
            id="nikasi-edit-dispatch-ledger"
            name="dispatchLedgerId"
            value={draft.dispatchLedgerId}
            onValueChange={(dispatchLedgerId) => updateDraft({ dispatchLedgerId })}
            onBlur={() => {}}
            isInvalid={Boolean(errors.dispatchLedgerId)}
            placeholder="Search dispatch ledgers..."
            emptyMessage="No dispatch ledgers found."
            options={dispatchLedgerOptions}
          />
          {errors.dispatchLedgerId ? <FieldError>{errors.dispatchLedgerId}</FieldError> : null}
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.from)}>
            <FieldLabel htmlFor="nikasi-edit-from">From</FieldLabel>
            <Input
              id="nikasi-edit-from"
              name="from"
              value={draft.from}
              onChange={(event) => updateDraft({ from: event.target.value })}
              placeholder="e.g. Kapur"
              autoComplete="off"
              aria-invalid={Boolean(errors.from)}
              className={fieldInputClassName}
            />
            {errors.from ? <FieldError>{errors.from}</FieldError> : null}
          </Field>

          <Field data-invalid={Boolean(errors.to)}>
            <FieldLabel htmlFor="nikasi-edit-to">To</FieldLabel>
            <Input
              id="nikasi-edit-to"
              name="to"
              value={draft.to}
              onChange={(event) => updateDraft({ to: event.target.value })}
              placeholder="e.g. Delhi"
              autoComplete="off"
              aria-invalid={Boolean(errors.to)}
              className={fieldInputClassName}
            />
            {errors.to ? <FieldError>{errors.to}</FieldError> : null}
          </Field>
        </div>

        <Field data-invalid={Boolean(errors.truckNumber)}>
          <FieldLabel htmlFor="nikasi-edit-truck-number">Truck number</FieldLabel>
          <Input
            id="nikasi-edit-truck-number"
            name="truckNumber"
            value={draft.truckNumber}
            onChange={(event) => updateDraft({ truckNumber: event.target.value.toUpperCase() })}
            placeholder="e.g. PB10AB1234"
            autoComplete="off"
            aria-invalid={Boolean(errors.truckNumber)}
            className={`${fieldInputClassName} uppercase`}
          />
          {errors.truckNumber ? <FieldError>{errors.truckNumber}</FieldError> : null}
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="nikasi-edit-transport-company">Transport company</FieldLabel>
            <Input
              id="nikasi-edit-transport-company"
              name="transportCompany"
              value={draft.transportCompany}
              onChange={(event) => updateDraft({ transportCompany: event.target.value })}
              placeholder="e.g. Sharma Transport"
              autoComplete="organization"
              className={fieldInputClassName}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="nikasi-edit-ls-number">L.S. No.</FieldLabel>
            <Input
              id="nikasi-edit-ls-number"
              name="LSNumber"
              value={draft.LSNumber}
              onChange={(event) => updateDraft({ LSNumber: event.target.value })}
              placeholder="Optional"
              autoComplete="off"
              className={fieldInputClassName}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="nikasi-edit-driver-name">Driver name</FieldLabel>
            <Input
              id="nikasi-edit-driver-name"
              name="driverName"
              value={draft.driverName}
              onChange={(event) => updateDraft({ driverName: event.target.value })}
              placeholder="Optional"
              autoComplete="name"
              className={fieldInputClassName}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="nikasi-edit-owner">Owner</FieldLabel>
            <Input
              id="nikasi-edit-owner"
              name="owner"
              value={draft.owner}
              onChange={(event) => updateDraft({ owner: event.target.value })}
              placeholder="Optional"
              autoComplete="name"
              className={fieldInputClassName}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="nikasi-edit-remarks">Remarks</FieldLabel>
          <Textarea
            id="nikasi-edit-remarks"
            name="remarks"
            value={draft.remarks}
            onChange={(event) => updateDraft({ remarks: event.target.value })}
            placeholder="Optional"
            className="min-h-24 resize-y text-base md:text-base"
          />
        </Field>

        {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
      </div>

      <SheetFooter className="flex-col gap-2 border-t border-border/40 px-5 py-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full sm:w-auto"
          disabled={isPending}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" className="h-11 w-full sm:w-auto" disabled={!canSave}>
          {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Save
        </Button>
      </SheetFooter>
    </form>
  );
}

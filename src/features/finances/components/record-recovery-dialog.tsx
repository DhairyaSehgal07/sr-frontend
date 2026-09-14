import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { DatePickerInput } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';

import { useCreateFinanceRecovery } from '../api/use-create-finance-recovery';
import { formatInr, rupeesToPaise } from '../lib/format';
import type { PartyOutstanding } from '../types';

type RecordRecoveryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billBookId?: string;
  outstanding: PartyOutstanding[];
};

type RecoveryDraft = {
  dispatchLedgerId: string;
  billBookId: string;
  amount: string;
  date: Date;
  remark: string;
};

function emptyDraft(billBookId?: string): RecoveryDraft {
  return {
    dispatchLedgerId: '',
    billBookId: billBookId ?? '',
    amount: '',
    date: new Date(),
    remark: '',
  };
}

function uniqueParties(rows: PartyOutstanding[]) {
  const seen = new Set<string>();
  const parties: Array<{ id: string; name: string }> = [];

  for (const row of rows) {
    if (row.due <= 0 || seen.has(row.dispatchLedgerId)) continue;
    seen.add(row.dispatchLedgerId);
    parties.push({ id: row.dispatchLedgerId, name: row.partyName });
  }

  return parties;
}

function RecoveryForm({
  draft,
  setDraft,
  outstanding,
  amountError,
  onSubmit,
  submitLabel,
  fullWidthSubmit,
  isSubmitting,
}: {
  draft: RecoveryDraft;
  setDraft: (next: RecoveryDraft) => void;
  outstanding: PartyOutstanding[];
  amountError: string | null;
  onSubmit: () => void;
  submitLabel: string;
  fullWidthSubmit: boolean;
  isSubmitting: boolean;
}) {
  const parties = useMemo(() => uniqueParties(outstanding), [outstanding]);
  const booksForParty = useMemo(
    () =>
      outstanding.filter(
        (row) => row.dispatchLedgerId === draft.dispatchLedgerId && row.due > 0,
      ),
    [outstanding, draft.dispatchLedgerId],
  );
  const due =
    outstanding.find(
      (row) =>
        row.dispatchLedgerId === draft.dispatchLedgerId && row.billBookId === draft.billBookId,
    )?.due ?? 0;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="recovery-party" className="gap-1">
            Dispatch ledger
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Select
            value={draft.dispatchLedgerId || undefined}
            onValueChange={(dispatchLedgerId) => {
              const books = outstanding.filter(
                (row) => row.dispatchLedgerId === dispatchLedgerId && row.due > 0,
              );
              const nextBook = books.some((row) => row.billBookId === draft.billBookId)
                ? draft.billBookId
                : (books[0]?.billBookId ?? '');
              setDraft({ ...draft, dispatchLedgerId, billBookId: nextBook });
            }}
          >
            <SelectTrigger id="recovery-party" className="h-11 w-full text-base">
              <SelectValue placeholder="Select party" />
            </SelectTrigger>
            <SelectContent>
              {parties.map((party) => (
                <SelectItem key={party.id} value={party.id}>
                  {party.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {parties.length === 0 ? (
            <FieldDescription>No outstanding parties for this bill book.</FieldDescription>
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="recovery-book" className="gap-1">
            Bill book
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Select
            value={draft.billBookId || undefined}
            onValueChange={(billBookId) => setDraft({ ...draft, billBookId })}
            disabled={!draft.dispatchLedgerId}
          >
            <SelectTrigger id="recovery-book" className="h-11 w-full text-base">
              <SelectValue placeholder="Select bill book" />
            </SelectTrigger>
            <SelectContent>
              {booksForParty.map((row) => (
                <SelectItem key={row.billBookId} value={row.billBookId}>
                  {row.billBook}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {draft.dispatchLedgerId && draft.billBookId ? (
            <FieldDescription>Outstanding {formatInr(due)}</FieldDescription>
          ) : null}
        </Field>

        <DatePickerInput
          id="recovery-date"
          label="Date"
          required
          value={draft.date}
          onChange={(date) => {
            if (date) setDraft({ ...draft, date });
          }}
        />

        <Field data-invalid={amountError ? true : undefined}>
          <FieldLabel htmlFor="recovery-amount" className="gap-1">
            Amount
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <Input
            id="recovery-amount"
            className="h-11 text-base tabular-nums"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={draft.amount}
            aria-invalid={amountError ? true : undefined}
            onChange={(event) => setDraft({ ...draft, amount: event.target.value })}
          />
          {amountError ? <FieldError>{amountError}</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="recovery-remark" className="flex flex-wrap items-center gap-2">
            Remark
          </FieldLabel>
          <Textarea
            id="recovery-remark"
            className="text-base md:text-sm"
            rows={2}
            maxLength={500}
            placeholder="Optional note"
            value={draft.remark}
            onChange={(event) => setDraft({ ...draft, remark: event.target.value })}
          />
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        className={fullWidthSubmit ? 'h-11 w-full' : 'h-11 w-full sm:h-9 sm:w-auto'}
        disabled={parties.length === 0 || isSubmitting}
      >
        {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {submitLabel}
      </Button>
    </form>
  );
}

export function RecordRecoveryDialog({
  open,
  onOpenChange,
  billBookId,
  outstanding,
}: RecordRecoveryDialogProps) {
  const isMobile = useIsMobile();
  const { mutateAsync: createRecovery, isPending } = useCreateFinanceRecovery();
  const [draft, setDraft] = useState<RecoveryDraft>(() => emptyDraft(billBookId));
  const [amountError, setAmountError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(emptyDraft(billBookId));
      setAmountError(null);
    }
  }, [open, billBookId]);

  const handleSubmit = () => {
    const parsed = Number(draft.amount.replace(/,/g, '').trim());
    const due =
      outstanding.find(
        (row) =>
          row.dispatchLedgerId === draft.dispatchLedgerId && row.billBookId === draft.billBookId,
      )?.due ?? 0;

    if (!draft.dispatchLedgerId) {
      toast.error('Select a dispatch ledger party.', { position: 'bottom-right' });
      return;
    }
    if (!draft.billBookId) {
      toast.error('Select a bill book.', { position: 'bottom-right' });
      return;
    }
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setAmountError('Enter a recovery amount greater than zero.');
      return;
    }

    const amountPaise = rupeesToPaise(parsed);
    const duePaise = rupeesToPaise(due);

    if (amountPaise > duePaise) {
      setAmountError(`Amount cannot exceed outstanding of ${formatInr(due)}.`);
      return;
    }

    setAmountError(null);

    const remark = draft.remark.trim();

    void createRecovery({
      date: draft.date.toISOString(),
      dispatchLedgerId: draft.dispatchLedgerId,
      billBookId: draft.billBookId,
      amountPaise,
      ...(remark ? { remark } : {}),
    })
      .then((response) => {
        toast.success(response.message ?? 'Recovery recorded', { position: 'bottom-right' });
        onOpenChange(false);
      })
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : 'Failed to record recovery', {
          position: 'bottom-right',
        });
      });
  };

  const form = (
    <RecoveryForm
      draft={draft}
      setDraft={setDraft}
      outstanding={outstanding}
      amountError={amountError}
      onSubmit={handleSubmit}
      submitLabel={isPending ? 'Recording…' : 'Record recovery'}
      fullWidthSubmit={isMobile}
      isSubmitting={isPending}
    />
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[90dvh] overflow-y-auto rounded-t-2xl pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <SheetHeader>
            <SheetTitle>Record recovery</SheetTitle>
            <SheetDescription>
              Posts Dr Cash and credits the dispatch ledger for the selected bill book.
            </SheetDescription>
          </SheetHeader>
          <div className="px-6 pb-2">{form}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record recovery</DialogTitle>
          <DialogDescription>
            Posts Dr Cash and credits the dispatch ledger for the selected bill book.
          </DialogDescription>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  );
}

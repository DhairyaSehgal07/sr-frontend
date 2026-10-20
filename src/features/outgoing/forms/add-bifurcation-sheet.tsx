import { Loader2, Split, Trash2 } from 'lucide-react';
import { useState, type WheelEvent } from 'react';
import { toast } from 'sonner';

import { FixedBagSizeLabel } from '@/components/bag-quantity-size-field';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { DaybookOutgoingEntry } from '@/features/daybook/api/types';
import type { ShedBifurcationRecord } from '@/features/outgoing/api/types';
import {
  useCreateShedBifurcation,
  useDeleteShedBifurcation,
  useShedBifurcations,
} from '@/features/outgoing/api/use-shed-bifurcation';
import { bifurcationDelta } from '@/features/outgoing/utils/bifurcation-delta';
import { BAG_SIZES } from '@/lib/constants';

type BifurcationQuantityRow = {
  size: string;
  quantity: string;
};

type AddBifurcationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gatePass: DaybookOutgoingEntry;
};

function canonicalBagSize(size: string): string {
  const trimmed = size.trim();
  return BAG_SIZES.find((option) => option.toLowerCase() === trimmed.toLowerCase()) ?? trimmed;
}

function issuedBagsBySize(gatePass: DaybookOutgoingEntry): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const detail of gatePass.orderDetails) {
    const size = canonicalBagSize(detail.size);
    if (!size) continue;
    totals[size] = (totals[size] ?? 0) + detail.quantityIssued;
  }

  return totals;
}

function bifurcationQuantityRows(gatePass: DaybookOutgoingEntry): BifurcationQuantityRow[] {
  const issuedBySize = issuedBagsBySize(gatePass);
  const standardSizes = new Set<string>(BAG_SIZES);
  const rows: BifurcationQuantityRow[] = BAG_SIZES.map((size) => {
    const issued = issuedBySize[size] ?? 0;
    return { size, quantity: issued > 0 ? String(issued) : '' };
  });

  for (const [size, issued] of Object.entries(issuedBySize)) {
    if (standardSizes.has(size) || issued <= 0) continue;
    rows.push({ size, quantity: String(issued) });
  }

  return rows;
}

function quantitySignature(gatePass: DaybookOutgoingEntry): string {
  return gatePass.orderDetails.map((detail) => `${detail.size}:${detail.quantityIssued}`).join('|');
}

function formatBifurcation(record: ShedBifurcationRecord): string {
  const discovered = record.lines.map((line) => `${line.toSize} ${line.quantity}`).join(', ');
  return `${record.fromSize} → ${discovered}`;
}

function AddBifurcationPanel({
  gatePass,
  onOpenChange,
}: {
  gatePass: DaybookOutgoingEntry;
  onOpenChange: (open: boolean) => void;
}) {
  const [rows, setRows] = useState(() => bifurcationQuantityRows(gatePass));
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ShedBifurcationRecord | null>(null);
  const issuedBySize = issuedBagsBySize(gatePass);

  const bifurcationsQuery = useShedBifurcations(gatePass._id);
  const { mutateAsync: createBifurcation, isPending: isSaving } = useCreateShedBifurcation();
  const { mutateAsync: removeBifurcation, isPending: isDeleting } = useDeleteShedBifurcation();

  const updateQuantity = (size: string, quantity: string) => {
    setError(null);
    setRows((current) => current.map((row) => (row.size === size ? { ...row, quantity } : row)));
  };

  const handleSave = async () => {
    const delta = bifurcationDelta(rows, issuedBySize);
    if (!delta.ok) {
      setError(delta.message);
      return;
    }

    try {
      const result = await createBifurcation({
        id: gatePass._id,
        body: { fromSize: delta.fromSize, lines: delta.lines },
      });
      toast.success(result.message ?? 'Shed bifurcation saved.', { position: 'bottom-right' });
      onOpenChange(false);
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'Failed to save bifurcation', {
        position: 'bottom-right',
      });
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;

    try {
      const result = await removeBifurcation({
        id: gatePass._id,
        bifurcationId: pendingDelete._id,
      });
      toast.success(result.message ?? 'Shed bifurcation removed.', { position: 'bottom-right' });
      setPendingDelete(null);
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error ? deleteError.message : 'Failed to remove bifurcation',
        { position: 'bottom-right' },
      );
    }
  };

  const bifurcations = bifurcationsQuery.data ?? [];

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="rounded-lg border border-border">
          <div className="grid grid-cols-[minmax(0,1fr)_7.5rem] border-b border-border bg-muted/50 px-3 py-2.5">
            <div className="text-sm font-medium text-muted-foreground">Size</div>
            <div className="text-sm font-medium text-muted-foreground">Qty</div>
          </div>
          <div className="divide-y divide-border">
            {rows.map((row, index) => (
              <div
                key={row.size}
                className="grid grid-cols-[minmax(0,1fr)_7.5rem] items-center gap-2 px-3 py-2.5"
              >
                <FixedBagSizeLabel size={row.size} rowIndex={index} />
                <Field>
                  <FieldLabel
                    htmlFor={`bifurcation-qty-${gatePass._id}-${index}`}
                    className="sr-only"
                  >
                    Qty ({row.size})
                  </FieldLabel>
                  <Input
                    id={`bifurcation-qty-${gatePass._id}-${index}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="Qty"
                    value={row.quantity}
                    disabled={isSaving}
                    onWheel={(event: WheelEvent<HTMLInputElement>) => event.currentTarget.blur()}
                    onChange={(event) => updateQuantity(row.size, event.target.value)}
                    className="h-11 text-base tabular-nums"
                  />
                </Field>
              </div>
            ))}
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

        <section className="mt-6">
          <h3 className="text-sm font-medium text-foreground">Saved bifurcations</h3>
          {bifurcationsQuery.isLoading ? (
            <p className="mt-2 text-sm text-muted-foreground">Loading saved bifurcations…</p>
          ) : bifurcationsQuery.isError ? (
            <p className="mt-2 text-sm text-destructive">{bifurcationsQuery.error.message}</p>
          ) : bifurcations.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No bifurcations saved for this pass.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
              {bifurcations.map((record) => (
                <li
                  key={record._id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5"
                >
                  <p className="text-sm text-foreground">{formatBifurcation(record)}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove bifurcation ${formatBifurcation(record)}`}
                    disabled={isDeleting}
                    onClick={() => setPendingDelete(record)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <SheetFooter className="flex-row gap-2.5 border-t border-border/40 px-5 py-4">
        <Button
          type="button"
          size="sm"
          className="flex-1"
          disabled={isSaving}
          onClick={() => void handleSave()}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Save bifurcation'
          )}
        </Button>
      </SheetFooter>

      <AlertDialog
        open={pendingDelete != null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setPendingDelete(null);
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="sm:text-left">
            <AlertDialogTitle>Remove this bifurcation?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `${formatBifurcation(pendingDelete)} goes back onto ${pendingDelete.fromSize}. Storage stock is not changed.`
                : 'Those bags go back onto the original size. Storage stock is not changed.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Keep</AlertDialogCancel>
            <Button variant="destructive" disabled={isDeleting} onClick={() => void handleDelete()}>
              {isDeleting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Remove
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function AddBifurcationSheet({ open, onOpenChange, gatePass }: AddBifurcationSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 data-[side=right]:max-w-full sm:data-[side=right]:max-w-md"
      >
        <SheetHeader className="border-b border-border/40 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Split className="size-4" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <SheetTitle className="text-base leading-none font-semibold">
                Add bifurcation{' '}
                <span className="font-mono tabular-nums">OGP #{gatePass.gatePassNo}</span>
              </SheetTitle>
              <SheetDescription className="text-xs leading-snug text-muted-foreground">
                Edit the quantities to the sizes found after drying. One size can go down, and
                leftover bags of that size are saved. The total can rise when bags are repacked.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {open ? (
          <AddBifurcationPanel
            key={`${gatePass._id}-${quantitySignature(gatePass)}`}
            gatePass={gatePass}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

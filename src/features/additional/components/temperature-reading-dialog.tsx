import { useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { DatePickerInput } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export type TemperatureReadingDraft = {
  date: Date;
  time: string;
  readings: Array<{
    chamber: string;
    value: string;
  }>;
};

type TemperatureReadingDialogProps = {
  chamberIds: readonly string[];
  mode: 'add' | 'edit';
  open: boolean;
  initialDraft?: TemperatureReadingDraft;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (draft: TemperatureReadingDraft) => void;
};

function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function getDefaultDraft(chamberIds: readonly string[]): TemperatureReadingDraft {
  return {
    date: new Date(),
    time: getCurrentTime(),
    readings: chamberIds.map((chamber) => ({ chamber, value: '' })),
  };
}

export function TemperatureReadingDialog({
  chamberIds,
  mode,
  open,
  initialDraft,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: TemperatureReadingDialogProps) {
  const [draft, setDraft] = useState<TemperatureReadingDraft>(
    () => initialDraft ?? getDefaultDraft(chamberIds),
  );

  const title = mode === 'add' ? 'Add temperature reading' : 'Update temperature record';
  const description =
    mode === 'add'
      ? 'Enter chamber readings for the selected date and time.'
      : 'Update the date, time, or chamber readings for this record.';

  const updateReading = (index: number, value: string) => {
    setDraft((current) => ({
      ...current,
      readings: current.readings.map((reading, readingIndex) =>
        readingIndex === index ? { ...reading, value } : reading,
      ),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-xl">
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            if (isSubmitting) return;
            onSubmit(draft);
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-heading text-base font-semibold">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto py-1 pr-1">
            <FieldGroup className="gap-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem]">
                <DatePickerInput
                  id={`${mode}-temperature-date`}
                  label="Date"
                  value={draft.date}
                  disabled={isSubmitting}
                  onChange={(date) =>
                    setDraft((current) => ({
                      ...current,
                      date: date ?? new Date(),
                    }))
                  }
                />

                <Field>
                  <FieldLabel htmlFor={`${mode}-temperature-time`}>Time</FieldLabel>
                  <div className="relative">
                    <CalendarClock
                      className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id={`${mode}-temperature-time`}
                      type="time"
                      value={draft.time}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          time: event.target.value,
                        }))
                      }
                      disabled={isSubmitting}
                      className="h-10 pl-10 tabular-nums"
                    />
                  </div>
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {draft.readings.map((reading, index) => (
                  <div
                    key={reading.chamber}
                    className="rounded-xl border border-border bg-muted/20 p-3"
                  >
                    <Field>
                      <FieldLabel htmlFor={`${mode}-chamber-${reading.chamber}`}>
                        Chamber {reading.chamber} (°F)
                      </FieldLabel>
                      <Input
                        id={`${mode}-chamber-${reading.chamber}`}
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        placeholder="e.g. 32.5"
                        value={reading.value}
                        disabled={isSubmitting}
                        onChange={(event) => updateReading(index, event.target.value)}
                        className="h-10 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </Field>
                  </div>
                ))}
              </div>
            </FieldGroup>
          </div>

          <DialogFooter className="mt-4 border-t border-border pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === 'add'
                  ? 'Adding...'
                  : 'Updating...'
                : mode === 'add'
                  ? 'Add reading'
                  : 'Update record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

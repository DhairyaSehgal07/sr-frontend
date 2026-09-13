import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Thermometer,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerInput } from '@/components/date-picker';
import { Input } from '@/components/ui/input';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCreateTemperatureRecord } from '@/features/additional/api/use-create-temperature-record';
import { useTemperatureRecords } from '@/features/additional/api/use-temperature-records';
import { useUpdateTemperatureRecord } from '@/features/additional/api/use-update-temperature-record';
import { cn } from '@/lib/utils';
import {
  TemperatureReadingDialog,
  type TemperatureReadingDraft,
} from './temperature-reading-dialog.tsx';
import { TemperatureTrendChart, type TemperatureChartPoint } from './temperature-trend-chart.tsx';
import type {
  CreateTemperatureRecordBody,
  TemperatureRecord as ApiTemperatureRecord,
} from '@/features/additional/api/types';

type TemperatureReading = {
  chamber: string;
  value: number;
};

type TemperatureRecord = {
  id: string;
  date: string;
  readings: TemperatureReading[];
};

const UNIT = '°F';
const TEMP_MIN = -58;
const TEMP_MAX = 122;
const DEFAULT_CHAMBER_IDS = ['1', '2', '3', '4', '5', '6'] as const;

const INITIAL_PRESETS: Record<string, number> = {
  '1': 32,
  '2': 32,
  '3': 33,
  '4': 34,
  '5': 35,
  '6': 36,
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatTemperature(value: number) {
  return `${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}${UNIT}`;
}

function isSameCalendarDay(value: string, selectedDate: Date | undefined) {
  if (!selectedDate) return true;

  const date = new Date(value);
  return (
    date.getFullYear() === selectedDate.getFullYear() &&
    date.getMonth() === selectedDate.getMonth() &&
    date.getDate() === selectedDate.getDate()
  );
}

function getTemperatureStatus(value: number) {
  if (value >= 32 && value <= 33) {
    return {
      label: 'Ideal',
      className: 'bg-primary/10 text-primary ring-primary/20',
    };
  }

  if (value >= 34 && value <= 40) {
    return {
      label: 'Watch',
      className: 'bg-secondary text-secondary-foreground ring-border',
    };
  }

  if (value >= 41 && value <= 48) {
    return {
      label: 'Warm',
      className: 'bg-muted text-foreground ring-border',
    };
  }

  if (value > 48) {
    return {
      label: 'High',
      className: 'bg-destructive/10 text-destructive ring-destructive/20',
    };
  }

  return {
    label: 'Low',
    className: 'bg-background text-muted-foreground ring-border',
  };
}

function draftToCreateBody(draft: TemperatureReadingDraft): CreateTemperatureRecordBody {
  const [hours = '00', minutes = '00'] = draft.time.split(':');
  const date = new Date(draft.date);
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return {
    date: date.toISOString(),
    temperatureReading: draft.readings.map((reading) => ({
      chamber: `Chamber ${normalizeChamberLabel(reading.chamber)}`,
      value: Number(reading.value) || 0,
    })),
  };
}

function getRecordDraft(record: TemperatureRecord): TemperatureReadingDraft {
  const date = new Date(record.date);

  return {
    date,
    time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(
      2,
      '0',
    )}`,
    readings: record.readings.map((reading) => ({
      chamber: reading.chamber,
      value: String(reading.value),
    })),
  };
}

function TemperatureCell({
  value,
  preset,
}: {
  value: number | undefined;
  preset: number | undefined;
}) {
  if (value == null) {
    return <span className="text-muted-foreground">-</span>;
  }

  const status = getTemperatureStatus(value);
  const difference = preset == null ? null : value - preset;

  return (
    <div className="flex justify-end">
      <div
        className={cn(
          'inline-flex min-w-24 flex-col items-end rounded-xl px-2.5 py-1.5 text-right text-sm font-medium tabular-nums ring-1',
          status.className,
        )}
      >
        <span>{formatTemperature(value)}</span>
        <span className="text-xs font-normal opacity-85">
          {status.label}
          {difference != null ? ` ${difference >= 0 ? '+' : ''}${difference.toFixed(1)}` : ''}
        </span>
      </div>
    </div>
  );
}

function getLatestRecord(records: TemperatureRecord[]) {
  return [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
}

function normalizeChamberLabel(chamber: string) {
  const chamberNumber = chamber.match(/\d+/)?.[0];
  return chamberNumber ?? chamber.trim();
}

function toTemperatureRecord(record: ApiTemperatureRecord): TemperatureRecord {
  return {
    id: record._id,
    date: record.date,
    readings: record.temperatureReading.map((reading) => ({
      chamber: normalizeChamberLabel(reading.chamber),
      value: reading.value,
    })),
  };
}

function TemperaturePage() {
  const {
    data: temperatureRecords = [],
    error,
    isFetching,
    isLoading,
    refetch,
  } = useTemperatureRecords();
  const createTemperatureRecord = useCreateTemperatureRecord();
  const updateTemperatureRecord = useUpdateTemperatureRecord();
  const [presets, setPresets] = useState(INITIAL_PRESETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TemperatureRecord | null>(null);

  const records = useMemo(() => {
    const fetchedRecords = temperatureRecords.map(toTemperatureRecord);

    return fetchedRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [temperatureRecords]);

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return records.filter((record) => {
      if (!isSameCalendarDay(record.date, dateFilter)) return false;
      if (!query) return true;

      return (
        record.id.toLowerCase().includes(query) ||
        formatDateTime(record.date).toLowerCase().includes(query) ||
        record.readings.some(
          (reading) =>
            reading.chamber.toLowerCase().includes(query) || String(reading.value).includes(query),
        )
      );
    });
  }, [dateFilter, records, searchQuery]);

  const chartData = useMemo<TemperatureChartPoint[]>(() => {
    return [...filteredRecords]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((record) => ({
        label: new Intl.DateTimeFormat('en-IN', {
          day: '2-digit',
          month: 'short',
        }).format(new Date(record.date)),
        values: Object.fromEntries(
          record.readings.map((reading) => [reading.chamber, reading.value]),
        ),
      }));
  }, [filteredRecords]);

  const latestRecord = getLatestRecord(records);
  const latestAverage =
    latestRecord?.readings.reduce((total, reading) => total + reading.value, 0) /
    (latestRecord?.readings.length || 1);

  const handlePresetChange = (chamberId: string, value: string) => {
    setPresets((current) => {
      const next = { ...current };

      if (!value) {
        delete next[chamberId];
        return next;
      }

      next[chamberId] = Number(value);
      return next;
    });
  };

  const handleAddRecord = (draft: TemperatureReadingDraft) => {
    createTemperatureRecord.mutate(draftToCreateBody(draft), {
      onSuccess: (response) => {
        setAddDialogOpen(false);
        toast.success(response.message ?? 'Temperature record created', {
          position: 'bottom-right',
        });
      },
      onError: (mutationError) => {
        toast.error(mutationError.message, { position: 'bottom-right' });
      },
    });
  };

  const handleUpdateRecord = (draft: TemperatureReadingDraft) => {
    if (!editingRecord) return;

    updateTemperatureRecord.mutate(
      {
        id: editingRecord.id,
        body: draftToCreateBody(draft),
      },
      {
        onSuccess: (response) => {
          setEditingRecord(null);
          toast.success(response.message ?? 'Temperature record updated', {
            position: 'bottom-right',
          });
        },
        onError: (mutationError) => {
          toast.error(mutationError.message, { position: 'bottom-right' });
        },
      },
    );
  };

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Temperature
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor chamber readings, compare against preset targets, and review recent trends.
        </p>
      </div>

      <Item variant="outline" size="sm" className="rounded-xl bg-card shadow-sm">
        <ItemHeader className="flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <ItemMedia variant="icon" className="size-10 rounded-xl bg-primary/10 text-primary">
              <Thermometer className="size-5" aria-hidden="true" />
            </ItemMedia>
            <ItemContent className="min-w-0">
              <ItemTitle className="text-base font-semibold text-foreground">
                {isLoading
                  ? 'Loading records'
                  : `${filteredRecords.length.toLocaleString('en-IN')} ${
                      filteredRecords.length === 1 ? 'record' : 'records'
                    }`}
              </ItemTitle>
              <ItemDescription>
                {latestRecord ? (
                  <>
                    Latest average{' '}
                    <span className="font-medium tabular-nums text-foreground">
                      {formatTemperature(latestAverage || 0)}
                    </span>
                    {` on ${formatDateTime(latestRecord.date)}`}
                  </>
                ) : (
                  'No temperature records loaded yet.'
                )}
              </ItemDescription>
            </ItemContent>
          </div>

          <ItemActions className="justify-end">
            <Badge variant="secondary" className="gap-1.5">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
              {error ? 'API error' : isFetching ? 'Refreshing' : 'Live API'}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isFetching}
              onClick={() => void refetch()}
            >
              {isFetching ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="size-4" aria-hidden="true" />
              )}
              Refresh
            </Button>
          </ItemActions>
        </ItemHeader>
      </Item>

      <Card className="rounded-xl shadow-sm">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="font-heading text-base font-semibold text-foreground">
            Preset temperatures
          </CardTitle>
          <CardDescription>
            Set target values per chamber. Differences are shown beside every reading in the table.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {DEFAULT_CHAMBER_IDS.map((chamberId) => (
            <label key={chamberId} className="flex min-w-0 flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">Chamber {chamberId}</span>
              <Input
                type="number"
                inputMode="decimal"
                min={TEMP_MIN}
                max={TEMP_MAX}
                value={presets[chamberId] ?? ''}
                onChange={(event) => handlePresetChange(chamberId, event.target.value)}
                className="h-10 tabular-nums"
                aria-label={`Preset temperature for chamber ${chamberId}`}
              />
            </label>
          ))}
        </CardContent>
      </Card>

      <TemperatureTrendChart chamberIds={DEFAULT_CHAMBER_IDS} data={chartData} />

      <Card className="rounded-xl shadow-sm">
        <CardHeader className="border-b border-border/60">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 space-y-1">
              <CardTitle className="font-heading text-base font-semibold text-foreground">
                Temperature records
              </CardTitle>
              <CardDescription>
                Search by date, chamber number, reading value, or record ID.
              </CardDescription>
            </div>

            <Button
              type="button"
              className="h-10 w-full sm:w-fit"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add reading
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_18rem_auto] lg:items-end">
            <div className="relative min-w-0">
              <Search
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by date, chamber or value..."
                className="h-10 pl-10"
              />
            </div>

            <DatePickerInput
              id="temperature-date-filter"
              label="Search by date"
              value={dateFilter}
              onChange={setDateFilter}
            />

            {dateFilter ? (
              <Button
                type="button"
                variant="ghost"
                className="h-10 justify-start gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => setDateFilter(undefined)}
              >
                <X className="size-4" aria-hidden="true" />
                Clear
              </Button>
            ) : null}
          </div>

          {isLoading ? (
            <div className="relative w-full overflow-hidden rounded-lg border border-border">
              <div className="border-b border-border bg-muted/50 px-3 py-3">
                <div className="grid min-w-4xl grid-cols-8 gap-3">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={index} className="h-4" />
                  ))}
                </div>
              </div>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <div key={rowIndex} className="border-b border-border px-3 py-3 last:border-b-0">
                  <div className="grid min-w-4xl grid-cols-8 gap-3">
                    {Array.from({ length: 8 }).map((_, columnIndex) => (
                      <Skeleton key={columnIndex} className="h-8" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <div className="flex gap-2">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium">Failed to load temperature records.</p>
                  <p>{error.message}</p>
                </div>
              </div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm font-medium text-foreground">No temperature readings found.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing the search or date filter.
              </p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto rounded-lg border border-border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="sticky left-0 z-10 min-w-44 bg-muted/95">Date</TableHead>
                    {DEFAULT_CHAMBER_IDS.map((chamberId) => (
                      <TableHead
                        key={chamberId}
                        className="min-w-32 text-right text-muted-foreground"
                      >
                        Ch {chamberId}
                      </TableHead>
                    ))}
                    <TableHead className="w-16 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="sticky left-0 z-10 bg-card">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            {formatDateTime(record.date)}
                          </p>
                          <p className="font-mono text-xs tabular-nums text-muted-foreground">
                            {record.id}
                          </p>
                        </div>
                      </TableCell>
                      {DEFAULT_CHAMBER_IDS.map((chamberId) => {
                        const reading = record.readings.find((item) => item.chamber === chamberId);

                        return (
                          <TableCell key={chamberId} className="text-right">
                            <TemperatureCell value={reading?.value} preset={presets[chamberId]} />
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${record.id}`}
                          onClick={() => setEditingRecord(record)}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <TemperatureReadingDialog
        key={addDialogOpen ? 'add-open' : 'add-closed'}
        chamberIds={DEFAULT_CHAMBER_IDS}
        mode="add"
        open={addDialogOpen}
        isSubmitting={createTemperatureRecord.isPending}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddRecord}
      />

      <TemperatureReadingDialog
        key={editingRecord?.id ?? 'edit-closed'}
        chamberIds={DEFAULT_CHAMBER_IDS}
        initialDraft={editingRecord ? getRecordDraft(editingRecord) : undefined}
        mode="edit"
        open={editingRecord != null}
        isSubmitting={updateTemperatureRecord.isPending}
        onOpenChange={(open) => {
          if (!open) setEditingRecord(null);
        }}
        onSubmit={handleUpdateRecord}
      />
    </main>
  );
}
export default TemperaturePage;

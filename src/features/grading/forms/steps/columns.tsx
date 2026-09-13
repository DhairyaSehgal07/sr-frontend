import { type ColumnDef } from '@tanstack/react-table';

import type { GradingSelectIncomingGatePasses } from '../../types';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { GradingIncomingGatePassActionCell } from './grading-incoming-gate-pass-action-cell';
import { DataTableColumnHeader } from './data-table-column-header';
import {
  formatIncomingWeightKg,
  incomingNetWeightKg,
} from '@/features/grading/utils/incoming-net-weight';
import type { GradingFormTableFeatures } from './table-features';

const STATUS_LABELS: Record<string, string> = {
  NOT_GRADED: 'Not graded',
  GRADED: 'Graded',
};

function formatGatePassDate(iso: string) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatCount(value: number) {
  return new Intl.NumberFormat('en-IN').format(value);
}

function getStatusLabel(status: string) {
  return STATUS_LABELS[status] ?? status.replaceAll('_', ' ');
}

type GradingGatePassColumnOptions = {
  showActions?: boolean;
  gradingGatePassId?: string;
  farmerStorageLinkId?: string;
};

function createActionsColumn(
  options: Pick<GradingGatePassColumnOptions, 'gradingGatePassId' | 'farmerStorageLinkId'>,
): ColumnDef<GradingFormTableFeatures, GradingSelectIncomingGatePasses> {
  const { gradingGatePassId, farmerStorageLinkId } = options;

  return {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      if (!gradingGatePassId || !farmerStorageLinkId) return null;

      return (
        <GradingIncomingGatePassActionCell
          gradingGatePassId={gradingGatePassId}
          farmerStorageLinkId={farmerStorageLinkId}
          incomingGatePass={row.original}
        />
      );
    },
    enableSorting: false,
  };
}

const baseColumns: ColumnDef<GradingFormTableFeatures, GradingSelectIncomingGatePasses>[] = [
  {
    id: 'select',
    size: 48,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all on this page"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Select gate pass ${row.original.gatePassNo}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'manualGatePassNumber',
    filterFn: 'includesString',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Manual #" />,
    cell: ({ row }) => (
      <span className="tabular-nums text-sm font-medium text-foreground">
        {row.getValue<number>('manualGatePassNumber')}
      </span>
    ),
  },
  {
    accessorKey: 'date',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => (
      <span className="text-sm text-foreground">{formatGatePassDate(row.getValue('date'))}</span>
    ),
  },
  {
    accessorKey: 'variety',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Variety" />,
    cell: ({ row }) => (
      <span
        className="block max-w-40 truncate text-sm text-foreground"
        title={row.getValue<string>('variety')}
      >
        {row.getValue<string>('variety')}
      </span>
    ),
  },
  {
    accessorKey: 'truckNumber',
    header: 'Truck no.',
    cell: ({ row }) => (
      <span
        className="font-mono text-sm text-foreground tabular-nums"
        title={row.getValue<string>('truckNumber')}
      >
        {row.getValue<string>('truckNumber')}
      </span>
    ),
  },
  {
    accessorKey: 'bagsReceived',
    header: ({ column }) => (
      <div className="flex justify-end">
        <DataTableColumnHeader column={column} title="Bags" />
      </div>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums text-sm font-medium text-foreground">
        {formatCount(row.getValue<number>('bagsReceived'))}
      </span>
    ),
    meta: { align: 'right' },
  },
  {
    id: 'incomingNetWeightKg',
    accessorFn: (row) => incomingNetWeightKg(row) ?? Number.NEGATIVE_INFINITY,
    header: ({ column }) => (
      <div className="flex justify-end">
        <DataTableColumnHeader column={column} title="Incoming net wt" />
      </div>
    ),
    cell: ({ row }) => {
      const netWeightKg = incomingNetWeightKg(row.original);

      if (netWeightKg == null) {
        return <span className="text-sm text-muted-foreground">—</span>;
      }

      return (
        <span className="tabular-nums text-sm font-medium text-foreground">
          {formatIncomingWeightKg(netWeightKg)}
          <span className="ml-1 text-xs font-normal text-muted-foreground">kg</span>
        </span>
      );
    },
    meta: { align: 'right' },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue<string>('status');
      const isNotGraded = status === 'NOT_GRADED';
      return (
        <Badge
          variant={isNotGraded ? 'secondary' : 'default'}
          className={cn(
            'text-xs font-medium',
            isNotGraded &&
              'bg-amber-100 text-amber-900 hover:bg-amber-100/90 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-950/60',
          )}
        >
          {getStatusLabel(status)}
        </Badge>
      );
    },
    enableSorting: false,
  },
];

export function getGradingGatePassColumns(
  options?: GradingGatePassColumnOptions,
): ColumnDef<GradingFormTableFeatures, GradingSelectIncomingGatePasses>[] {
  if (options?.showActions) {
    return [
      ...baseColumns,
      createActionsColumn({
        gradingGatePassId: options.gradingGatePassId,
        farmerStorageLinkId: options.farmerStorageLinkId,
      }),
    ];
  }
  return baseColumns;
}

import { type ColumnDef } from '@tanstack/react-table';
import { Archive, MoreHorizontal, Pencil, RotateCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BillBook } from '@/features/settings/api/types';
import { BillBookColumnHeader } from './bill-book-column-header';
import type { BillBooksTableFeatures } from './table-features';

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
}

export type BillBookColumnActions = {
  onEdit: (billBook: BillBook) => void;
  onArchive: (billBook: BillBook) => void;
  onRestore: (billBook: BillBook) => void;
};

export function getBillBookColumns(
  actions: BillBookColumnActions,
): ColumnDef<BillBooksTableFeatures, BillBook>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <BillBookColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <span
          className="block min-w-0 truncate font-medium text-foreground"
          title={row.original.name}
        >
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => <BillBookColumnHeader column={column} title="Status" />,
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge className="bg-primary/10 text-primary">Active</Badge>
        ) : (
          <Badge variant="secondary">Archived</Badge>
        ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <BillBookColumnHeader column={column} title="Created" />,
      cell: ({ row }) => (
        <span className="tabular-nums text-sm text-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <BillBookColumnHeader column={column} title="Updated" />,
      cell: ({ row }) => (
        <span className="tabular-nums text-sm text-foreground">
          {formatDate(row.original.updatedAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      enableSorting: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const billBook = row.original;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  className="size-11"
                  aria-label={`Actions for ${billBook.name}`}
                >
                  <MoreHorizontal className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => actions.onEdit(billBook)}>
                  <Pencil />
                  Edit name
                </DropdownMenuItem>
                {billBook.isActive ? (
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => actions.onArchive(billBook)}
                  >
                    <Archive />
                    Archive
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => actions.onRestore(billBook)}>
                    <RotateCcw />
                    Restore
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}

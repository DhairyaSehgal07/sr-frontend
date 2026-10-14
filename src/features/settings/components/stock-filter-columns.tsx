import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { StockFilterOption } from '@/features/settings/api/stock-filter-types';

import { BillBookColumnHeader } from './bill-book-column-header';
import type { BillBooksTableFeatures } from './table-features';

export type StockFilterColumnActions = {
  onEdit: (stockFilter: StockFilterOption) => void;
  onDelete: (stockFilter: StockFilterOption) => void;
};

export function getStockFilterColumns(
  actions: StockFilterColumnActions,
): ColumnDef<BillBooksTableFeatures, StockFilterOption>[] {
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
      id: 'actions',
      enableSorting: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const stockFilter = row.original;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  className="size-11"
                  aria-label={`Actions for ${stockFilter.name}`}
                >
                  <MoreHorizontal className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => actions.onEdit(stockFilter)}>
                  <Pencil />
                  Edit name
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => actions.onDelete(stockFilter)}
                >
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}

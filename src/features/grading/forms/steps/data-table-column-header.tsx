import { type Column, type RowData } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { GradingFormTableFeatures } from './table-features';

interface DataTableColumnHeaderProps<TData extends RowData, TValue> {
  column: Column<GradingFormTableFeatures, TData, TValue>;
  title: string;
  className?: string;
}

export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <span className={cn('text-sm font-medium text-muted-foreground', className)}>{title}</span>
    );
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        '-ml-3 h-8 gap-1.5 font-medium text-muted-foreground hover:text-foreground',
        className,
      )}
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      {title}
      {sorted === 'desc' ? (
        <ArrowDown className="size-3.5 shrink-0" aria-hidden />
      ) : sorted === 'asc' ? (
        <ArrowUp className="size-3.5 shrink-0" aria-hidden />
      ) : (
        <ArrowUpDown className="size-3.5 shrink-0 opacity-60" aria-hidden />
      )}
    </Button>
  );
}

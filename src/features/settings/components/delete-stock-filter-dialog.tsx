import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
import type { StockFilterOption } from '@/features/settings/api/stock-filter-types';
import { useDeleteStockFilter } from '@/features/settings/api/use-delete-stock-filter';
import { stockFilterErrorMessage } from '@/features/settings/lib/stock-filter-error';

type DeleteStockFilterDialogProps = {
  stockFilter: StockFilterOption | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteStockFilterDialog({
  stockFilter,
  open,
  onOpenChange,
}: DeleteStockFilterDialogProps) {
  const { mutateAsync: deleteStockFilter, isPending } = useDeleteStockFilter();

  const handleDelete = async () => {
    if (!stockFilter) return;

    try {
      const { message } = await deleteStockFilter(stockFilter._id);
      toast.success(message ?? 'Stock filter deleted', { position: 'bottom-right' });
      onOpenChange(false);
    } catch (error) {
      toast.error(stockFilterErrorMessage(error, 'Failed to delete stock filter'), {
        position: 'bottom-right',
      });
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isPending) return;
        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader className="sm:text-left">
          <AlertDialogTitle>Delete {stockFilter?.name ?? 'this stock filter'}?</AlertDialogTitle>
          <AlertDialogDescription>
            Stock rows already using this name are left as they are.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep filter</AlertDialogCancel>
          <Button variant="destructive" disabled={isPending} onClick={() => void handleDelete()}>
            {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

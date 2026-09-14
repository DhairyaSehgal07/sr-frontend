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
import type { BillBook } from '@/features/settings/api/types';
import { useUpdateBillBook } from '@/features/settings/api/use-update-bill-book';

type ArchiveBillBookDialogProps = {
  billBook: BillBook | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ArchiveBillBookDialog({
  billBook,
  open,
  onOpenChange,
}: ArchiveBillBookDialogProps) {
  const { mutateAsync: updateBillBook, isPending } = useUpdateBillBook();

  const handleArchive = async () => {
    if (!billBook) return;

    try {
      const { message } = await updateBillBook({
        id: billBook._id,
        body: { isActive: false },
      });

      toast.success(message ?? 'Bill book archived', { position: 'bottom-right' });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to archive bill book', {
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
          <AlertDialogTitle>Archive {billBook?.name ?? 'this bill book'}?</AlertDialogTitle>
          <AlertDialogDescription>
            Archived bill books stay in the list and can be restored later. They are not deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep active</AlertDialogCancel>
          <Button variant="destructive" disabled={isPending} onClick={() => void handleArchive()}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Archive
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

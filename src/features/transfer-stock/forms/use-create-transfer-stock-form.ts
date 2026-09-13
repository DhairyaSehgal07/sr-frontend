import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { FarmerLinkOption } from '@/features/people/types';
import { formatTransferAccountLabel } from '@/features/people/utils/farmer-link-combobox';
import { storageGatePassesByFarmerQueryOptions } from '@/features/storage/api/use-storage-gate-passes-by-farmer';
import { useCreateTransferStock } from '@/features/transfer-stock/api/use-create-transfer-stock';
import { TRANSFER_STOCK_VOUCHER_TYPE } from '@/features/transfer-stock/api/voucher-type';
import {
  transferStockFormSchema,
  type TransferStockFormValues,
} from '@/features/transfer-stock/schemas/transfer-stock-form-schema';
import { buildTransferItems } from '@/features/transfer-stock/utils/gate-pass-matrix-utils';
import { toTransferStorageGatePass } from '@/features/transfer-stock/utils/to-transfer-storage-gate-pass';
import { defaultSubmitMeta, type TransferStockSubmitMeta } from '@/features/transfer-stock/types';
import { useGetReceiptVoucherNumber, voucherNumberKeys } from '@/hooks/use-get-voucher-number';

export type { TransferStockFormValues };

type UseCreateTransferStockFormOptions = {
  farmerLinkOptions: FarmerLinkOption[];
  onOpenReview?: () => void;
  onCloseReview?: () => void;
  onResetComboboxState?: () => void;
};

export function useCreateTransferStockForm(options: UseCreateTransferStockFormOptions) {
  const queryClient = useQueryClient();
  const todayIso = new Date().toISOString();
  const { mutateAsync: createTransferStock } = useCreateTransferStock();

  const {
    isLoading: isLoadingVoucherNumber,
    isError: isVoucherNumberError,
    data: nextTransferGatePassNo,
  } = useGetReceiptVoucherNumber(TRANSFER_STOCK_VOUCHER_TYPE);

  const isGatePassNumberReady =
    !isLoadingVoucherNumber && !isVoucherNumberError && nextTransferGatePassNo != null;

  const defaultValues: TransferStockFormValues = {
    manualGatePassNumber: undefined,
    fromFarmerStorageLinkId: '',
    toFarmerStorageLinkId: '',
    date: todayIso,
    category: '',
    truckNumber: '',
    remarks: '',
    allocations: {} as Record<string, number>,
  };

  const form = useForm({
    defaultValues,
    validators: {
      onChange: transferStockFormSchema,
      onSubmit: transferStockFormSchema,
    },
    onSubmitMeta: defaultSubmitMeta,
    onSubmit: async ({ value, meta }) => {
      const parsed = transferStockFormSchema.parse(value);

      if ((meta as TransferStockSubmitMeta).submitAction === 'review') {
        options.onOpenReview?.();
        return;
      }

      if (!isGatePassNumberReady) {
        toast.error(
          isLoadingVoucherNumber
            ? 'Loading gate pass number, please wait…'
            : 'Gate pass number unavailable. Refresh and try again.',
          { position: 'bottom-right' },
        );
        return;
      }

      const gatePassNo = queryClient.getQueryData<number>(
        voucherNumberKeys.detail(TRANSFER_STOCK_VOUCHER_TYPE),
      );

      if (gatePassNo == null) {
        toast.error('Gate pass number is unavailable. Refresh and try again.', {
          position: 'bottom-right',
        });
        return;
      }

      const fromOption = options.farmerLinkOptions.find(
        (option) => option.farmerStorageLinkId === parsed.fromFarmerStorageLinkId,
      );
      const toOption = options.farmerLinkOptions.find(
        (option) => option.farmerStorageLinkId === parsed.toFarmerStorageLinkId,
      );

      if (!fromOption || !toOption) {
        toast.error('Selected farmer accounts are invalid. Refresh and try again.', {
          position: 'bottom-right',
        });
        return;
      }

      const result = await queryClient.fetchQuery(
        storageGatePassesByFarmerQueryOptions(parsed.fromFarmerStorageLinkId),
      );
      const passes = result.storageGatePasses.map(toTransferStorageGatePass);
      const items = buildTransferItems(parsed.allocations, passes);

      try {
        const { message } = await createTransferStock({
          form: parsed,
          gatePassNo,
          fromLabel: formatTransferAccountLabel(fromOption),
          toLabel: formatTransferAccountLabel(toOption),
          items,
          passes,
        });

        toast.success(message ?? 'Transfer stock gate pass created.', {
          position: 'bottom-right',
        });
        options.onCloseReview?.();
        form.reset({
          ...defaultValues,
          date: new Date().toISOString(),
        });
        options.onResetComboboxState?.();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to create transfer stock gate pass',
          { position: 'bottom-right' },
        );
      }
    },
  });

  return {
    form,
    nextTransferGatePassNo,
    isLoadingVoucherNumbers: isLoadingVoucherNumber,
    isVoucherNumbersError: isVoucherNumberError,
    isGatePassNumbersReady: isGatePassNumberReady,
  };
}

export type CreateTransferStockFormApi = ReturnType<typeof useCreateTransferStockForm>['form'];

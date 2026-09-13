import { useForm } from '@tanstack/react-form';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import {
  createDefaultStorageQuantities,
  storageFormSchema,
  type StorageFormValues,
} from '@/features/storage/schemas/storage-form-schema';
import { defaultSubmitMeta, type StorageSubmitMeta } from '@/features/storage/types';

export type { StorageFormValues };

type UseCreateStorageFormOptions = {
  defaultValues?: StorageFormValues;
  onOpenReview?: () => void;
  onCreate?: (values: StorageFormValues) => Promise<void>;
};

export function useCreateStorageForm(options: UseCreateStorageFormOptions = {}) {
  const userId = useAuthStore((s) => s.user?._id ?? '');
  const todayIso = new Date().toISOString();

  return useForm({
    defaultValues: options.defaultValues ?? {
      manualGatePassNumber: undefined as number | undefined,
      farmerStorageLinkId: '',
      createdBy: userId,
      variety: '',
      category: '',
      stage: '',
      date: todayIso,
      quantities: createDefaultStorageQuantities(),
      remarks: '',
    },
    validators: {
      onChange: storageFormSchema,
      onSubmit: storageFormSchema,
    },
    onSubmitMeta: defaultSubmitMeta,
    onSubmit: async ({ value, meta }) => {
      const parsed = storageFormSchema.parse(value);

      if ((meta as StorageSubmitMeta).submitAction === 'review') {
        options.onOpenReview?.();
        return;
      }

      await options.onCreate?.(parsed);
    },
  });
}

export type CreateStorageFormApi = ReturnType<typeof useCreateStorageForm>;

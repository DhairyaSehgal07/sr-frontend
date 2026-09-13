import { useMutation } from '@tanstack/react-query';
import { createTemperatureRecord } from './create-temperature-record';
import { temperatureKeys } from './query-keys';
import type { CreateTemperatureRecordBody } from './types';
import { queryClient } from '@/lib/queryClient';

export function useCreateTemperatureRecord() {
  return useMutation({
    mutationKey: temperatureKeys.create(),
    mutationFn: (body: CreateTemperatureRecordBody) => createTemperatureRecord(body),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: temperatureKeys.lists(),
      });
    },
  });
}

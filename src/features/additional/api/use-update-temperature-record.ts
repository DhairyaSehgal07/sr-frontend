import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { temperatureKeys } from './query-keys';
import type { UpdateTemperatureRecordInput } from './types';
import { updateTemperatureRecord } from './update-temperature-record';

export function useUpdateTemperatureRecord() {
  return useMutation({
    mutationKey: temperatureKeys.update(),
    mutationFn: (input: UpdateTemperatureRecordInput) => updateTemperatureRecord(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: temperatureKeys.lists(),
      });
    },
  });
}

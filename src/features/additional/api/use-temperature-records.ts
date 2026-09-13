import { queryOptions, useQuery } from '@tanstack/react-query';
import { getTemperatureRecords } from './get-temperature-records';
import { temperatureKeys } from './query-keys';

export function temperatureRecordsQueryOptions() {
  return queryOptions({
    queryKey: temperatureKeys.list(),
    queryFn: getTemperatureRecords,
  });
}

export function useTemperatureRecords() {
  return useQuery({
    ...temperatureRecordsQueryOptions(),
  });
}

import { queryOptions, type UseQueryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { daybookKeys } from '@/features/daybook/api/query-keys';
import { queryClient } from '@/lib/queryClient';
import { outgoingGatePassKeys } from './query-keys';
import {
  createShedBifurcation,
  deleteShedBifurcation,
  getShedBifurcations,
} from './shed-bifurcation';
import type {
  CreateShedBifurcationInput,
  DeleteShedBifurcationInput,
  ShedBifurcationRecord,
} from './types';

function invalidateShedBifurcationViews(outgoingGatePassId: string) {
  void queryClient.invalidateQueries({
    queryKey: outgoingGatePassKeys.lists(),
  });
  void queryClient.invalidateQueries({
    queryKey: daybookKeys.lists(),
  });
  void queryClient.invalidateQueries({
    queryKey: outgoingGatePassKeys.shedSummary(),
  });
  void queryClient.invalidateQueries({
    queryKey: outgoingGatePassKeys.bifurcations(outgoingGatePassId),
  });
}

export function shedBifurcationsQueryOptions(outgoingGatePassId: string) {
  return queryOptions({
    queryKey: outgoingGatePassKeys.bifurcations(outgoingGatePassId),
    queryFn: () => getShedBifurcations(outgoingGatePassId),
  });
}

type UseShedBifurcationsOptions = Omit<
  UseQueryOptions<
    ShedBifurcationRecord[],
    Error,
    ShedBifurcationRecord[],
    ReturnType<typeof outgoingGatePassKeys.bifurcations>
  >,
  'queryKey' | 'queryFn'
>;

export function useShedBifurcations(
  outgoingGatePassId: string,
  options?: UseShedBifurcationsOptions,
) {
  return useQuery({
    ...shedBifurcationsQueryOptions(outgoingGatePassId),
    ...options,
  });
}

export function useCreateShedBifurcation() {
  return useMutation({
    mutationKey: outgoingGatePassKeys.createBifurcation(),
    mutationFn: (input: CreateShedBifurcationInput) => createShedBifurcation(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: (_data, input) => {
      invalidateShedBifurcationViews(input.id);
    },
  });
}

export function useDeleteShedBifurcation() {
  return useMutation({
    mutationKey: outgoingGatePassKeys.deleteBifurcation(),
    mutationFn: (input: DeleteShedBifurcationInput) => deleteShedBifurcation(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: (_data, input) => {
      invalidateShedBifurcationViews(input.id);
    },
  });
}

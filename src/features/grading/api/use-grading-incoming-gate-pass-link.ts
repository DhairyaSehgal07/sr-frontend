import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { delinkIncomingFromGradingGatePass } from '@/features/grading/api/delink-incoming-from-grading-gate-pass';
import { linkIncomingToGradingGatePass } from '@/features/grading/api/link-incoming-to-grading-gate-pass';
import { gradingGatePassKeys } from '@/features/grading/api/query-keys';
import { gradingGatePassByIdQueryOptions } from '@/features/grading/api/use-grading-gate-pass-by-id';
import type { GradingIncomingGatePassLinkInput } from '@/features/grading/api/types';
import type { IncomingGatePassesByFarmerParams } from '@/features/incoming/api/types';
import { incomingGatePassesByFarmerQueryOptions } from '@/features/incoming/api/use-incoming-gate-passes-by-farmer';
import { queryClient } from '@/lib/queryClient';

const INCOMING_GATE_PASSES_BY_FARMER_PARAMS: IncomingGatePassesByFarmerParams = {
  sortOrder: 'desc',
  status: 'ungraded',
};

type UseGradingIncomingGatePassLinkOptions = {
  gradingGatePassId: string;
  farmerStorageLinkId: string;
};

async function refetchAfterLinkChange(gradingGatePassId: string, farmerStorageLinkId: string) {
  const refetches: Promise<unknown>[] = [
    queryClient.refetchQueries({
      queryKey: gradingGatePassByIdQueryOptions(gradingGatePassId).queryKey,
      type: 'active',
    }),
  ];

  if (farmerStorageLinkId.trim()) {
    refetches.push(
      queryClient.refetchQueries({
        queryKey: incomingGatePassesByFarmerQueryOptions(
          farmerStorageLinkId,
          INCOMING_GATE_PASSES_BY_FARMER_PARAMS,
        ).queryKey,
        type: 'active',
      }),
    );
  }

  await Promise.all(refetches);
}

export function useGradingIncomingGatePassLink({
  gradingGatePassId,
  farmerStorageLinkId,
}: UseGradingIncomingGatePassLinkOptions) {
  const linkMutation = useMutation({
    mutationKey: gradingGatePassKeys.linkIncoming(gradingGatePassId),
    mutationFn: (input: GradingIncomingGatePassLinkInput) => linkIncomingToGradingGatePass(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: (data) => {
      toast.success(data.message ?? 'Incoming gate pass linked', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to link incoming gate pass', {
        position: 'bottom-right',
      });
    },
    onSettled: async () => {
      await refetchAfterLinkChange(gradingGatePassId, farmerStorageLinkId);
    },
  });

  const delinkMutation = useMutation({
    mutationKey: gradingGatePassKeys.delinkIncoming(gradingGatePassId),
    mutationFn: (input: GradingIncomingGatePassLinkInput) =>
      delinkIncomingFromGradingGatePass(input),
    retry: false,
    meta: { suppressGlobalError: true },
    onSuccess: (data) => {
      toast.success(data.message ?? 'Incoming gate pass delinked', {
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delink incoming gate pass', {
        position: 'bottom-right',
      });
    },
    onSettled: async () => {
      await refetchAfterLinkChange(gradingGatePassId, farmerStorageLinkId);
    },
  });

  const isRowPending = (incomingGatePassId: string) =>
    (linkMutation.isPending && linkMutation.variables?.incomingGatePassId === incomingGatePassId) ||
    (delinkMutation.isPending &&
      delinkMutation.variables?.incomingGatePassId === incomingGatePassId);

  return {
    link: linkMutation.mutateAsync,
    delink: delinkMutation.mutateAsync,
    isRowPending,
    isPending: linkMutation.isPending || delinkMutation.isPending,
  };
}

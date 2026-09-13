import { queryOptions, useQuery } from '@tanstack/react-query';

import { getFarmerStorageLinkGatePasses } from './get-farmer-storage-link-gate-passes';
import { peopleQueryKeys } from './query-keys';

export function farmerStorageLinkGatePassesQueryOptions(farmerStorageLinkId: string) {
  return queryOptions({
    queryKey: peopleQueryKeys.farmerStorageLinkGatePasses(farmerStorageLinkId),
    queryFn: () => getFarmerStorageLinkGatePasses(farmerStorageLinkId),
    enabled: farmerStorageLinkId.length > 0,
  });
}

export function useFarmerStorageLinkGatePasses(farmerStorageLinkId: string) {
  return useQuery(farmerStorageLinkGatePassesQueryOptions(farmerStorageLinkId));
}

import { queryOptions, useQuery } from '@tanstack/react-query';

import { getFarmerStorageLinks } from './get-farmer-storage-links';
import { peopleQueryKeys } from './query-keys';

export function farmerStorageLinksQueryOptions() {
  return queryOptions({
    queryKey: peopleQueryKeys.farmerStorageLinks(),
    queryFn: getFarmerStorageLinks,
  });
}

export function useFarmerStorageLinks() {
  return useQuery(farmerStorageLinksQueryOptions());
}

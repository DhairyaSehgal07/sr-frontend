import { useQuery } from '@tanstack/react-query';

import type { FarmerLinkOption, FarmerStorageLink } from '../types';
import { farmerStorageLinksQueryOptions } from './use-farmer-storage-links';

function selectFarmerLinkOptions(links: FarmerStorageLink[]): FarmerLinkOption[] {
  return links.map((link) => ({
    farmerStorageLinkId: link._id,
    name: link.farmerId.name,
    accountNumber: link.accountNumber,
  }));
}

export function useFarmerLinkOptions() {
  return useQuery({
    ...farmerStorageLinksQueryOptions(),
    select: selectFarmerLinkOptions,
  });
}

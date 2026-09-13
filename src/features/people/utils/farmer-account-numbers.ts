import type { FarmerStorageLink } from '../types';

export function getUsedAccountNumbers(links: FarmerStorageLink[]): number[] {
  return [...new Set(links.map((link) => link.accountNumber))].sort((a, b) => a - b);
}

export function getUsedMobileNumbers(links: FarmerStorageLink[]): string[] {
  return [...new Set(links.map((link) => link.farmerId.mobileNumber))].sort();
}

export function getNextAccountNumber(usedAccountNumbers: number[]): number {
  if (usedAccountNumbers.length === 0) return 1;
  const latest = usedAccountNumbers[usedAccountNumbers.length - 1];
  return latest + 1;
}

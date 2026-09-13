import type { ComboboxOption } from '@/components/searchable-option-combobox';

import type { FarmerLinkOption } from '../types';

export function formatFarmerLinkLabel(option: FarmerLinkOption): string {
  return `${option.name} (Account #${option.accountNumber})`;
}

export function farmerLinkOptionsToComboboxOptions(options: FarmerLinkOption[]): ComboboxOption[] {
  return options.map((option) => ({
    id: option.farmerStorageLinkId,
    label: formatFarmerLinkLabel(option),
    name: option.name,
    accountNumber: option.accountNumber,
  }));
}

export function getFarmerLinkLabel(
  farmerStorageLinkId: string,
  options: readonly FarmerLinkOption[],
): string {
  const match = options.find((option) => option.farmerStorageLinkId === farmerStorageLinkId);

  return match ? formatFarmerLinkLabel(match) : farmerStorageLinkId;
}

export function formatTransferAccountLabel(option: FarmerLinkOption): string {
  return `Account ${option.accountNumber} - ${option.name}`;
}

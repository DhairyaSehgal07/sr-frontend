import { useCallback, useMemo, useState } from 'react';
import type {
  DatePassGroup,
  LocationFilters,
  StorageGatePass,
  VoucherSort,
} from '@/features/transfer-stock/types/storage-gate-pass';
import {
  buildAllocationsFromPass,
  filterStorageGatePasses,
  getUniqueLocationValues,
  getUniqueSizes,
  getUniqueVarieties,
  groupPassesByDate,
  parseAllocationKey,
} from '@/features/transfer-stock/utils/gate-pass-matrix-utils';

/** `'all'` shows every size column; otherwise only sizes in the set. */
export type SizeVisibility = 'all' | Set<string>;

function isSizeVisible(visibility: SizeVisibility, size: string): boolean {
  return visibility === 'all' || visibility.has(size);
}

function resolveVisibleSizes(tableSizes: string[], visibility: SizeVisibility): string[] {
  if (visibility === 'all') return tableSizes;
  return tableSizes.filter((size) => visibility.has(size));
}

type UseTransferGatePassMatrixOptions = {
  allPasses: StorageGatePass[];
  allocations: Record<string, number>;
  onAllocationsChange: (next: Record<string, number>) => void;
};

export function useTransferGatePassMatrix({
  allPasses,
  allocations,
  onAllocationsChange,
}: UseTransferGatePassMatrixOptions) {
  const [voucherSort, setVoucherSort] = useState<VoucherSort>('asc');
  const [varietyFilter, setVarietyFilter] = useState('');
  const [sizeVisibility, setSizeVisibility] = useState<SizeVisibility>('all');
  const [selectedPassIds, setSelectedPassIds] = useState<Set<string>>(() => new Set());
  const [locationFilters, setLocationFilters] = useState<LocationFilters>({
    chamber: '',
    floor: '',
    row: '',
  });
  const [gatePassSearch, setGatePassSearch] = useState('');

  const uniqueVarieties = useMemo(() => getUniqueVarieties(allPasses), [allPasses]);

  const uniqueLocations = useMemo(() => getUniqueLocationValues(allPasses), [allPasses]);

  const filteredPasses = useMemo(
    () =>
      filterStorageGatePasses(allPasses, {
        variety: varietyFilter,
        search: gatePassSearch,
        location: locationFilters,
      }),
    [allPasses, varietyFilter, gatePassSearch, locationFilters],
  );

  const tableSizes = useMemo(() => getUniqueSizes(filteredPasses), [filteredPasses]);

  const allTableSizes = useMemo(() => getUniqueSizes(allPasses), [allPasses]);

  const visibleSizes = useMemo(
    () => resolveVisibleSizes(tableSizes, sizeVisibility),
    [tableSizes, sizeVisibility],
  );

  const displayGroups: DatePassGroup[] = useMemo(
    () => groupPassesByDate(filteredPasses, voucherSort),
    [filteredPasses, voucherSort],
  );

  const needsVarietySelection = uniqueVarieties.length > 0 && varietyFilter.trim() === '';

  const varietySelected = !needsVarietySelection;
  const hasFilteredData = varietySelected && filteredPasses.length > 0 && visibleSizes.length > 0;

  const hasActiveFilters =
    varietyFilter.trim() !== '' ||
    gatePassSearch.trim() !== '' ||
    locationFilters.chamber !== '' ||
    locationFilters.floor !== '' ||
    locationFilters.row !== '';

  const sizesForColumnPicker = tableSizes.length > 0 ? tableSizes : allTableSizes;

  const handleSelectAllSizes = useCallback(() => {
    setSizeVisibility('all');
  }, []);

  const handleSizeToggle = useCallback(
    (size: string) => {
      setSizeVisibility((prev) => {
        const pickerSizes = tableSizes.length > 0 ? tableSizes : allTableSizes;

        if (prev === 'all') {
          const next = new Set(pickerSizes);
          next.delete(size);
          return next;
        }

        const next = new Set(prev);
        if (next.has(size)) next.delete(size);
        else next.add(size);

        if (pickerSizes.length > 0 && pickerSizes.every((s) => next.has(s))) {
          return 'all';
        }
        return next;
      });
    },
    [tableSizes, allTableSizes],
  );

  const handleResetFilters = useCallback(() => {
    setVoucherSort('asc');
    setVarietyFilter('');
    setGatePassSearch('');
    setLocationFilters({ chamber: '', floor: '', row: '' });
    setSizeVisibility('all');
    setSelectedPassIds(new Set());
    onAllocationsChange({});
  }, [onAllocationsChange]);

  const handleAllocationChange = useCallback(
    (key: string, quantity: number) => {
      onAllocationsChange({ ...allocations, [key]: quantity });
    },
    [allocations, onAllocationsChange],
  );

  const handleAllocationClear = useCallback(
    (key: string) => {
      const next = { ...allocations };
      delete next[key];
      onAllocationsChange(next);
    },
    [allocations, onAllocationsChange],
  );

  const handlePassToggle = useCallback(
    (passId: string) => {
      const isSelecting = !selectedPassIds.has(passId);

      setSelectedPassIds((prev) => {
        const next = new Set(prev);
        if (isSelecting) next.add(passId);
        else next.delete(passId);
        return next;
      });

      if (isSelecting) {
        const pass = filteredPasses.find((p) => p._id === passId);
        if (pass) {
          onAllocationsChange({
            ...allocations,
            ...buildAllocationsFromPass(pass, visibleSizes),
          });
        }
      } else {
        const next = { ...allocations };
        for (const key of Object.keys(next)) {
          const parsed = parseAllocationKey(key);
          if (parsed?.passId === passId) delete next[key];
        }
        onAllocationsChange(next);
      }
    },
    [selectedPassIds, filteredPasses, visibleSizes, allocations, onAllocationsChange],
  );

  return {
    displayGroups,
    visibleSizes,
    uniqueVarieties,
    uniqueLocations,
    hasFilteredData,
    hasActiveFilters,
    needsVarietySelection,
    voucherSort,
    setVoucherSort,
    varietyFilter,
    setVarietyFilter,
    gatePassSearch,
    setGatePassSearch,
    locationFilters,
    setLocationFilters,
    sizeVisibility,
    setSizeVisibility,
    selectedPassIds,
    sizesForColumnPicker,
    isSizeVisible,
    handleSelectAllSizes,
    handleSizeToggle,
    handleResetFilters,
    handleAllocationChange,
    handleAllocationClear,
    handlePassToggle,
  };
}

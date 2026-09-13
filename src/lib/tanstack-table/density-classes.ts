import type { DensityState } from '@/lib/tanstack-table/density-feature';

const DENSITY_HEAD_CLASSES: Record<DensityState, string> = {
  sm: 'h-9 px-2 py-1',
  md: 'h-10 px-3 py-2',
  lg: 'h-12 px-4 py-4',
};

const DENSITY_CELL_CLASSES: Record<DensityState, string> = {
  sm: 'px-2 py-1.5',
  md: 'px-3 py-2.5',
  lg: 'px-4 py-4',
};

export function getDensityHeadClasses(density: DensityState): string {
  return DENSITY_HEAD_CLASSES[density];
}

export function getDensityCellClasses(density: DensityState): string {
  return DENSITY_CELL_CLASSES[density];
}

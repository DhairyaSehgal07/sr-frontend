import { getAnalyticsChartColor } from './chart-palette';

import type { LocationWiseStorageTree } from '../types/location-wise-storage';

export function collectVarietiesFromTree(tree: LocationWiseStorageTree): string[] {
  const names = new Set<string>();

  for (const chamber of tree.chambers) {
    for (const item of chamber.varietySummary) {
      names.add(item.variety);
    }
  }

  return [...names].sort((left, right) =>
    left.localeCompare(right, 'en-IN', { sensitivity: 'base' }),
  );
}

export function buildVarietyColorMap(varieties: string[]): Map<string, string> {
  const map = new Map<string, string>();

  for (const [index, variety] of varieties.entries()) {
    map.set(variety, getAnalyticsChartColor(index));
  }

  return map;
}

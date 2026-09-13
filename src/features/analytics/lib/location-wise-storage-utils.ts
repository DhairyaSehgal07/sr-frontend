import type { StorageGatePass } from '@/features/storage/api/types';

import type {
  LocationWiseChamberNode,
  LocationWiseFarmerEntry,
  LocationWiseFloorNode,
  LocationWiseRowNode,
  LocationWiseStorageTree,
  LocationWiseVarietyNode,
  LocationWiseVarietySummaryItem,
} from '../types/location-wise-storage';

type QuantityTotals = {
  totalCurrentQuantity: number;
  totalInitialQuantity: number;
};

function emptyTotals(): QuantityTotals {
  return { totalCurrentQuantity: 0, totalInitialQuantity: 0 };
}

function addEntryTotals(
  totals: QuantityTotals,
  entry: Pick<LocationWiseFarmerEntry, 'currentQuantity' | 'initialQuantity'>,
): QuantityTotals {
  return {
    totalCurrentQuantity: totals.totalCurrentQuantity + entry.currentQuantity,
    totalInitialQuantity: totals.totalInitialQuantity + entry.initialQuantity,
  };
}

function mergeTotals(totals: QuantityTotals, node: QuantityTotals): QuantityTotals {
  return {
    totalCurrentQuantity: totals.totalCurrentQuantity + node.totalCurrentQuantity,
    totalInitialQuantity: totals.totalInitialQuantity + node.totalInitialQuantity,
  };
}

function sumEntryTotals(entries: LocationWiseFarmerEntry[]): QuantityTotals {
  return entries.reduce(addEntryTotals, emptyTotals());
}

export function compareLocationKeys(a: string, b: string): number {
  const na = Number(a);
  const nb = Number(b);
  const aIsNumeric = a !== '' && !Number.isNaN(na) && String(na) === a;
  const bIsNumeric = b !== '' && !Number.isNaN(nb) && String(nb) === b;

  if (aIsNumeric && bIsNumeric) return na - nb;
  if (aIsNumeric) return -1;
  if (bIsNumeric) return 1;

  return a.localeCompare(b, 'en-IN', {
    numeric: true,
    sensitivity: 'base',
  });
}

function sortByKey<T extends { [K in Key]: string }, Key extends string>(
  items: T[],
  key: Key,
): T[] {
  return [...items].sort((left, right) => compareLocationKeys(left[key], right[key]));
}

function buildVarietySummary(
  sources: Pick<
    LocationWiseVarietyNode,
    'variety' | 'totalCurrentQuantity' | 'totalInitialQuantity'
  >[],
): LocationWiseVarietySummaryItem[] {
  const totalsByVariety = new Map<string, { currentQuantity: number; initialQuantity: number }>();

  for (const source of sources) {
    const existing = totalsByVariety.get(source.variety) ?? {
      currentQuantity: 0,
      initialQuantity: 0,
    };

    totalsByVariety.set(source.variety, {
      currentQuantity: existing.currentQuantity + source.totalCurrentQuantity,
      initialQuantity: existing.initialQuantity + source.totalInitialQuantity,
    });
  }

  return [...totalsByVariety.entries()]
    .map(([variety, totals]) => ({
      variety,
      ...totals,
    }))
    .sort((left, right) => {
      const byQuantity = right.currentQuantity - left.currentQuantity;
      if (byQuantity !== 0) return byQuantity;

      return left.variety.localeCompare(right.variety, 'en-IN', {
        sensitivity: 'base',
      });
    });
}

function toVarietyNodes(varieties: Map<string, LocationWiseFarmerEntry[]>) {
  const nodes: LocationWiseVarietyNode[] = [];

  for (const [variety, entries] of varieties) {
    const sortedEntries = [...entries].sort((left, right) => {
      const byFarmer = left.farmerName.localeCompare(right.farmerName, 'en-IN', {
        sensitivity: 'base',
      });
      if (byFarmer !== 0) return byFarmer;

      const bySize = left.bagSize.localeCompare(right.bagSize, 'en-IN', {
        numeric: true,
        sensitivity: 'base',
      });
      if (bySize !== 0) return bySize;

      return left.gatePassNo - right.gatePassNo;
    });

    nodes.push({
      variety,
      entries: sortedEntries,
      ...sumEntryTotals(sortedEntries),
    });
  }

  return sortByKey(nodes, 'variety');
}

function toRowNodes(rows: Map<string, Map<string, LocationWiseFarmerEntry[]>>) {
  const nodes: LocationWiseRowNode[] = [];

  for (const [row, varieties] of rows) {
    const varietyNodes = toVarietyNodes(varieties);
    const totals = varietyNodes.reduce(mergeTotals, emptyTotals());

    const varietySummary = buildVarietySummary(varietyNodes);

    nodes.push({
      row,
      varieties: varietyNodes,
      varietySummary,
      varietyCount: varietySummary.length,
      ...totals,
    });
  }

  return sortByKey(nodes, 'row');
}

function toFloorNodes(floors: Map<string, Map<string, Map<string, LocationWiseFarmerEntry[]>>>) {
  const nodes: LocationWiseFloorNode[] = [];

  for (const [floor, rows] of floors) {
    const rowNodes = toRowNodes(rows);
    const totals = rowNodes.reduce(mergeTotals, emptyTotals());

    const varietySummary = buildVarietySummary(rowNodes.flatMap((row) => row.varieties));

    nodes.push({
      floor,
      rows: rowNodes,
      varietySummary,
      varietyCount: varietySummary.length,
      ...totals,
    });
  }

  return sortByKey(nodes, 'floor');
}

function toChamberNodes(
  chambers: Map<string, Map<string, Map<string, Map<string, LocationWiseFarmerEntry[]>>>>,
) {
  const nodes: LocationWiseChamberNode[] = [];

  for (const [chamber, floors] of chambers) {
    const floorNodes = toFloorNodes(floors);
    const totals = floorNodes.reduce(mergeTotals, emptyTotals());

    const varietySummary = buildVarietySummary(
      floorNodes.flatMap((floor) => floor.rows.flatMap((row) => row.varieties)),
    );

    nodes.push({
      chamber,
      floors: floorNodes,
      varietySummary,
      varietyCount: varietySummary.length,
      ...totals,
    });
  }

  return sortByKey(nodes, 'chamber');
}

export function buildLocationWiseStorageTree(
  storageGatePasses: StorageGatePass[],
): LocationWiseStorageTree {
  const chambers = new Map<
    string,
    Map<string, Map<string, Map<string, LocationWiseFarmerEntry[]>>>
  >();

  for (const pass of storageGatePasses) {
    const variety = pass.variety?.trim() || '—';
    const farmer = pass.farmerStorageLinkId.farmerId;
    const farmerName = farmer.name?.trim() || '—';
    const farmerAccountNumber = pass.farmerStorageLinkId.accountNumber ?? '—';

    for (const bag of pass.bagSizes) {
      const chamber = bag.chamber?.trim() || '—';
      const floor = bag.floor?.trim() || '—';
      const row = bag.row?.trim() || '—';

      const entry: LocationWiseFarmerEntry = {
        gatePassId: pass._id,
        gatePassNo: pass.gatePassNo,
        farmerName,
        farmerAccountNumber,
        bagSize: bag.size?.trim() || '—',
        bagType: String(bag.bagType ?? '—'),
        currentQuantity: bag.currentQuantity,
        initialQuantity: bag.initialQuantity,
      };

      let floorMap = chambers.get(chamber);
      if (!floorMap) {
        floorMap = new Map();
        chambers.set(chamber, floorMap);
      }

      let rowMap = floorMap.get(floor);
      if (!rowMap) {
        rowMap = new Map();
        floorMap.set(floor, rowMap);
      }

      let varietyMap = rowMap.get(row);
      if (!varietyMap) {
        varietyMap = new Map();
        rowMap.set(row, varietyMap);
      }

      const entries = varietyMap.get(variety);
      if (entries) {
        entries.push(entry);
      } else {
        varietyMap.set(variety, [entry]);
      }
    }
  }

  const chamberNodes = toChamberNodes(chambers);
  const totals = chamberNodes.reduce(mergeTotals, emptyTotals());

  return {
    chambers: chamberNodes,
    ...totals,
  };
}

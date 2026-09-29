import type { DaybookOutgoingEntry } from '@/features/daybook/api/types';
import type {
  NikasiGatePass,
  NikasiGatePassBagSizeItem,
} from '@/features/dispatch-pre-storage/api/types';

function trimmed(value: string | undefined): string {
  return value?.trim() ?? '';
}

function optionalTrimmed(value: string | undefined): string | undefined {
  const next = trimmed(value);
  return next.length > 0 ? next : undefined;
}

function numericBook(value: string | number | undefined): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return undefined;
  const parsed = Number(value.trim());
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function bagLines(entry: DaybookOutgoingEntry): NikasiGatePassBagSizeItem[] {
  const quantities = new Map<string, number>();
  const order: string[] = [];

  for (const row of entry.orderDetails) {
    const size = row.size.trim();
    if (!size) continue;
    if (!quantities.has(size)) order.push(size);
    quantities.set(size, (quantities.get(size) ?? 0) + row.quantityIssued);
  }

  const cost =
    entry.costPerBag != null && Number.isFinite(entry.costPerBag) && entry.costPerBag > 0
      ? entry.costPerBag
      : undefined;

  return order.map((size) => ({
    size,
    variety: entry.variety,
    quantityIssued: quantities.get(size) ?? 0,
    ...(cost != null ? { costPerBag: cost } : {}),
  }));
}

/** Net kg from issued bags × average bag weight. Non-finite when no weights were recorded. */
function netWeightKg(entry: DaybookOutgoingEntry): number {
  let total = 0;
  let counted = false;

  for (const row of entry.orderDetails) {
    if (row.weightInKg == null || !Number.isFinite(row.weightInKg)) continue;
    total += row.quantityIssued * row.weightInKg;
    counted = true;
  }

  return counted ? total : Number.NaN;
}

export function outgoingEntryToNikasiPrintModel(entry: DaybookOutgoingEntry): NikasiGatePass {
  const to = trimmed(entry.to);
  const netWeight = netWeightKg(entry);
  const bags = entry.orderDetails.reduce((sum, row) => sum + row.quantityIssued, 0);
  const biltiBook = numericBook(entry.biltiBook);

  return {
    _id: entry._id,
    gatePassNo: entry.gatePassNo,
    manualGatePassNumber: entry.manualGatePassNumber,
    date: entry.date,
    category: trimmed(entry.category),
    isBooked: false,
    from: trimmed(entry.from),
    to,
    truckNumber: trimmed(entry.truckNumber),
    transportCompany: optionalTrimmed(entry.transportCompany),
    LSNumber: optionalTrimmed(entry.LSNumber),
    driverName: optionalTrimmed(entry.driverName),
    driverMobile: optionalTrimmed(entry.driverMobile),
    owner: optionalTrimmed(entry.owner),
    billNumber: entry.billNumber,
    bitliNumber: entry.biltiNumber,
    billBook: entry.billBook,
    ...(biltiBook != null ? { biltiBook } : {}),
    bagSize: bagLines(entry),
    netWeight,
    averageWeightPerBag: Number.isFinite(netWeight) && bags > 0 ? netWeight / bags : Number.NaN,
    remarks: optionalTrimmed(entry.remarks),
    dispatchLedgerId: { name: to },
    createdBy: entry.createdBy,
    createdAt: entry.createdAt,
  };
}

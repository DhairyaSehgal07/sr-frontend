import type { NikasiGatePass, NikasiGatePassBagSizeItem } from '@/features/dispatch-pre-storage/api/types';

export function formatPdfDate(value: string | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatPdfNumber(value: number | undefined | null): string {
  if (value == null || !Number.isFinite(value)) return '';
  return new Intl.NumberFormat('en-IN').format(value);
}

export function formatPdfAmount(value: number | undefined | null): string {
  if (value == null || !Number.isFinite(value)) return '';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function totalBags(bagSize: readonly NikasiGatePassBagSizeItem[]): number {
  return bagSize.reduce((sum, row) => sum + row.quantityIssued, 0);
}

export function lineAmount(row: NikasiGatePassBagSizeItem): number | undefined {
  if (row.costPerBag == null || !Number.isFinite(row.costPerBag)) return undefined;
  return row.quantityIssued * row.costPerBag;
}

export function bagLinesTotal(bagSize: readonly NikasiGatePassBagSizeItem[]): number | undefined {
  let total = 0;
  let hasAmount = false;
  for (const row of bagSize) {
    const amount = lineAmount(row);
    if (amount != null) {
      total += amount;
      hasAmount = true;
    }
  }
  return hasAmount ? total : undefined;
}

/** Split net kg into quintal + remaining kg (1 qtl = 100 kg). */
export function splitWeightQtlKg(netWeightKg: number): { qtl: string; kg: string } {
  if (!Number.isFinite(netWeightKg) || netWeightKg < 0) {
    return { qtl: '', kg: '' };
  }
  const qtl = Math.floor(netWeightKg / 100);
  const kg = netWeightKg - qtl * 100;
  return {
    qtl: formatPdfNumber(qtl),
    kg: new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(kg),
  };
}

export function invoiceBillNo(data: NikasiGatePass): string {
  return formatPdfNumber(data.billNumber ?? data.gatePassNo);
}

export function biltiBillNo(data: NikasiGatePass): string {
  return formatPdfNumber(data.bitliNumber ?? data.billNumber ?? data.gatePassNo);
}

export function bagLineParticulars(row: NikasiGatePassBagSizeItem): string {
  return [row.size, row.variety].filter(Boolean).join(' — ');
}

export function partyAddressLines(data: NikasiGatePass): string[] {
  const party = data.dispatchLedgerId;
  return [party.name, party.address, party.mobileNumber].filter(
    (line): line is string => Boolean(line && line.trim()),
  );
}

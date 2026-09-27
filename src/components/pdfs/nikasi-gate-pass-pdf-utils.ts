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

const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
] as const;

const TENS = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
] as const;

function belowHundred(value: number): string {
  if (value < 20) return ONES[value] ?? '';
  const ten = Math.floor(value / 10);
  const one = value % 10;
  return one ? `${TENS[ten]} ${ONES[one]}` : (TENS[ten] ?? '');
}

function belowThousand(value: number): string {
  if (value < 100) return belowHundred(value);
  const hundred = Math.floor(value / 100);
  const rest = value % 100;
  const head = `${ONES[hundred]} Hundred`;
  return rest ? `${head} ${belowHundred(rest)}` : head;
}

/** Indian grouping: crore, lakh, thousand. */
function integerToWords(value: number): string {
  if (value === 0) return 'Zero';

  const crore = Math.floor(value / 1_00_00_000);
  const lakh = Math.floor((value % 1_00_00_000) / 1_00_000);
  const thousand = Math.floor((value % 1_00_000) / 1_000);
  const rest = value % 1_000;
  const parts: string[] = [];

  if (crore) parts.push(`${belowThousand(crore)} Crore`);
  if (lakh) parts.push(`${belowHundred(lakh)} Lakh`);
  if (thousand) parts.push(`${belowHundred(thousand)} Thousand`);
  if (rest) parts.push(belowThousand(rest));

  return parts.join(' ');
}

/** "One Lakh Only" / "One Thousand and Fifty Paise Only" for bilti totals. */
export function rupeesInWords(value: number | undefined | null): string {
  if (value == null || !Number.isFinite(value)) return '';

  const [rupeePart, paisePart = '00'] = Math.abs(value).toFixed(2).split('.');
  const rupees = Number(rupeePart);
  const paise = Number(paisePart);
  if (!Number.isSafeInteger(rupees) || rupees > 999_99_99_999) return '';

  const rupeeWords = integerToWords(rupees);
  if (paise === 0) return `${rupeeWords} Only`;
  if (rupees === 0) return `${integerToWords(paise)} Paise Only`;
  return `${rupeeWords} and ${integerToWords(paise)} Paise Only`;
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

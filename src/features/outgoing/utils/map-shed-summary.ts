import type { BookingVarietySummary } from '@/features/booking/types/booking-summary';

type ShedQuantitySource = {
  quantity?: number;
  qty?: number;
  currentQuantity?: number;
  initialQuantity?: number;
};

type ShedSizeInput = ShedQuantitySource & {
  size?: string;
};

type ShedVarietyInput = ShedQuantitySource & {
  variety?: string;
  sizes?: ShedSizeInput[];
};

function readQuantity(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function sizeQuantity(size: ShedSizeInput): number {
  return readQuantity(size.quantity ?? size.qty ?? size.currentQuantity ?? size.initialQuantity);
}

function varietyQuantity(variety: ShedVarietyInput, sizes: BookingVarietySummary['sizes']): number {
  const explicit = readQuantity(
    variety.quantity ?? variety.qty ?? variety.currentQuantity ?? variety.initialQuantity,
  );
  if (explicit > 0) return explicit;
  return sizes.reduce((sum, size) => sum + size.quantity, 0);
}

export function mapShedSummaryToVarietySummary(
  data: readonly ShedVarietyInput[],
): BookingVarietySummary[] {
  return data.map((variety) => {
    const sizes = (variety.sizes ?? []).map((size) => ({
      size: String(size.size ?? '').trim(),
      quantity: sizeQuantity(size),
    }));

    return {
      variety: String(variety.variety ?? '').trim(),
      quantity: varietyQuantity(variety, sizes),
      sizes,
    };
  });
}

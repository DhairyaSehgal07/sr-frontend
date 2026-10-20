export type BifurcationQuantityRow = {
  size: string;
  quantity: string;
};

export type BifurcationDeltaLine = {
  toSize: string;
  quantity: number;
};

export type BifurcationDelta =
  | {
      ok: true;
      fromSize: string;
      lines: BifurcationDeltaLine[];
    }
  | {
      ok: false;
      message: string;
    };

function parseBagQuantity(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return 0;
  if (!/^\d+$/.test(trimmed)) return null;
  return Number(trimmed);
}

/**
 * Compares the edited size grid with the bags currently issued.
 * One size must go down. Every size that is still above zero after that
 * change is saved, including bags left of the original size. The total can
 * be higher than before when larger bags are repacked into smaller ones.
 */
export function bifurcationDelta(
  rows: BifurcationQuantityRow[],
  issuedBySize: Record<string, number>,
): BifurcationDelta {
  const nextBySize = new Map<string, number>();

  for (const row of rows) {
    const size = row.size.trim();
    if (!size) continue;
    const quantity = parseBagQuantity(row.quantity);
    if (quantity == null) {
      return {
        ok: false,
        message: `Enter a whole number of bags for ${size}.`,
      };
    }
    nextBySize.set(size, (nextBySize.get(size) ?? 0) + quantity);
  }

  const sizes = new Set<string>([...Object.keys(issuedBySize), ...nextBySize.keys()]);
  const decreases: string[] = [];
  const increases: BifurcationDeltaLine[] = [];

  for (const size of sizes) {
    const before = issuedBySize[size] ?? 0;
    const after = nextBySize.get(size) ?? 0;

    if (after < before) {
      decreases.push(size);
    } else if (after > before) {
      increases.push({ toSize: size, quantity: after });
    }
  }

  if (decreases.length === 0 && increases.length === 0) {
    return {
      ok: false,
      message: 'Change at least one size before saving.',
    };
  }

  if (decreases.length > 1) {
    return {
      ok: false,
      message: 'Only one size can decrease in a bifurcation.',
    };
  }

  const fromSize = decreases[0];
  if (!fromSize || increases.length === 0) {
    return {
      ok: false,
      message: 'Enter the discovered sizes and how many bags each one was.',
    };
  }

  const remaining = nextBySize.get(fromSize) ?? 0;
  const lines: BifurcationDeltaLine[] =
    remaining > 0 ? [{ toSize: fromSize, quantity: remaining }, ...increases] : increases;

  return {
    ok: true,
    fromSize,
    lines,
  };
}

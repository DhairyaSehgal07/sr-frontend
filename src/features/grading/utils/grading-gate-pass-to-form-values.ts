import type { QueryClient } from '@tanstack/react-query';

import { findIncomingGatePassByGatePassNoInCache } from '@/features/incoming/api/find-incoming-gate-pass-by-gate-pass-no-in-cache';
import type { GatePassStatus } from '@/features/incoming/api/types';
import type { GradingOrderDetail } from '@/features/grading/api/types';
import type { GradingGatePass, GradingGatePassIncomingRef } from '@/features/grading/api/types';
import { BAG_SIZES } from '@/lib/constants';
import {
  createDefaultQuantities,
  type GradingQuantityRow,
} from '@/features/grading/schemas/grading-fill-details-schema';
import type { GradingFormValues } from '@/features/grading/schemas/grading-form-schema';
import type { GradingSelectIncomingGatePasses } from '@/features/grading/types';

function toIsoDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString();
}

function isStandardBagSize(size: string): size is (typeof BAG_SIZES)[number] {
  return (BAG_SIZES as readonly string[]).includes(size);
}

function toGatePassStatus(status: string | undefined): GatePassStatus {
  return status === 'NOT_GRADED' ? 'NOT_GRADED' : 'GRADED';
}

function weightSlipFromIncomingRef(ref: GradingGatePassIncomingRef) {
  return {
    slipNumber: ref.weightSlip?.slipNumber ?? '',
    grossWeightKg: ref.grossWeightKg ?? ref.weightSlip?.grossWeightKg ?? 0,
    tareWeightKg: ref.tareWeightKg ?? ref.weightSlip?.tareWeightKg ?? 0,
  };
}

export function orderDetailsToQuantities(
  orderDetails: readonly GradingOrderDetail[],
): GradingQuantityRow[] {
  const rows = createDefaultQuantities();
  const extras: GradingQuantityRow[] = [];

  for (const detail of orderDetails) {
    if (isStandardBagSize(detail.size)) {
      const row = rows.find((entry) => entry.size === detail.size);
      if (row) {
        row.qty = detail.quantity;
        row.bagType = detail.bagType;
        row.weight = detail.weightPerBagKg;
      }
      continue;
    }

    extras.push({
      size: detail.size,
      isExtra: true,
      qty: detail.quantity,
      bagType: detail.bagType,
      weight: detail.weightPerBagKg,
    });
  }

  return extras.length > 0 ? [...rows, ...extras] : rows;
}

export function resolveGradingIncomingGatePassIds(
  queryClient: QueryClient,
  refs: readonly GradingGatePassIncomingRef[],
  farmerStorageLinkId: string,
): string[] {
  const ids: string[] = [];

  for (const ref of refs) {
    if (ref._id) {
      ids.push(ref._id);
      continue;
    }

    const cached = findIncomingGatePassByGatePassNoInCache(
      queryClient,
      ref.gatePassNo,
      farmerStorageLinkId,
    );
    if (cached) {
      ids.push(cached._id);
    }
  }

  return ids;
}

export function gradingIncomingRefsToSelectRows(
  refs: readonly GradingGatePassIncomingRef[],
  variety: string,
  queryClient: QueryClient,
  farmerStorageLinkId: string,
): GradingSelectIncomingGatePasses[] {
  return refs.flatMap((ref) => {
    if (ref._id) {
      return [
        {
          _id: ref._id,
          gatePassNo: ref.gatePassNo,
          manualGatePassNumber: ref.manualGatePassNumber ?? 0,
          date: ref.date ?? '',
          variety,
          truckNumber: ref.truckNumber ?? '—',
          bagsReceived: ref.bagsReceived,
          weightSlip: weightSlipFromIncomingRef(ref),
          status: toGatePassStatus(ref.status),
        },
      ];
    }

    const cached = findIncomingGatePassByGatePassNoInCache(
      queryClient,
      ref.gatePassNo,
      farmerStorageLinkId,
    );

    if (cached) {
      return [
        {
          _id: cached._id,
          gatePassNo: cached.gatePassNo,
          manualGatePassNumber: cached.manualGatePassNumber ?? 0,
          date: cached.date,
          variety: cached.variety,
          truckNumber: cached.truckNumber,
          bagsReceived: cached.bagsReceived,
          weightSlip: cached.weightSlip ?? {
            slipNumber: '',
            grossWeightKg: 0,
            tareWeightKg: 0,
          },
          status: cached.status,
        },
      ];
    }

    return [
      {
        _id: `linked-${ref.gatePassNo}`,
        gatePassNo: ref.gatePassNo,
        manualGatePassNumber: ref.manualGatePassNumber ?? 0,
        date: ref.date ?? '',
        variety,
        truckNumber: ref.truckNumber ?? '—',
        bagsReceived: ref.bagsReceived,
        weightSlip: weightSlipFromIncomingRef(ref),
        status: toGatePassStatus(ref.status),
      },
    ];
  });
}

export function gradingGatePassToFormValues(
  gatePass: GradingGatePass,
  selectedIncomingGatePassIds: string[],
): GradingFormValues {
  const farmerStorageLinkId =
    typeof gatePass.farmerStorageLinkId === 'string'
      ? gatePass.farmerStorageLinkId
      : (gatePass.farmerStorageLinkId._id ?? '');

  return {
    farmerStorageLinkId,
    variety: gatePass.variety,
    selectedIncomingGatePassIds,
    manualGatePassNumber: gatePass.manualGatePassNumber,
    date: toIsoDateTime(gatePass.date),
    quantities: orderDetailsToQuantities(gatePass.orderDetails),
    remarks: gatePass.remarks ?? '',
  };
}

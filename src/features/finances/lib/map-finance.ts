import type {
  FinanceOutstanding,
  FinanceRecovery,
  FinanceSale,
  FinanceSummary,
} from '../api/types';
import type { FinancesTotals, PartyOutstanding, RecoveryEntry, SaleRow } from '../types';
import { paiseToRupees } from './format';

function asId(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  return String(value);
}

export function mapFinanceSummary(summary: FinanceSummary): FinancesTotals {
  return {
    sales: paiseToRupees(summary.billedPaise),
    recovered: paiseToRupees(summary.recoveredPaise),
    outstanding: paiseToRupees(summary.outstandingPaise),
  };
}

export function mapFinanceSale(sale: FinanceSale): SaleRow {
  return {
    id: asId(sale._id),
    dispatchId: asId(sale.dispatchId),
    date: sale.date,
    gatePassNo: sale.gatePassNo,
    billNumber: sale.billNumber,
    billBook: sale.billBookName,
    partyName: sale.dispatchLedgerName,
    bags: sale.bags,
    amount: paiseToRupees(sale.amountPaise),
    status: sale.status,
  };
}

export function mapFinanceOutstanding(row: FinanceOutstanding): PartyOutstanding {
  return {
    dispatchLedgerId: asId(row.dispatchLedgerId),
    partyName: row.dispatchLedgerName,
    billBookId: asId(row.billBookId),
    billBook: row.billBookName,
    billed: paiseToRupees(row.billedPaise),
    recovered: paiseToRupees(row.recoveredPaise),
    due: paiseToRupees(row.outstandingPaise),
  };
}

export function mapFinanceRecovery(entry: FinanceRecovery): RecoveryEntry {
  return {
    id: asId(entry._id),
    date: entry.date,
    dispatchLedgerId: asId(entry.dispatchLedgerId),
    partyName: entry.dispatchLedgerName,
    billBookId: asId(entry.billBookId),
    billBook: entry.billBookName,
    amount: paiseToRupees(entry.amountPaise),
    remark: entry.remark,
  };
}

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import { SrfLogo } from '@/components/pdfs/srf-logo';

import type { Booking } from '@/features/booking/api/types';
import {
  formatPdfAmount,
  formatPdfDate,
  formatPdfNumber,
} from '@/components/pdfs/nikasi-gate-pass-pdf-utils';

// --- Colors & Theme ---
const colors = {
  primary: '#B91C1C',
  textDark: '#0F172A',
  textMuted: '#475569',
  border: '#94A3B8',
  borderLight: '#CBD5E1',
  bgLight: '#F8FAFC',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.3,
    color: colors.textDark,
    backgroundColor: colors.white,
  },

  // --- Header ---
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 2,
    paddingBottom: 4,
  },
  logoSection: {
    width: 96,
    alignItems: 'center',
    paddingTop: 2,
  },
  companyInfoSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  rightSpacer: {
    width: 96,
  },
  logoBadge: {
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingVertical: 2.5,
    paddingHorizontal: 3,
    fontSize: 4.25,
    marginBottom: 3,
    fontFamily: 'Helvetica',
    textAlign: 'center',
    width: '100%',
    color: colors.textMuted,
    letterSpacing: 0.2,
  },

  jurisdictionText: {
    fontSize: 6.5,
    letterSpacing: 1.6,
    color: colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  companyName: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.8,
    marginBottom: 7,
  },
  tagline: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Oblique',
    color: colors.textDark,
    marginBottom: 9,
  },
  addressText: {
    fontSize: 7.5,
    lineHeight: 1.35,
    textAlign: 'center',
    color: colors.textMuted,
    marginBottom: 3,
  },
  contactText: {
    fontSize: 7.5,
    lineHeight: 1.35,
    textAlign: 'center',
    color: colors.textMuted,
  },
  divider: {
    borderBottomWidth: 0.75,
    borderBottomColor: colors.textDark,
    marginTop: 14,
    marginBottom: 12,
  },

  // --- Agreement title ---
  agreementHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  serialNumber: {
    position: 'absolute',
    left: 0,
    color: colors.primary,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  agreementTitle: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2.5,
    textDecoration: 'underline',
  },

  // --- Form lines ---
  formRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  textStatic: {
    marginRight: 4,
    fontSize: 9,
    color: colors.textDark,
  },
  fillLine: {
    flex: 1,
    borderBottomWidth: 0.75,
    borderBottomColor: colors.borderLight,
    marginBottom: 1,
    minHeight: 12,
    justifyContent: 'flex-end',
  },
  fillValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.textDark,
    paddingHorizontal: 4,
  },
  paymentCell: {
    width: '12%',
    alignItems: 'center',
  },
  paymentValue: {
    fontSize: 6.5,
    textAlign: 'center',
    marginBottom: 2,
    fontFamily: 'Helvetica',
    color: colors.textDark,
  },

  // --- Table ---
  table: {
    marginTop: 8,
    borderTopWidth: 0.75,
    borderLeftWidth: 0.75,
    borderColor: colors.border,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    borderRightWidth: 0.75,
    borderBottomWidth: 0.75,
    borderColor: colors.border,
    backgroundColor: colors.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 3,
    textAlign: 'center',
  },
  tableCol: {
    borderRightWidth: 0.75,
    borderBottomWidth: 0.75,
    borderColor: colors.border,
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 3,
    minHeight: 20,
  },
  cellText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.textDark,
  },
  cellTextSmall: {
    fontSize: 5.5,
    marginTop: 1.5,
    color: colors.textMuted,
    fontFamily: 'Helvetica',
  },

  // --- Footer / payment ---
  footerSection: {
    marginTop: 14,
  },
  paymentGridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    borderBottomWidth: 0.75,
    borderBottomColor: colors.border,
    paddingBottom: 3,
    marginBottom: 6,
  },
  paymentColText: {
    fontSize: 7.5,
    width: '12%',
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    color: colors.textDark,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentLine: {
    width: '100%',
    borderBottomWidth: 0.75,
    borderColor: colors.borderLight,
    minHeight: 8,
  },

  // --- Signatures ---
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  signatureBlock: {
    width: '35%',
  },
  signatureSpacer: {
    height: 32,
  },
  centerText: {
    textAlign: 'center',
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.textDark,
  },
  overleafText: {
    textAlign: 'center',
    fontSize: 8,
    fontFamily: 'Helvetica-Oblique',
    marginTop: 20,
    color: colors.textMuted,
  },
});

const TABLE_ROW_COUNT = 6;
const PAYMENT_ROW_COUNT = 4;

type AgreementLine = {
  variety: string;
  size: string;
  quantity: string;
  ratePerBag: string;
  weightPerBag: string;
  remarks: string;
};

type AgreementPayment = {
  reference: string;
  date: string;
  bank: string;
  amount: string;
};

type BookingAgreementPdfProps = {
  booking?: Booking | null;
};

function agreementLines(booking: Booking | null | undefined): AgreementLine[] {
  if (!booking) return [];

  return booking.bagSizes.map((row, index) => ({
    variety: row.variety,
    size: row.size,
    quantity: formatPdfNumber(row.currentQuantity),
    ratePerBag: formatPdfAmount(row.costPerBag),
    weightPerBag: '',
    remarks: index === 0 ? (booking.remarks ?? '') : '',
  }));
}

function agreementAmount(booking: Booking): number | undefined {
  if (booking.amount != null && Number.isFinite(booking.amount)) return booking.amount;

  let hasPricedLine = false;
  let total = 0;

  for (const row of booking.bagSizes) {
    if (row.costPerBag == null || !Number.isFinite(row.costPerBag) || row.currentQuantity <= 0) {
      continue;
    }
    hasPricedLine = true;
    total += row.currentQuantity * row.costPerBag;
  }

  if (!hasPricedLine) return undefined;
  return Math.round(total * 100) / 100;
}

function secondPartyLabel(booking: Booking): string {
  const ledger = booking.dispatchLedgerId;
  const address = ledger.address?.trim();
  return address ? `${ledger.name}, ${address}` : ledger.name;
}

function FillLine({ value }: { value?: string }) {
  return (
    <View style={styles.fillLine}>
      <Text style={styles.fillValue}>{value?.trim() ? value : ' '}</Text>
    </View>
  );
}

function TableCell({ width, value }: { width: string; value?: string }) {
  return (
    <View style={[styles.tableCol, { width }]}>
      {value ? (
        <Text style={[styles.cellText, { textAlign: 'center', fontFamily: 'Helvetica' }]}>
          {value}
        </Text>
      ) : null}
    </View>
  );
}

function PaymentCell({ value }: { value?: string }) {
  return (
    <View style={styles.paymentCell}>
      <Text style={styles.paymentValue}>{value?.trim() ? value : ' '}</Text>
      <View style={styles.paymentLine} />
    </View>
  );
}

const BookingAgreementPdf = ({ booking }: BookingAgreementPdfProps) => {
  const lines = agreementLines(booking);
  const rowCount = Math.max(TABLE_ROW_COUNT, lines.length);
  const amount = booking ? agreementAmount(booking) : undefined;
  const payment: AgreementPayment | null = booking
    ? {
        reference: '',
        date: formatPdfDate(booking.date),
        bank: booking.bank ?? '',
        amount: formatPdfAmount(amount),
      }
    : null;
  const agreementDate = booking ? formatPdfDate(booking.date) : '';

  const renderTableRows = () => {
    return Array.from({ length: rowCount }, (_, index) => {
      const line = lines[index];
      const num = index + 1;

      return (
        <View style={styles.tableRow} key={num}>
          <View style={[styles.tableCol, { width: '8%' }]}>
            <Text style={[styles.cellText, { textAlign: 'center', fontFamily: 'Helvetica' }]}>
              {num}.
            </Text>
          </View>
          <TableCell width="20%" value={line?.variety} />
          <TableCell width="12%" value={line?.size} />
          <TableCell width="15%" value={line?.quantity} />
          <TableCell width="15%" value={line?.ratePerBag} />
          <TableCell width="15%" value={line?.weightPerBag} />
          <TableCell width="15%" value={line?.remarks} />
        </View>
      );
    });
  };

  const renderPaymentRows = () => {
    return Array.from({ length: PAYMENT_ROW_COUNT }, (_, index) => {
      const row = index === 0 ? payment : null;

      return (
        <View style={styles.paymentRow} key={`pay-${index + 1}`}>
          <PaymentCell value={row?.reference} />
          <PaymentCell value={row?.date} />
          <PaymentCell value={row?.bank} />
          <PaymentCell value={row?.amount} />
          <PaymentCell />
          <PaymentCell />
          <PaymentCell />
          <PaymentCell />
        </View>
      );
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={false}>
        {/* Header Section (Updated to Flex Columns) */}
        <View style={styles.headerContainer}>
          {/* Left Column: Logo */}
          <View style={styles.logoSection}>
            <SrfLogo size={72} />
            <Text style={styles.logoBadge}>POSCON JALANDHAR (PUNJAB) 0135</Text>
            <Text style={styles.logoBadge}>PGFA NO. KAPURTHALA (PUNJAB) 005</Text>
          </View>

          {/* Center Column: Company Info */}
          <View style={styles.companyInfoSection}>
            <Text style={styles.jurisdictionText}>Subject to Kapurthala Jurisdiction</Text>
            <Text style={styles.companyName}>ASHOK KUMAR PAHUJA</Text>
            <Text style={styles.tagline}>Producers of Top Quality Potatoes of Punjab</Text>
            <Text style={styles.addressText}>
              Vill. Thigli, P.O. Sidhwan Dona, Distt. Kapurthala - 144 625 (Pb.)
            </Text>
            <Text style={styles.contactText}>
              Mob. 088720-07070, 099150-69815 · E-mail : srf_ashokpahuja@yahoo.co.in
            </Text>
          </View>

          {/* Right Column: Invisible Spacer for Centering */}
          <View style={styles.rightSpacer} />
        </View>

        <View style={styles.divider} />

        {/* Title Section */}
        <View style={styles.agreementHeaderRow}>
          <Text style={styles.serialNumber}>{booking ? String(booking.gatePassNo) : '406'}</Text>
          <Text style={styles.agreementTitle}>AGREEMENT</Text>
        </View>

        {/* Agreement Text Inputs */}
        <View style={styles.formRow}>
          <Text style={styles.textStatic}>Between </Text>
          <Text style={[styles.textStatic, { fontFamily: 'Helvetica-Bold' }]}>
            Ashok Kumar Pahuja
          </Text>
          <Text style={styles.textStatic}>, Kapurthala through</Text>
          <FillLine value="Shri Ram Farms" />
        </View>
        <View style={styles.formRow}>
          <Text style={styles.textStatic}>as first Party and</Text>
          <FillLine value={booking ? secondPartyLabel(booking) : ''} />
        </View>
        <View style={styles.formRow}>
          <Text style={styles.textStatic}>
            as Second Party, for the supply of Potato, on following terms and conditions :-
          </Text>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.textStatic}>
            The Second Party will purchase the Potato accordingly :-
          </Text>
        </View>

        {/* Data Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '8%' }]}>
              <Text style={styles.cellText}>S. No.</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '20%' }]}>
              <Text style={styles.cellText}>Variety</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '12%' }]}>
              <Text style={styles.cellText}>Size</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '15%' }]}>
              <Text style={styles.cellText}>Quantity</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '15%' }]}>
              <Text style={styles.cellText}>Rate per bag</Text>
              <Text style={styles.cellTextSmall}>F. O. R. Kapurthala</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '15%' }]}>
              <Text style={styles.cellText}>Weight per bag</Text>
              <Text style={styles.cellTextSmall}>at the time of Despatch</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '15%' }]}>
              <Text style={styles.cellText}>Remarks</Text>
            </View>
          </View>
          {/* Table Body */}
          {renderTableRows()}
        </View>

        {/* Footer Details */}
        <View style={styles.footerSection}>
          <View style={[styles.formRow, { width: '50%' }]}>
            <Text style={styles.textStatic}>Date of Delivery</Text>
            <FillLine value={booking ? formatPdfDate(booking.expectedDateOfDelivery) : ''} />
          </View>
          <View style={[styles.formRow, { width: '60%' }]}>
            <Text style={styles.textStatic}>Insurance & Chattai charges extra, if any</Text>
            <FillLine />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.textStatic}>Mode of Payment :-</Text>
          </View>

          {/* Payment Details Grid Header */}
          <View style={styles.paymentGridHeader}>
            <Text style={styles.paymentColText}>D. D. No.</Text>
            <Text style={styles.paymentColText}>Dt.</Text>
            <Text style={styles.paymentColText}>Bank</Text>
            <Text style={styles.paymentColText}>Amount</Text>
            <Text style={styles.paymentColText}>D. D. No.</Text>
            <Text style={styles.paymentColText}>Dt.</Text>
            <Text style={styles.paymentColText}>Bank</Text>
            <Text style={styles.paymentColText}>Amount</Text>
          </View>

          {/* Payment Lines */}
          {renderPaymentRows()}

          <View style={[styles.formRow, { marginTop: 8 }]}>
            <Text style={styles.textStatic}>TOTAL :</Text>
            <FillLine value={formatPdfAmount(amount)} />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.textStatic}>Mode of Balance Payment</Text>
            <FillLine value={booking?.modeOfPayment} />
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.divider} />

        <View style={styles.signatureContainer}>
          <View style={styles.signatureBlock}>
            <Text style={styles.centerText}>Accepted</Text>
            <Text style={[styles.centerText, { marginTop: 4 }]}>For ASHOK KUMAR PAHUJA</Text>
            <View style={styles.signatureSpacer} />
            <Text style={styles.centerText}>(First Party)</Text>

            <View style={[styles.formRow, { marginTop: 12, marginBottom: 0 }]}>
              <Text style={styles.textStatic}>Date</Text>
              <FillLine value={agreementDate} />
            </View>
          </View>

          <View style={styles.signatureBlock}>
            <Text style={styles.centerText}>Accepted</Text>
            <View style={[styles.signatureSpacer, { height: 45 }]} />
            <Text style={styles.centerText}>(Second Party)</Text>

            <View style={[styles.formRow, { marginTop: 12, marginBottom: 0 }]}>
              <Text style={styles.textStatic}>Date</Text>
              <FillLine value={agreementDate} />
            </View>
          </View>
        </View>

        <Text style={styles.overleafText}>(For Terms & Conditions See Overleaf)</Text>
      </Page>
    </Document>
  );
};

export default BookingAgreementPdf;

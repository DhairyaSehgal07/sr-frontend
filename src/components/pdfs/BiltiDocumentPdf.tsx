import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import { SrfLogo } from '@/components/pdfs/srf-logo';

import type { NikasiGatePass } from '@/features/dispatch-pre-storage/api/types';

import {
  bagLineParticulars,
  bagLinesTotal,
  biltiBillNo,
  formatPdfAmount,
  formatPdfDate,
  formatPdfNumber,
  lineAmount,
  rupeesInWords,
  totalBags,
} from './nikasi-gate-pass-pdf-utils';

// --- Colors & Theme ---
const colors = {
  brandGreen: '#15803D', // Deep green for primary headers
  brandRed: '#B91C1C', // Red for accents and subheaders
  textDark: '#0F172A',
  textMuted: '#475569',
  border: '#94A3B8', // Slate for elegant grid lines
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

  // --- Header Layout ---
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 16,
  },

  logoSection: {
    width: 168,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jpgaText: {
    fontSize: 7,
    lineHeight: 1.4,
    fontFamily: 'Helvetica-Bold',
    color: colors.brandGreen,
    marginLeft: 6,
    width: 78,
  },

  // Center: Company Info
  companyInfoSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  companyName: {
    fontSize: 24,
    lineHeight: 1,
    color: colors.brandGreen,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 10,
    lineHeight: 1,
    fontFamily: 'Helvetica-Bold',
    color: colors.brandRed,
    marginBottom: 6,
  },
  addressText: {
    fontSize: 9,
    lineHeight: 1.4,
    textAlign: 'center',
    color: colors.brandRed,
  },

  // Right: Bill Details Box
  billBoxSection: {
    width: 140,
    flexDirection: 'row',
    borderWidth: 0.75,
    borderColor: colors.brandRed,
  },
  billCol: {
    flex: 1,
    borderRightWidth: 0.75,
    borderColor: colors.brandRed,
  },
  billColRight: {
    flex: 1,
  },
  billHeader: {
    fontSize: 8,
    lineHeight: 1,
    fontFamily: 'Helvetica-Bold',
    color: colors.brandRed,
    padding: 5,
    borderBottomWidth: 0.75,
    borderColor: colors.brandRed,
  },
  billValue: {
    fontSize: 12,
    lineHeight: 1,
    fontFamily: 'Helvetica-Bold',
    color: colors.brandRed,
    textAlign: 'center',
    padding: 8,
    minHeight: 28,
  },

  // --- Main Grid Container ---
  gridContainer: {
    width: '100%',
    borderWidth: 0.75,
    borderColor: colors.border,
    marginBottom: 16,
  },
  gridRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.75,
    borderColor: colors.border,
  },
  gridCell: {
    borderRightWidth: 0.75,
    borderColor: colors.border,
    padding: 6,
  },
  gridCellNoBorderRight: {
    padding: 6,
  },

  // Grid Typography
  cellLabelText: {
    fontSize: 8,
    lineHeight: 1,
    color: colors.brandRed,
    fontFamily: 'Helvetica',
  },
  cellLabelTextSmall: {
    fontSize: 7.5,
    lineHeight: 1,
    color: colors.brandRed,
    marginBottom: 4,
    fontFamily: 'Helvetica',
  },
  cellValueText: {
    fontSize: 8,
    lineHeight: 1.3,
    color: colors.textDark,
    fontFamily: 'Helvetica',
    marginTop: 4,
  },
  cellValueTextBold: {
    fontSize: 9,
    lineHeight: 1.3,
    color: colors.textDark,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  bagLineCell: {
    minHeight: 22,
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  cellHeaderText: {
    fontSize: 8,
    lineHeight: 1.3,
    fontFamily: 'Helvetica-Bold',
    color: colors.brandRed,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  particularsAccent: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.brandRed,
  },
  totalText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.brandRed,
    textAlign: 'right',
    paddingRight: 10,
  },

  // --- Footer ---
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  termsSection: {
    flex: 1,
    paddingRight: 20,
  },
  termsHeader: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.brandRed,
    marginBottom: 6,
  },
  bulletPointRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletIcon: {
    fontSize: 8,
    lineHeight: 1.3,
    color: colors.brandRed,
    marginRight: 4,
  },
  bulletText: {
    fontSize: 7.5,
    color: colors.brandRed,
    flex: 1,
    lineHeight: 1.3,
  },
  signatureSection: {
    width: 200,
    alignItems: 'flex-end',
  },
  signatureText: {
    fontSize: 9,
    lineHeight: 1,
    fontFamily: 'Helvetica-Bold',
    color: colors.brandGreen,
  },
});

type BiltiDocumentPdfProps = {
  data?: NikasiGatePass;
};

function biltiHeading(billBook: NikasiGatePass['billBook'] | undefined): string {
  const name = billBook == null ? '' : String(billBook).trim();
  return name || 'ASHOK KUMAR PAHUJA';
}

const BiltiDocumentPdf = ({ data }: BiltiDocumentPdfProps) => {
  const heading = biltiHeading(data?.billBook);
  const billNo = data ? biltiBillNo(data) : '';
  const dated = data ? formatPdfDate(data.date) : '';
  const party = data?.dispatchLedgerId;
  const billingLines = party
    ? [party.name, party.address, party.mobileNumber].filter((line): line is string =>
        Boolean(line && line.trim()),
      )
    : [];
  const delivery = data?.to?.trim() || '';
  const lorryNo = data?.truckNumber?.trim() || '';
  const challanNo = data ? formatPdfNumber(data.bitliNumber) : '';
  const bagRows = (data?.bagSize ?? []).filter((row) => row.quantityIssued > 0);
  const bags = data ? formatPdfNumber(totalBags(bagRows)) : '';
  const totalAmount = bagLinesTotal(bagRows);
  const totalAmountLabel = totalAmount != null ? formatPdfAmount(totalAmount) : '';
  const amountInWords = rupeesInWords(totalAmount);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
        {/* --- Header Area --- */}
        <View style={styles.headerContainer}>
          {/* Logo & Membership */}
          <View style={styles.logoSection}>
            <View style={styles.logoRow}>
              <SrfLogo size={72} />
              <Text style={styles.jpgaText}>JPGA NO. 01083</Text>
            </View>
          </View>

          {/* Company Identity */}
          <View style={styles.companyInfoSection}>
            <Text style={styles.companyName}>{heading}</Text>
            <Text style={styles.tagline}>Producers of Top Quality Potatoes of Punjab</Text>
            <Text style={styles.addressText}>V.P.O Uggi , Distt. Jalandhar</Text>
            <Text style={styles.addressText}>
              M. 98152-09363, 99159-83498, WhatsApp 95926-09363
            </Text>
          </View>

          {/* Bill No & Date Boxes */}
          <View style={styles.billBoxSection}>
            <View style={styles.billCol}>
              <Text style={styles.billHeader}>Bill No.</Text>
              <Text style={styles.billValue}>{billNo}</Text>
            </View>
            <View style={styles.billColRight}>
              <Text style={styles.billHeader}>Dated :</Text>
              <Text style={styles.billValue}>{dated}</Text>
            </View>
          </View>
        </View>

        {/* --- Main Table / Grid Area --- */}
        <View style={styles.gridContainer}>
          {/* Row 1: Addresses and Logistics */}
          <View style={styles.gridRow}>
            <View style={[styles.gridCell, { width: '35%', minHeight: 40 }]}>
              <Text style={styles.cellLabelText}>Billing Address :</Text>
              {billingLines.map((line) => (
                <Text key={line} style={styles.cellValueText}>
                  {line}
                </Text>
              ))}
            </View>
            <View style={[styles.gridCell, { width: '35%' }]}>
              <Text style={styles.cellLabelText}>Delivery Address :</Text>
              {delivery ? <Text style={styles.cellValueText}>{delivery}</Text> : null}
            </View>
            <View style={[styles.gridCell, { width: '15%', justifyContent: 'center' }]}>
              <Text style={styles.cellLabelTextSmall}>Lorry No.{lorryNo ? ` ${lorryNo}` : ''}</Text>
              <Text style={styles.cellLabelTextSmall}>
                Challan No.{challanNo ? ` ${challanNo}` : ''}
              </Text>
              <Text style={styles.cellLabelTextSmall}>TRPT.</Text>
              <Text style={[styles.cellLabelTextSmall, { marginBottom: 0 }]}>
                Bags{bags ? ` ${bags}` : ''}
              </Text>
            </View>
            <View style={[styles.gridCellNoBorderRight, { width: '15%' }]}>
              <Text style={styles.cellLabelTextSmall}>Terms</Text>
            </View>
          </View>

          {/* Row 2: Table Columns Header */}
          <View style={[styles.gridRow, { backgroundColor: colors.bgLight }]}>
            <View
              style={[
                styles.gridCell,
                { width: '8%', alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
              ]}
            >
              <Text style={styles.cellHeaderText}>No. of{'\n'}Bags</Text>
            </View>
            <View
              style={[
                styles.gridCell,
                { width: '62%', alignItems: 'center', justifyContent: 'center' },
              ]}
            >
              <Text style={[styles.cellHeaderText, { letterSpacing: 4 }]}>
                P A R T I C U L A R S
              </Text>
            </View>
            <View
              style={[
                styles.gridCell,
                { width: '15%', alignItems: 'center', justifyContent: 'center' },
              ]}
            >
              <Text style={styles.cellHeaderText}>Rate Per{'\n'}Bag 50 Kgs.</Text>
            </View>
            <View
              style={[
                styles.gridCellNoBorderRight,
                { width: '15%', alignItems: 'center', justifyContent: 'center' },
              ]}
            >
              <Text style={styles.cellHeaderText}>AMOUNT</Text>
            </View>
          </View>

          {bagRows.length === 0 ? (
            <View style={[styles.gridRow, { minHeight: 200 }]}>
              <View style={[styles.gridCell, styles.bagLineCell, { width: '8%' }]} />
              <View
                style={[
                  styles.gridCell,
                  styles.bagLineCell,
                  { width: '62%', alignItems: 'center' },
                ]}
              >
                <Text style={styles.particularsAccent}>
                  Insurance, Chattai & Loading Charges Extra
                </Text>
              </View>
              <View style={[styles.gridCell, styles.bagLineCell, { width: '15%' }]} />
              <View style={[styles.gridCellNoBorderRight, styles.bagLineCell, { width: '15%' }]} />
            </View>
          ) : (
            bagRows.map((row, index) => {
              const amount = lineAmount(row);
              return (
                <View key={`${row.size}-${row.variety}-${index}`} style={styles.gridRow}>
                  <View style={[styles.gridCell, styles.bagLineCell, { width: '8%' }]}>
                    <Text style={styles.cellValueTextBold}>
                      {formatPdfNumber(row.quantityIssued)}
                    </Text>
                  </View>
                  <View style={[styles.gridCell, styles.bagLineCell, { width: '62%' }]}>
                    <Text style={[styles.cellValueText, { marginTop: 0 }]}>
                      {bagLineParticulars(row)}
                    </Text>
                  </View>
                  <View style={[styles.gridCell, styles.bagLineCell, { width: '15%' }]}>
                    {row.costPerBag != null ? (
                      <Text style={styles.cellValueTextBold}>
                        {formatPdfAmount(row.costPerBag)}
                      </Text>
                    ) : null}
                  </View>
                  <View
                    style={[styles.gridCellNoBorderRight, styles.bagLineCell, { width: '15%' }]}
                  >
                    {amount != null ? (
                      <Text style={styles.cellValueTextBold}>{formatPdfAmount(amount)}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}

          {bagRows.length > 0 ? (
            <View style={[styles.gridRow, { minHeight: 120 }]}>
              <View style={[styles.gridCell, { width: '8%' }]} />
              <View
                style={[styles.gridCell, { width: '62%', alignItems: 'center', paddingTop: 12 }]}
              >
                <Text style={[styles.particularsAccent, { textAlign: 'center' }]}>
                  Insurance, Chattai & Loading Charges Extra
                </Text>
              </View>
              <View style={[styles.gridCell, { width: '15%' }]} />
              <View style={[styles.gridCellNoBorderRight, { width: '15%' }]} />
            </View>
          ) : null}

          {/* Row 4: Total */}
          <View style={[styles.gridRow, { minHeight: 28, alignItems: 'center' }]}>
            <View style={[styles.gridCell, { width: '70%', borderRightWidth: 0.75 }]}>
              <Text style={styles.totalText}>TOTAL</Text>
            </View>
            <View style={[styles.gridCell, { width: '15%' }]} />
            <View style={[styles.gridCellNoBorderRight, { width: '15%' }]}>
              {totalAmountLabel ? (
                <Text style={styles.cellValueTextBold}>{totalAmountLabel}</Text>
              ) : null}
            </View>
          </View>

          {/* Row 5: Amount in Words */}
          <View style={[styles.gridRow, { borderBottomWidth: 0, minHeight: 32 }]}>
            <View
              style={[
                styles.gridCellNoBorderRight,
                { width: '100%', flexDirection: 'row', alignItems: 'center' },
              ]}
            >
              <Text style={styles.cellLabelText}>Rupees in Words :</Text>
              {amountInWords ? (
                <Text
                  style={[
                    styles.cellValueText,
                    { marginTop: 0, marginLeft: 6, flex: 1, fontFamily: 'Helvetica-Bold' },
                  ]}
                >
                  {amountInWords}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* --- Footer Area --- */}
        <View style={styles.footerContainer}>
          {/* Terms & Conditions Block */}
          <View style={styles.termsSection}>
            <Text style={styles.termsHeader}>Terms & Conditions :</Text>
            <View style={styles.bulletPointRow}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                Our responsibility ceases as soon as the goods leave our cold storage.
              </Text>
            </View>
            <View style={styles.bulletPointRow}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                It is declared that the above consignment is our farm produce.
              </Text>
            </View>
            <View style={styles.bulletPointRow}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>
                All disputes as to rates & delivery of Potatoes shall be subject to Jalandhar
                Jurisdiction.
              </Text>
            </View>
          </View>

          {/* Signature Block */}
          <View style={styles.signatureSection}>
            <Text style={styles.signatureText}>For {heading}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default BiltiDocumentPdf;

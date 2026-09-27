import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import type { NikasiGatePass } from '@/features/dispatch-pre-storage/api/types';

import {
  formatPdfDate,
  formatPdfNumber,
  invoiceBillNo,
  partyAddressLines,
  splitWeightQtlKg,
  totalBags,
} from './nikasi-gate-pass-pdf-utils';

// --- Colors & Theme ---
const colors = {
  brandGreen: '#15803D',
  brandRed: '#B91C1C',
  textDark: '#0F172A',
  textMuted: '#475569',
  borderLight: '#CBD5E1',
  bgLight: '#F0FDF4', // Very faint green for table headers
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 42,
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.4,
    color: colors.textDark,
    backgroundColor: colors.white,
  },

  // --- Header Layout ---
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.brandGreen,
  },
  logoSection: {
    width: 130,
    alignItems: 'center',
  },
  logoCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: colors.brandRed,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    color: colors.brandRed,
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  logoBadge: {
    borderWidth: 0.75,
    borderColor: colors.brandGreen,
    paddingVertical: 3,
    paddingHorizontal: 4,
    fontSize: 5,
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    width: '100%',
    color: colors.brandGreen,
    lineHeight: 1.3,
  },
  companyInfoSection: {
    flex: 1,
    alignItems: 'flex-end', // Aligned to the right as per standard letterhead
    paddingTop: 2,
  },
  companyName: {
    fontSize: 22,
    color: colors.brandRed,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
    lineHeight: 1.2,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 10,
    fontFamily: 'Helvetica-BoldOblique',
    color: colors.brandGreen,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 8.5,
    lineHeight: 1.5,
    color: colors.textMuted,
    textAlign: 'right',
  },

  // --- Form & Transport Details ---
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  leftDetails: {
    width: '44%',
  },
  rightDetails: {
    width: '50%',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  textStatic: {
    marginRight: 6,
    fontSize: 9,
    color: colors.textDark,
  },
  textStaticGreen: {
    marginRight: 6,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.brandGreen,
  },
  grNumber: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: colors.brandRed,
    marginRight: 10,
  },
  fillLine: {
    flex: 1,
    borderBottomWidth: 0.75,
    borderBottomStyle: 'dashed',
    borderBottomColor: colors.borderLight,
    marginBottom: 1,
    marginRight: 14,
  },
  fillLineTight: {
    flex: 1,
    borderBottomWidth: 0.75,
    borderBottomStyle: 'dashed',
    borderBottomColor: colors.borderLight,
    marginBottom: 1,
  },
  fillValue: {
    flex: 1,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.textDark,
    borderBottomWidth: 0.75,
    borderBottomStyle: 'dashed',
    borderBottomColor: colors.borderLight,
    marginBottom: 1,
    paddingBottom: 1,
  },
  cellValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.textDark,
    textAlign: 'center',
    padding: 6,
  },
  cellValueLeft: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: colors.textDark,
    textAlign: 'left',
    padding: 8,
    paddingBottom: 4,
  },
  contentsCol: {
    width: '35%',
    borderRightWidth: 1,
    borderColor: colors.brandGreen,
    justifyContent: 'space-between',
  },

  // Full-width From/To row
  fromToRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  fromToBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '50%',
  },

  // --- Disclaimers ---
  disclaimerBlock: {
    marginBottom: 12,
  },
  disclaimerText: {
    fontSize: 8,
    color: colors.brandGreen,
    fontFamily: 'Helvetica-Oblique',
    marginBottom: 3,
    lineHeight: 1.4,
  },

  // --- Table ---
  table: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.brandGreen,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgLight,
    borderBottomWidth: 1,
    borderColor: colors.brandGreen,
  },
  tableHeaderCell: {
    borderRightWidth: 1,
    borderColor: colors.brandGreen,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableHeaderCellNoBorder: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  headerText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.brandGreen,
    textAlign: 'center',
    lineHeight: 1.4,
  },

  // Weight nested header
  weightHeaderContainer: {
    width: '15%',
    borderRightWidth: 1,
    borderColor: colors.brandGreen,
  },
  weightTop: {
    borderBottomWidth: 1,
    borderColor: colors.brandGreen,
    paddingVertical: 6,
    alignItems: 'center',
  },
  weightBottom: {
    flexDirection: 'row',
    flex: 1,
  },
  weightSubCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  // Table Body (Single large row)
  tableBodyRow: {
    flexDirection: 'row',
    minHeight: 270, // Large empty space for filling details
  },
  tableCol: {
    borderRightWidth: 1,
    borderColor: colors.brandGreen,
  },
  tableColNoBorder: {
    borderRightWidth: 0,
  },

  // Accents
  bardanaText: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-BoldOblique',
    color: colors.brandRed,
    textAlign: 'left',
    paddingLeft: 12,
    paddingBottom: 16,
    letterSpacing: 0.3,
  },

  // --- Footer ---
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 36,
    paddingHorizontal: 10,
  },
  signatureLine: {
    borderTopWidth: 0.75,
    borderColor: colors.textDark,
    paddingTop: 6,
    width: 130,
    alignItems: 'center',
  },
  signatureText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.textDark,
    letterSpacing: 0.3,
  },
});

type InvoiceDocumentPdfProps = {
  data?: NikasiGatePass;
};

function FillField({
  value,
  style,
}: {
  value?: string;
  style?: { marginRight?: number };
}) {
  if (value) {
    return <Text style={style ? [styles.fillValue, style] : styles.fillValue}>{value}</Text>;
  }
  return <View style={style ? [styles.fillLineTight, style] : styles.fillLineTight} />;
}

const InvoiceDocumentPdf = ({ data }: InvoiceDocumentPdfProps) => {
  const billNo = data ? invoiceBillNo(data) : '';
  const dated = data ? formatPdfDate(data.date) : '';
  const partyLines = data ? partyAddressLines(data) : [];
  const truckNo = data?.truckNumber?.trim() || '';
  const transportCompany = data?.transportCompany?.trim() || '';
  const lsNumber = data?.LSNumber?.trim() || '';
  const driverName = data?.driverName?.trim() || '';
  const driverMobile = data?.driverMobile?.trim() || '';
  const owner = data?.owner?.trim() || '';
  const from = data?.from?.trim() || '';
  const to = data?.to?.trim() || '';
  const pkgs = data ? formatPdfNumber(totalBags(data.bagSize)) : '';
  const weight = data ? splitWeightQtlKg(data.netWeight) : { qtl: '', kg: '' };
  const contentLines = data
    ? [
        data.category,
        ...data.bagSize.map(
          (row) => `${row.size} ${row.variety} × ${formatPdfNumber(row.quantityIssued)}`,
        ),
      ].filter(Boolean)
    : [];

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={false}>
        {/* --- Header Section --- */}
        <View style={styles.headerContainer}>
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>SRF</Text>
            </View>
            <Text style={styles.logoBadge}>POSCON JALANDHAR (PUNJAB) 0135</Text>
            <Text style={styles.logoBadge}>PGFA NO. KAPURTHALA (PUNJAB) 005</Text>
          </View>

          <View style={styles.companyInfoSection}>
            <Text style={styles.companyName}>ASHOK KUMAR PAHUJA</Text>
            <Text style={styles.tagline}>Producers of Top Quality Potatoes of Punjab</Text>
            <Text style={styles.addressText}>
              Vill. Thigli, P.O. Sidhwan Dona, Distt. Kapurthala - 144 625 (Pb.)
            </Text>
            <Text style={styles.addressText}>Mob. 088720-07070, 099150-69815</Text>
            <Text style={styles.addressText}>E-mail: srf_ashokpahuja@yahoo.co.in</Text>
          </View>
        </View>

        {/* --- Form Details Section --- */}
        <View style={styles.detailsContainer}>
          {/* Left Block */}
          <View style={styles.leftDetails}>
            <View style={styles.formRow}>
              <Text style={styles.textStaticGreen}>G.R. No.</Text>
              {billNo ? <Text style={styles.grNumber}>{billNo}</Text> : null}
              <Text style={styles.textStatic}>Dated</Text>
              <FillField value={dated} />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.textStatic}>To M/s.</Text>
              <FillField value={partyLines[0]} />
            </View>
            <View style={styles.formRow}>
              <FillField value={partyLines[1]} />
            </View>
            <View style={[styles.formRow, { marginBottom: 0 }]}>
              <FillField value={partyLines[2]} />
            </View>
          </View>

          {/* Right Block */}
          <View style={styles.rightDetails}>
            <View style={styles.formRow}>
              <Text style={styles.textStatic}>Truck No.</Text>
              <FillField value={truckNo} />
            </View>
            <View style={styles.formRow}>
              <Text style={styles.textStatic}>Transport Co.</Text>
              <FillField value={transportCompany} style={{ marginRight: 14 }} />
              <Text style={styles.textStatic}>Bill No.</Text>
              <FillField value={billNo} />
            </View>
            <View style={styles.formRow}>
              <Text style={styles.textStatic}>L.S. No.</Text>
              <FillField value={lsNumber} />
            </View>
            <View style={styles.formRow}>
              <Text style={styles.textStatic}>Name of Driver</Text>
              <FillField value={driverName} style={{ marginRight: 14 }} />
              <Text style={styles.textStatic}>Mob.</Text>
              <FillField value={driverMobile} />
            </View>
            <View style={[styles.formRow, { marginBottom: 0 }]}>
              <Text style={styles.textStatic}>Owner</Text>
              <FillField value={owner} />
            </View>
          </View>
        </View>

        {/* Full width From/To Row */}
        <View style={styles.fromToRow}>
          <View style={[styles.fromToBlock, { paddingRight: 14 }]}>
            <Text style={styles.textStatic}>From</Text>
            <FillField value={from} />
          </View>
          <View style={styles.fromToBlock}>
            <Text style={styles.textStatic}>To</Text>
            <FillField value={to} />
          </View>
        </View>

        {/* Disclaimers */}
        <View style={styles.disclaimerBlock}>
          <Text style={styles.disclaimerText}>
            (i) Goods as per details given below are sent herewith. Please issue receipt to the
            driver after checking.
          </Text>
          <Text style={styles.disclaimerText}>
            (ii) Truck driver is responsible for the safe delivery of goods as per challan.
          </Text>
        </View>

        {/* --- Main Table --- */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableHeaderRow}>
            <View style={[styles.tableHeaderCell, { width: '10%' }]}>
              <Text style={styles.headerText}>NO. OF{'\n'}PKGS.</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: '35%' }]}>
              <Text style={[styles.headerText, { letterSpacing: 2 }]}>C O N T E N T S</Text>
            </View>

            {/* Nested Weight Column */}
            <View style={styles.weightHeaderContainer}>
              <View style={styles.weightTop}>
                <Text style={styles.headerText}>WEIGHT</Text>
              </View>
              <View style={styles.weightBottom}>
                <View
                  style={[
                    styles.weightSubCell,
                    { borderRightWidth: 1, borderColor: colors.brandGreen },
                  ]}
                >
                  <Text style={styles.headerText}>QTL.</Text>
                </View>
                <View style={styles.weightSubCell}>
                  <Text style={styles.headerText}>KG.</Text>
                </View>
              </View>
            </View>

            <View style={[styles.tableHeaderCell, { width: '10%' }]}>
              <Text style={styles.headerText}>RATE{'\n'}PER QTL.</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: '10%' }]}>
              <Text style={styles.headerText}>TOTAL FREIGHT{'\n'}RUPEES</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: '10%' }]}>
              <Text style={styles.headerText}>FREIGHT PAID{'\n'}ADVANCE RUPEES</Text>
            </View>
            <View style={[styles.tableHeaderCellNoBorder, { width: '10%' }]}>
              <Text style={styles.headerText}>FREIGHT TO{'\n'}PAY RUPEES</Text>
            </View>
          </View>

          {/* Table Body */}
          <View style={styles.tableBodyRow}>
            <View style={[styles.tableCol, { width: '10%' }]}>
              {pkgs ? <Text style={styles.cellValue}>{pkgs}</Text> : null}
            </View>
            <View style={styles.contentsCol}>
              <View>
                {contentLines.map((line) => (
                  <Text key={line} style={styles.cellValueLeft}>
                    {line}
                  </Text>
                ))}
              </View>
              <Text style={styles.bardanaText}>BARDANA TAX EXTRA</Text>
            </View>
            <View style={[styles.tableCol, { width: '7.5%' }]}>
              {weight.qtl ? <Text style={styles.cellValue}>{weight.qtl}</Text> : null}
            </View>
            <View style={[styles.tableCol, { width: '7.5%' }]}>
              {weight.kg ? <Text style={styles.cellValue}>{weight.kg}</Text> : null}
            </View>
            <View style={[styles.tableCol, { width: '10%' }]} />
            <View style={[styles.tableCol, { width: '10%' }]} />
            <View style={[styles.tableCol, { width: '10%' }]} />
            <View style={[styles.tableColNoBorder, { width: '10%' }]} />
          </View>
        </View>

        {/* --- Footer Signatures --- */}
        <View style={styles.footerContainer}>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureText}>Signature of Driver</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureText}>Manager</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceDocumentPdf;

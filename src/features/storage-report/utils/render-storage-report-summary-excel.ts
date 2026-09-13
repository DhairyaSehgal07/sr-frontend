import type ExcelJS from 'exceljs';

import {
  hasSummaryTableData,
  type StorageReportSummaryTable,
} from '@/features/storage-report/utils/build-storage-report-summaries';
import { getExcelNumFmt } from '@/features/storage-report/utils/export-cell-value';
import { COLDOP_BRANDING, EXPORT_THEME_COLORS } from '@/lib/export-report-theme';

const COLORS = EXPORT_THEME_COLORS;

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: COLORS.border } },
  left: { style: 'thin', color: { argb: COLORS.border } },
  bottom: { style: 'thin', color: { argb: COLORS.border } },
  right: { style: 'thin', color: { argb: COLORS.border } },
};

function createSummaryTitleStyle(): Partial<ExcelJS.Style> {
  return {
    font: {
      name: 'Calibri',
      size: 12,
      bold: true,
      color: { argb: COLORS.primary },
    },
    alignment: { vertical: 'middle', horizontal: 'left' },
  };
}

function createSummaryHeaderStyle(align: 'left' | 'right'): Partial<ExcelJS.Style> {
  return {
    font: {
      name: 'Calibri',
      size: 10,
      bold: true,
      color: { argb: COLORS.primary },
    },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.mutedFill },
    },
    border: THIN_BORDER,
    alignment: {
      vertical: 'middle',
      horizontal: align,
      wrapText: true,
    },
  };
}

function createSummaryBodyStyle(options: {
  align: 'left' | 'right';
  fillArgb?: string;
  bold?: boolean;
  fontColorArgb?: string;
  numFmt?: string;
}): Partial<ExcelJS.Style> {
  return {
    font: {
      name: 'Calibri',
      size: 10,
      bold: options.bold ?? false,
      color: { argb: options.fontColorArgb ?? COLORS.foreground },
    },
    fill: options.fillArgb
      ? {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: options.fillArgb },
        }
      : undefined,
    border: THIN_BORDER,
    alignment: {
      vertical: 'middle',
      horizontal: options.align,
      wrapText: true,
    },
    numFmt: options.numFmt,
  };
}

function createSummaryFooterNumericStyle(fillArgb?: string): Partial<ExcelJS.Style> {
  return createSummaryBodyStyle({
    align: 'right',
    bold: true,
    fontColorArgb: COLORS.primary,
    fillArgb,
    numFmt: getExcelNumFmt(),
  });
}

function autoFitSummaryColumns(worksheet: ExcelJS.Worksheet, columnCount: number, maxWidth = 40) {
  for (let index = 1; index <= columnCount; index += 1) {
    const column = worksheet.getColumn(index);
    let maxLength = 10;

    column.eachCell({ includeEmpty: false }, (cell) => {
      const value = cell.value;
      const text = value == null ? '' : String(value);
      maxLength = Math.max(maxLength, Math.min(text.length + 2, maxWidth));
    });

    column.width = maxLength;
  }
}

function writeSummaryTableToWorksheet(
  worksheet: ExcelJS.Worksheet,
  startRow: number,
  summary: StorageReportSummaryTable,
): number {
  const numFmt = getExcelNumFmt();
  const totalColumnIndex = summary.sizeNames.length + 2;
  let currentRow = startRow;

  const titleRow = worksheet.getRow(currentRow);
  titleRow.height = 22;
  titleRow.getCell(1).value = summary.title;
  titleRow.getCell(1).style = createSummaryTitleStyle();
  currentRow += 1;

  if (!hasSummaryTableData(summary)) {
    const emptyRow = worksheet.getRow(currentRow);
    emptyRow.height = 18;
    emptyRow.getCell(1).value = 'No data';
    emptyRow.getCell(1).style = createSummaryBodyStyle({ align: 'left' });
    return currentRow + 2;
  }

  const headerRow = worksheet.getRow(currentRow);
  headerRow.height = 22;
  headerRow.getCell(1).value = summary.rowHeaderLabel;
  headerRow.getCell(1).style = createSummaryHeaderStyle('left');

  summary.sizeNames.forEach((sizeName, index) => {
    const cell = headerRow.getCell(index + 2);
    cell.value = sizeName;
    cell.style = createSummaryHeaderStyle('right');
  });

  headerRow.getCell(totalColumnIndex).value = 'Total';
  headerRow.getCell(totalColumnIndex).style = createSummaryHeaderStyle('right');
  currentRow += 1;

  summary.rows.forEach((row, rowIndex) => {
    const excelRow = worksheet.getRow(currentRow);
    excelRow.height = 18;

    excelRow.getCell(1).value = row.label;
    excelRow.getCell(1).style = createSummaryBodyStyle({
      align: 'left',
      bold: true,
      fillArgb: rowIndex % 2 === 1 ? COLORS.zebraFill : undefined,
    });

    summary.sizeNames.forEach((sizeName, index) => {
      const cell = excelRow.getCell(index + 2);
      cell.value = row.values[sizeName] ?? 0;
      cell.style = createSummaryBodyStyle({
        align: 'right',
        fillArgb: rowIndex % 2 === 1 ? COLORS.zebraFill : undefined,
        numFmt,
      });
    });

    excelRow.getCell(totalColumnIndex).value = row.total;
    excelRow.getCell(totalColumnIndex).style = createSummaryBodyStyle({
      align: 'right',
      bold: true,
      fontColorArgb: COLORS.primary,
      fillArgb: COLORS.primarySoftFill,
      numFmt,
    });

    currentRow += 1;
  });

  const footerRow = worksheet.getRow(currentRow);
  footerRow.height = 22;
  footerRow.getCell(1).value = 'Bag total';
  footerRow.getCell(1).style = createSummaryBodyStyle({
    align: 'left',
    bold: true,
    fillArgb: COLORS.mutedFill,
  });

  summary.sizeNames.forEach((sizeName, index) => {
    const cell = footerRow.getCell(index + 2);
    cell.value = summary.totals[sizeName] ?? 0;
    cell.style = createSummaryFooterNumericStyle(COLORS.mutedFill);
  });

  footerRow.getCell(totalColumnIndex).value = summary.grandTotal;
  footerRow.getCell(totalColumnIndex).style = createSummaryFooterNumericStyle(
    COLORS.primarySoftFill,
  );

  return currentRow + 2;
}

export function writeStorageReportSummaryWorksheet(
  workbook: ExcelJS.Workbook,
  summaries: StorageReportSummaryTable[],
  coldStorageName: string,
  quantityModeLabel: string,
): void {
  const worksheet = workbook.addWorksheet('Summary', {
    views: [{ showGridLines: false }],
  });

  const titleRow = worksheet.getRow(1);
  titleRow.height = 28;
  titleRow.getCell(1).value = coldStorageName;
  titleRow.getCell(1).style = {
    font: {
      name: 'Calibri',
      size: 16,
      bold: true,
      color: { argb: COLORS.primary },
    },
    alignment: { vertical: 'middle', horizontal: 'left' },
  };

  const subtitleRow = worksheet.getRow(2);
  subtitleRow.height = 20;
  subtitleRow.getCell(1).value = `Summary tables (${quantityModeLabel})`;
  subtitleRow.getCell(1).style = {
    font: {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: COLORS.primary },
    },
    alignment: { vertical: 'middle', horizontal: 'left' },
  };

  const brandingRow = worksheet.getRow(3);
  brandingRow.height = 16;
  brandingRow.getCell(1).value = `${COLDOP_BRANDING.label}${COLDOP_BRANDING.name}`;
  brandingRow.getCell(1).style = {
    font: {
      name: 'Calibri',
      size: 9,
      color: { argb: COLORS.mutedForeground },
    },
    alignment: { vertical: 'middle', horizontal: 'left' },
  };

  let currentRow = 5;

  for (const summary of summaries) {
    currentRow = writeSummaryTableToWorksheet(worksheet, currentRow, summary);
  }

  const maxColumnCount = Math.max(
    ...summaries.map((summary) =>
      hasSummaryTableData(summary) ? summary.sizeNames.length + 2 : 2,
    ),
    2,
  );

  autoFitSummaryColumns(worksheet, maxColumnCount);

  worksheet.pageSetup = {
    paperSize: 9,
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.4,
      right: 0.4,
      top: 0.5,
      bottom: 0.5,
      header: 0.2,
      footer: 0.2,
    },
  };

  worksheet.headerFooter.oddFooter = `&C${COLDOP_BRANDING.label}&"Calibri,Bold"${COLDOP_BRANDING.name}`;
}

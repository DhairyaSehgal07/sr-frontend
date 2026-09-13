import { format } from 'date-fns';
import type { Table } from '@tanstack/react-table';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';

import type { StorageGatePass } from '@/features/storage/api/types';
import type { StorageQuantityMode } from '@/features/storage-report/components/columns';
import { buildStorageReportSummaries } from '@/features/storage-report/utils/build-storage-report-summaries';
import {
  buildFilterSummaryLines,
  collectExportRows,
  exportCellValueToDisplay,
  formatDateRangeLabel,
  getColumnExportLabel,
  getExportCellForRow,
  getFilteredLeafRowCount,
  getFooterExportValue,
  isSummableExportColumn,
} from '@/features/storage-report/utils/export-cell-value';
import {
  buildSummaryPreviewStyles,
  buildSummarySectionsHtml,
} from '@/features/storage-report/utils/render-storage-report-summary-html';
import { COLDOP_BRANDING, EXPORT_THEME_CSS } from '@/lib/export-report-theme';

export const STORAGE_REPORT_DOWNLOAD_EXCEL_MESSAGE = 'kf-storage-report-download-excel' as const;

export const STORAGE_REPORT_DOWNLOAD_EXCEL_DONE_MESSAGE =
  'kf-storage-report-download-excel-done' as const;

export type PreviewStorageReportOptions = {
  table: Table<ReportFeatures, StorageGatePass>;
  coldStorageName: string;
  quantityMode: StorageQuantityMode;
  reportTitle?: string;
  dateFrom?: string;
  dateTo?: string;
  generatedAt?: Date;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildPreviewStyles(): string {
  const theme = EXPORT_THEME_CSS;

  return `
    :root {
      color-scheme: light;
      --primary: ${theme.primary};
      --foreground: ${theme.foreground};
      --muted: ${theme.mutedForeground};
      --border: ${theme.border};
      --muted-fill: ${theme.mutedFill};
      --primary-muted: ${theme.primaryMutedFill};
      --primary-soft: ${theme.primarySoftFill};
      --zebra: ${theme.zebraFill};
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 1.5rem;
      font-family: Inter, system-ui, -apple-system, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: var(--foreground);
      background: ${theme.background};
    }
    .report-header { margin-bottom: 1rem; }
    .report-header h1 {
      margin: 0 0 0.25rem;
      font-family: Outfit, Inter, sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--primary);
      letter-spacing: -0.02em;
    }
    .report-header h2 {
      margin: 0 0 0.5rem;
      font-family: Outfit, Inter, sans-serif;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--primary);
    }
    .meta, .filters, .branding {
      margin: 0.25rem 0;
      color: var(--muted);
      font-size: 0.875rem;
    }
    .branding { margin-top: 0.5rem; }
    .branding strong { color: var(--primary); font-weight: 600; }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      margin: 1rem 0;
    }
    .toolbar button {
      font: inherit;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid var(--border);
      background: ${theme.background};
      color: var(--foreground);
      cursor: pointer;
    }
    .toolbar button.primary {
      background: var(--primary);
      border-color: var(--primary);
      color: ${theme.primaryForeground};
    }
    .toolbar button:hover:not(:disabled) { opacity: 0.92; }
    .toolbar button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .table-wrap {
      overflow: auto;
      border: 1px solid var(--border);
      border-radius: 0.75rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
      font-variant-numeric: tabular-nums;
    }
    thead th {
      position: sticky;
      top: 0;
      z-index: 1;
      padding: 0.625rem 0.75rem;
      text-align: left;
      font-weight: 600;
      color: var(--primary);
      background: var(--muted-fill);
      border-bottom: 2px solid var(--border);
      white-space: nowrap;
    }
    thead th.numeric { text-align: right; }
    tbody td {
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
      white-space: pre-line;
    }
    tbody td.numeric { text-align: right; font-weight: 500; }
    tbody td.empty { color: var(--muted); }
    tbody tr:nth-child(even):not(.group-row) { background: var(--zebra); }
    tbody tr.group-row { background: var(--primary-muted); font-weight: 600; }
    tbody tr.group-row td { color: var(--primary); }
    tfoot td, tfoot th {
      padding: 0.625rem 0.75rem;
      font-weight: 600;
      color: var(--primary);
      background: var(--primary-soft);
      border-top: 2px solid var(--border);
    }
    tfoot .numeric { text-align: right; }
    ${buildSummaryPreviewStyles()}
    @media print {
      body { padding: 0.5rem; }
      .toolbar { display: none; }
      thead th { position: static; }
    }
  `;
}

export function buildStorageReportPreviewHtml({
  table,
  coldStorageName,
  quantityMode,
  reportTitle = 'Storage Report',
  dateFrom,
  dateTo,
  generatedAt = new Date(),
}: PreviewStorageReportOptions): string {
  const visibleColumns = table.getVisibleLeafColumns();
  const exportRows = collectExportRows(table);
  const filteredLeafCount = getFilteredLeafRowCount(table);
  const filterSummaryLines = buildFilterSummaryLines(table, quantityMode);
  const filteredRows = table.getFilteredRowModel().rows;

  const metadataText = [
    `Generated: ${format(generatedAt, 'do MMM yyyy, h:mm a')}`,
    `Period: ${formatDateRangeLabel(dateFrom, dateTo)}`,
    `${filteredLeafCount.toLocaleString('en-IN')} ${filteredLeafCount === 1 ? 'entry' : 'entries'}`,
  ].join('  |  ');

  const filterText =
    filterSummaryLines.length > 0 ? filterSummaryLines.join('\n') : 'Filters: none applied';

  const summaries = buildStorageReportSummaries(table, quantityMode);
  const summarySectionsHtml = buildSummarySectionsHtml(summaries);

  const headerCells = visibleColumns
    .map((column) => {
      const isNumeric = column.columnDef.meta?.align === 'right';
      const label = escapeHtml(getColumnExportLabel(column));
      return `<th class="${isNumeric ? 'numeric' : ''}">${label}</th>`;
    })
    .join('');

  const bodyRows = exportRows
    .map((row) => {
      const isGroupRow = row.getIsGrouped();
      const rowClass = isGroupRow ? 'group-row' : '';

      const cells = visibleColumns
        .map((column) => {
          const isNumeric = column.columnDef.meta?.align === 'right';
          const exportCell = getExportCellForRow(row, column, quantityMode);
          const display = exportCellValueToDisplay(exportCell);
          const classNames = [
            isNumeric ? 'numeric' : '',
            exportCell.kind === 'empty' ? 'empty' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return `<td class="${classNames}">${escapeHtml(display)}</td>`;
        })
        .join('');

      return `<tr class="${rowClass}">${cells}</tr>`;
    })
    .join('');

  const footerCells = visibleColumns
    .map((column, columnIndex) => {
      const columnId = column.id;
      const isNumeric = column.columnDef.meta?.align === 'right';
      const className = isNumeric ? 'numeric' : '';

      if (columnIndex === 0) {
        return `<th scope="row">Total</th>`;
      }

      if (isSummableExportColumn(columnId)) {
        const exportCell = getFooterExportValue(columnId, filteredRows, quantityMode);
        const display = exportCellValueToDisplay(exportCell);
        return `<td class="${className}">${escapeHtml(display)}</td>`;
      }

      return `<td class="${className}"></td>`;
    })
    .join('');

  const pageTitle = escapeHtml(`${reportTitle} — ${coldStorageName}`);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${pageTitle}</title>
    <style>${buildPreviewStyles()}</style>
  </head>
  <body>
    <header class="report-header">
      <h1>${escapeHtml(coldStorageName)}</h1>
      <h2>${escapeHtml(reportTitle)}</h2>
      <p class="meta">${escapeHtml(metadataText)}</p>
      <p class="filters">${escapeHtml(filterText).replace(/\n/g, '<br />')}</p>
      <p class="branding">${escapeHtml(COLDOP_BRANDING.label)}<strong>${escapeHtml(COLDOP_BRANDING.name)}</strong></p>
    </header>
    <div class="toolbar">
      <button
        type="button"
        id="download-excel-btn"
        class="primary"
        onclick="downloadStorageReportExcel()"
      >
        Download Excel
      </button>
    </div>
    <script>
      (function () {
        var DOWNLOAD_TYPE = ${JSON.stringify(STORAGE_REPORT_DOWNLOAD_EXCEL_MESSAGE)};
        var DONE_TYPE = ${JSON.stringify(STORAGE_REPORT_DOWNLOAD_EXCEL_DONE_MESSAGE)};

        function setDownloadButtonState(isLoading) {
          var button = document.getElementById("download-excel-btn");
          if (!button) return;
          button.disabled = isLoading;
          button.textContent = isLoading ? "Downloading…" : "Download Excel";
        }

        window.downloadStorageReportExcel = function () {
          if (!window.opener) {
            alert("Return to the report page to download Excel.");
            return;
          }
          setDownloadButtonState(true);
          window.opener.postMessage(
            { type: DOWNLOAD_TYPE },
            window.location.origin,
          );
        };

        window.addEventListener("message", function (event) {
          if (event.origin !== window.location.origin) return;
          if (!event.data || event.data.type !== DONE_TYPE) return;
          setDownloadButtonState(false);
        });
      })();
    </script>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>${headerCells}</tr>
        </thead>
        <tbody>
          ${bodyRows}
        </tbody>
        <tfoot>
          <tr>${footerCells}</tr>
        </tfoot>
      </table>
    </div>
    ${summarySectionsHtml}
  </body>
</html>`;
}

export function openStorageReportPreview(options: PreviewStorageReportOptions): Window {
  const html = buildStorageReportPreviewHtml(options);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const previewWindow = window.open(url, '_blank');

  if (!previewWindow) {
    URL.revokeObjectURL(url);
    throw new Error('Pop-up blocked. Allow pop-ups for this site to preview the report.');
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return previewWindow;
}

import {
  formatSummaryBagCount,
  hasSummaryTableData,
  type StorageReportSummaryTable,
} from '@/features/storage-report/utils/build-storage-report-summaries';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildSummaryTableHtml(summary: StorageReportSummaryTable): string {
  if (!hasSummaryTableData(summary)) {
    return `<section class="summary-section">
      <h3 class="summary-title">${escapeHtml(summary.title)}</h3>
      <p class="summary-empty">No data</p>
    </section>`;
  }

  const headerCells = [
    `<th>${escapeHtml(summary.rowHeaderLabel)}</th>`,
    ...summary.sizeNames.map(
      (sizeName) =>
        `<th class="numeric" title="${escapeHtml(sizeName)}">${escapeHtml(sizeName)}</th>`,
    ),
    `<th class="numeric">Total</th>`,
  ].join('');

  const bodyRows = summary.rows
    .map(
      (row) => `<tr>
        <td class="label">${escapeHtml(row.label)}</td>
        ${summary.sizeNames
          .map(
            (sizeName) =>
              `<td class="numeric">${escapeHtml(formatSummaryBagCount(row.values[sizeName] ?? 0))}</td>`,
          )
          .join('')}
        <td class="numeric total-col">${escapeHtml(formatSummaryBagCount(row.total))}</td>
      </tr>`,
    )
    .join('');

  const footerCells = [
    `<th scope="row">Bag total</th>`,
    ...summary.sizeNames.map(
      (sizeName) =>
        `<td class="numeric">${escapeHtml(formatSummaryBagCount(summary.totals[sizeName] ?? 0))}</td>`,
    ),
    `<td class="numeric total-col">${escapeHtml(formatSummaryBagCount(summary.grandTotal))}</td>`,
  ].join('');

  return `<section class="summary-section">
    <h3 class="summary-title">${escapeHtml(summary.title)}</h3>
    <div class="table-wrap summary-table-wrap">
      <table class="summary-table">
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
  </section>`;
}

export function buildSummarySectionsHtml(summaries: StorageReportSummaryTable[]): string {
  return summaries.map((summary) => buildSummaryTableHtml(summary)).join('\n');
}

export function buildSummaryPreviewStyles(): string {
  return `
    .summary-section {
      margin-top: 2rem;
    }
    .summary-title {
      margin: 0 0 0.75rem;
      font-family: Outfit, Inter, sans-serif;
      font-size: 1rem;
      font-weight: 600;
      color: var(--primary);
    }
    .summary-empty {
      margin: 0;
      color: var(--muted);
      font-size: 0.875rem;
    }
    .summary-table-wrap {
      margin-bottom: 0.5rem;
    }
    .summary-table thead th {
      position: static;
    }
    .summary-table tbody td.label {
      font-weight: 600;
      white-space: nowrap;
    }
    .summary-table tbody td.total-col,
    .summary-table tfoot td.total-col {
      background: var(--primary-soft);
      font-weight: 600;
      color: var(--primary);
    }
    .summary-table tfoot th {
      background: var(--muted-fill);
      color: var(--foreground);
    }
    .summary-table tfoot td {
      background: var(--muted-fill);
    }
  `;
}

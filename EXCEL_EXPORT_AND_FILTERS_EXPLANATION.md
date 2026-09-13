# Excel Export and Filter Mechanism - Storage Report

## Overview

This document explains how the Storage Report feature in the kf-frontend application handles Excel exports and previews, with a special focus on how all applied filters are honored and included in the exported data.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Storage Report Component                     │
│                   (src/features/storage-report)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ API Fetch    │  │ Filters      │  │ Table State  │
    │ (Raw Data)   │  │ (Column &    │  │ (TanStack    │
    │              │  │  Advanced)   │  │  React Table)│
    └──────────────┘  └──────────────┘  └──────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │ Table Instance  │
                    │ (Filtered Rows) │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
    ┌────────────┐    ┌────────────┐    ┌────────────┐
    │ Preview    │    │ Download   │    │ Display on │
    │ (HTML in   │    │ (Excel via │    │ Table UI   │
    │ Popup)     │    │ ExcelJS)   │    │            │
    └────────────┘    └────────────┘    └────────────┘
```

## Key Components

### 1. Storage Report Index Component
**Location:** `src/features/storage-report/index.tsx`

**Responsibilities:**
- Manages report state (date range, search query, quantity mode)
- Fetches data from API
- Creates and maintains TanStack React Table instance
- Handles data filtering and transformation
- Orchestrates export/preview workflows

**Key State Variables:**
```typescript
- dateFrom / dateTo       // Date range filters
- searchQuery             // Text search across all data
- reportTable             // TanStack Table instance (holds filtered state)
- quantityMode            // "current" or "initial" quantity display
- appliedParams           // API parameters for server-side filtering
- isExporting             // Loading state during export
```

### 2. Data Table Component
**Location:** `src/features/storage-report/components/data-table.tsx`

**Responsibilities:**
- Renders the table UI
- Manages column visibility, sorting, grouping
- Applies column and advanced filters
- Maintains table row state (expanded, grouped, paginated)

**Filter Types:**
1. **Column Filters** - Individual column value selections
2. **Advanced Filters** - Complex conditions with AND/OR logic
3. **Global Search** - Full-text search across all data
4. **Column Visibility** - Show/hide columns
5. **Sorting** - Sort by any column

### 3. Report Toolbar Component
**Location:** `src/features/storage-report/components/report-toolbar.tsx`

**Responsibilities:**
- Date range input (dateFrom, dateTo)
- Search query input
- Filter configuration UI
- Export/Preview buttons

## How Filters Are Applied

### Step 1: Data Flow from API

```typescript
// In StorageReportPage (index.tsx)
const { data } = useStorageGatePassReport(appliedParams)
const reportRows = data?.data.storageGatePasses ?? []
```

- Server returns full dataset based on API `appliedParams`
- Data is stored in `reportRows` state

### Step 2: Client-Side Filtering Pipeline

```typescript
// Search filtering
const displayedRows = useMemo(() => {
  const query = searchQuery.trim().toLowerCase()
  if (!query) return reportRows
  
  return reportRows.filter((row) => matchesSearch(row, query))
}, [reportRows, searchQuery])
```

**Applied Filters (in order):**
1. **Text Search** (`searchQuery`) - Filters across all row properties
2. **Column Filters** - TanStack React Table `ColumnFiltersState`
3. **Advanced Filters** - Complex conditions via `advancedReportGlobalFilterFn`
4. **Global Filter** - General search state
5. **Row Visibility** - User-selected column visibility

### Step 3: TanStack React Table Processing

```typescript
const tableColumns = useMemo(
  () => getStorageReportColumns(displayedRows, quantityMode),
  [quantityMode, displayedRows],
)

// Table initialization with all row models for filtering
const table = useReactTable({
  data: displayedRows,
  columns: tableColumns,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),  // ← Critical for filtering
  getSortedRowModel: getSortedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  getGroupedRowModel: getGroupedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  state: {
    columnFilters,
    columnOrder,
    columnVisibility,
    expanded,
    globalFilter,
    grouping,
    pagination,
    sorting,
  },
})
```

**Key Methods Used in Export:**
- `table.getVisibleLeafColumns()` - Gets non-hidden columns
- `table.getFilteredRowModel().rows` - Gets rows after all filters
- `table.getAllLeafRows()` - Gets all rows for aggregations

### Step 4: Getting Filtered Data for Export

```typescript
// In exportStorageReportToExcel()
const exportRows = collectExportRows(table)  // Respects all filters
const filteredLeafCount = getFilteredLeafRowCount(table)
const filterSummaryLines = buildFilterSummaryLines(table, quantityMode)
const filteredRows = table.getFilteredRowModel().rows
```

**What This Achieves:**
- `exportRows` includes only rows that pass ALL applied filters
- `filteredLeafCount` shows number of rows being exported
- `filterSummaryLines` documents which filters were applied
- Excel export uses ONLY these filtered rows

## Excel Export Process

### File: `export-storage-report-excel.ts`

**Function Signature:**
```typescript
export async function exportStorageReportToExcel({
  table,                    // TanStack Table instance with filters
  coldStorageName,         // Cold storage identifier
  quantityMode,            // "current" or "initial"
  reportTitle,             // Report name
  dateFrom, dateTo,        // Date range (informational)
  generatedAt,             // Timestamp
}): Promise<void>
```

**Export Pipeline:**

```
1. Load ExcelJS Library
   ↓
2. Extract Visible Columns from Filtered Table
   - Only columns user hasn't hidden are included
   - VisibleLeafColumns excludes grouped columns
   ↓
3. Collect Export Rows
   - collectExportRows(table) returns only filtered rows
   - Includes: column filters, advanced filters, search query
   ↓
4. Create Excel Workbook
   ↓
5. Add Metadata Section
   - Cold Storage Name (merged cells row 1)
   - Report Title (merged cells row 2)
   - Generated timestamp, Date range, Total filtered entries count
   - Filter summary (which filters were applied)
   ↓
6. Add Table Headers
   - Visible column names
   - Formatted with styles (bold, colored background)
   ↓
7. Add Data Rows
   - Only filtered rows from table.getFilteredRowModel()
   - Cell values formatted according to column type
   - Numbers formatted in Indian locale (en-IN)
   ↓
8. Add Footer Totals
   - Sums for summable columns (e.g., totalBags)
   - Only calculated from visible filtered rows
   ↓
9. Apply Formatting
   - Auto-fit column widths
   - Apply borders and colors
   - Add branding footer
   ↓
10. Download File
    - Filename: "{storage-name}_{timestamp}_storage-report.xlsx"
    - Uses downloadBlob utility
```

## How All Filters Are Honored

### 1. Filter Types Respected

#### Column Filters
```typescript
// User selects specific values for a column
// Example: Select only "WHEAT" bag types
columnFilters: [
  { id: 'bagType', value: ['WHEAT'] }
]

// TanStack's getFilteredRowModel() applies this
// Only rows with bagType === 'WHEAT' are exported
```

#### Advanced Filters
```typescript
// Complex conditions with AND/OR logic
// Example: (accountNumber > 100 AND totalBags < 50) OR (status = 'ACTIVE')
globalFilter: {
  logic: 'OR',
  conditions: [
    { id: '1', columnId: 'accountNumber', operator: 'greaterThan', value: '100' },
    { id: '2', columnId: 'totalBags', operator: 'lessThan', value: '50' }
  ]
}

// advancedReportGlobalFilterFn evaluates all conditions
// Only matching rows pass through to export
```

#### Text Search
```typescript
// User enters search text
searchQuery = "FARMER"

// matchesSearch() checks all row properties
// Only rows where JSON.stringify(row).includes("FARMER") are exported
```

#### Column Visibility
```typescript
// User hides/shows columns in table
columnVisibility: {
  'accountNumber': false,  // Hidden columns not exported
  'gatePassNo': true,      // Visible columns exported
  'bagTypes': true
}

// getVisibleLeafColumns() ensures only visible columns in Excel
```

#### Sorting (for display order)
```typescript
// Table can be sorted, but doesn't filter rows
// All sorted rows are still exported
// Sort order is preserved in export
```

### 2. Filter Execution Order (TanStack React Table Pipeline)

```typescript
// Data flows through this pipeline:
1. Core rows (displayedRows after text search)
2. → Apply columnFilters (selectedValuesFilterFn)
3. → Apply globalFilter (advancedReportGlobalFilterFn)
4. → Apply sorting
5. → Apply grouping
6. → Apply pagination
7. → Result: filtered rows ready for export

// table.getFilteredRowModel().rows returns rows at step 3
// This is what gets exported
```

### 3. Key Code That Honors Filters

```typescript
// In export-storage-report-excel.ts
const exportRows = collectExportRows(table)
const filteredRows = table.getFilteredRowModel().rows

// collectExportRows internally:
export function collectExportRows(table: Table<StorageGatePass>): Row<StorageGatePass>[] {
  return table.getFilteredRowModel().rows
}

// This directly uses TanStack's filtered rows model
// Guarantees all active filters are respected
```

### 4. Filter Summary in Excel

Excel file includes a "Filter Applied" section documenting:

```typescript
// From buildFilterSummaryLines():
[
  "Bag Type: WHEAT, RICE",
  "Gate Pass No > 100",
  "Created Date: 2024-01-01 to 2024-12-31",
  "Search: 'farmer'"
]

// These appear in Excel as informational text
// Shows what filters produced this export
```

## Excel Preview Process

### File: `preview-storage-report-html.ts`

**Preview Flow:**

```
1. User clicks "Preview" button
   ↓
2. HTML template is generated (openStorageReportPreview)
   - Contains filtered data formatted as HTML
   - CSS for print styling
   - Same filter honors as Excel export
   ↓
3. New browser window/tab opens with preview
   ↓
4. User can:
   - Print to PDF (respects HTML formatting)
   - Download as Excel (via postMessage)
   - View filtered data on screen
   ↓
5. Download Excel from Preview
   - Preview window sends postMessage event
   - Main window receives STORAGE_REPORT_DOWNLOAD_EXCEL_MESSAGE
   - Triggers handleExportExcel() with same table state
   - Excel is downloaded with ALL filters applied
```

**Key Communication:**
```typescript
// Preview → Main Window
previewWindow.postMessage(
  { type: STORAGE_REPORT_DOWNLOAD_EXCEL_MESSAGE },
  window.location.origin
)

// Main Window receives and exports
window.addEventListener('message', (event) => {
  if (event.data?.type === STORAGE_REPORT_DOWNLOAD_EXCEL_MESSAGE) {
    handleExportExcel()  // Export with current filtered table
  }
})
```

## Data Preservation in Export

### Cell Value Handling

```typescript
// Different data types are preserved:
export type ExportCellValue =
  | { kind: "text"; value: string }
  | { kind: "number"; value: number; format: "integer" }
  | { kind: "empty" }

// Numbers:
- Account numbers, Gate Pass numbers preserved as integers
- Formatted in Indian locale (e.g., 10,00,000)
- Custom number format applied in Excel

// Text:
- Chamber-Floor-Row locations
- Bag types, names, addresses
- Preserved as-is

// Dates:
- Formatted to readable format (e.g., "23rd June 2024")
- Parser handles multiple date formats

// Empty cells:
- Explicitly marked as empty
- Prevents formula errors
```

### Quantity Mode Handling

```typescript
// Export respects quantity mode selection:
quantityMode = "current" | "initial"

// For each bag size column:
if (quantityMode === "current") {
  useQuantity = bag.currentQuantity
} else {
  useQuantity = bag.initialQuantity
}

// All rows export with selected quantity mode
// Totals calculated using selected mode
```

## Performance Considerations

### 1. Lazy Loading of ExcelJS

```typescript
const ExcelJS = await loadExcelJS()  // Dynamic import

// Vite Configuration (vite.config.ts):
// exceljs is split into separate chunk (~930 KB)
// Only loaded when user exports (not on initial page load)
// Improves app startup time
```

### 2. Memory Usage

```typescript
// Large datasets:
- Only filtered rows loaded into memory
- Excel workbook built incrementally
- Worksheet cells written row-by-row
- File streamed to blob for download
```

### 3. Processing Time

- Filtering: O(n) where n = number of rows
- Export: O(visible_columns × filtered_rows)
- Complex filters may take seconds for large datasets
- UI shows loading state (isExporting flag)

## Validation and Error Handling

```typescript
// Checks before export:
if (filteredRowCount === 0) {
  toast.error("No rows to export. Adjust filters or load report data.")
  return
}

// Error handling:
try {
  await exportStorageReportToExcel({...})
  toast.success("Report exported to Excel")
} catch (exportError) {
  toast.error(exportError.message)
}
```

## Summary: Complete Filter Honor Chain

1. **Data Load** → API returns full dataset
2. **Text Search** → Filter rows in memory
3. **Display** → Show filtered rows in table
4. **Column State** → Track column filters, visibility, sorting
5. **Export Button Click** → Capture current filtered table state
6. **Excel Generation** → Use `table.getFilteredRowModel().rows`
7. **File Download** → Contains only filtered rows + metadata

**Guarantee:** Every active filter (column filter, advanced filter, text search, visibility) is applied to the exported Excel file. The exported file always matches what user sees on screen (before pagination).

## File References

| File | Purpose |
|------|---------|
| `src/features/storage-report/index.tsx` | Main component, state management |
| `src/features/storage-report/components/data-table.tsx` | Table rendering, filter application |
| `src/features/storage-report/components/report-toolbar.tsx` | UI controls for filters |
| `src/features/storage-report/utils/export-storage-report-excel.ts` | Excel generation |
| `src/features/storage-report/utils/export-cell-value.ts` | Cell value formatting |
| `src/features/storage-report/utils/report-filter-fns.ts` | Filter logic definitions |
| `src/features/storage-report/utils/preview-storage-report-html.ts` | HTML preview generation |
| `src/lib/load-exceljs.ts` | ExcelJS dynamic import |
| `src/lib/export-report-theme.ts` | Excel styling constants |

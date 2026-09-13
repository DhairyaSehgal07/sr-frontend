# Outgoing form — Gate Pass Grid UI guide

Purpose
- Describe the gate-pass grid UI used by the `CreateOutgoingForm` so another LLM or developer can reproduce it in another project.

Where it lives (in this repo)
- Page / form: [src/features/outgoing/forms/create-outgoing-form.tsx](src/features/outgoing/forms/create-outgoing-form.tsx)
- Gate-pass UI section: [src/features/transfer-stock/forms/transfer-gate-passes-section.tsx](src/features/transfer-stock/forms/transfer-gate-passes-section.tsx)
- Grid / matrix: [src/features/transfer-stock/forms/transfer-gate-pass-matrix.tsx](src/features/transfer-stock/forms/transfer-gate-pass-matrix.tsx)
- Data types & utils: [src/features/transfer-stock/types/storage-gate-pass.ts](src/features/transfer-stock/types/storage-gate-pass.ts), [src/features/transfer-stock/utils/gate-pass-matrix-utils.ts](src/features/transfer-stock/utils/gate-pass-matrix-utils.ts)

High-level UI summary
- The gate-pass grid is a searchable, filterable, and columnar matrix of storage gate passes grouped by date. Each row is a gate pass (voucher) and each visible column after the first two fixed columns is a bag-size lane. Each size lane cell contains one or more "slot" buttons representing bag slots (location + available quantity).
- The two fixed columns are:
  - A checkbox to select the entire voucher (sticky left).
  - R. Voucher column showing gate pass number (sticky left next to checkbox).
- Size columns are horizontally scrollable and styled as alternating lanes. Head cells show the size name; body cells show slot buttons or an empty seat if no slots.

Visible toolbar and controls
- Search box: text input filtering voucher number or manual parchi number. Controlled by `matrix.gatePassSearch`.
- Sort buttons: Ascending / Descending sort on voucher number (`matrix.voucherSort`).
- Sizes dropdown: multi-checkbox dropdown to toggle which sizes are visible; there is an "All" option and individual sizes come from the dataset (`matrix.sizesForColumnPicker`).
- Variety filter: radio-style dropdown (or picker) to choose a variety. When no variety is selected but varieties exist, the UI highlights this requirement and prompts the user to select one (`matrix.needsVarietySelection`).
- Location filters: chamber / floor / row radio pickers that restrict displayed slots.
- Reset button: resets all filters, clears selected vouchers and allocations.

Main components and responsibilities
- `CreateOutgoingForm`
  - Passes `farmerStorageLinkId` down to `TransferGatePassesSection` (via form subscription) and receives `allocations` back.
  - Calls the review sheet where `buildTransferItems(allocations, passes)` converts allocations into outgoing items.
- `TransferGatePassesSection`
  - Orchestrates loading: uses `useStorageGatePassesForFarmer(farmerStorageLinkId)` to fetch `allPasses`.
  - Uses `useTransferGatePassMatrix` hook to compute filters, visible sizes, grouped display data and provide action handlers.
  - Renders the toolbar (search, sort, sizes, variety, location, reset) and the `TransferGatePassMatrix` component.
- `TransferGatePassMatrix`
  - Renders the matrix table with sticky columns and size lanes.
  - Renders `SlotButton` elements for each bag-slot; clicking opens `TransferAllocationSheet` (a modal) to set allocation quantity for that slot.
  - Handles voucher checkbox toggles (selecting a voucher pre-fills allocations for that voucher via `buildAllocationsFromPass`).

Data shapes you need to replicate
- StorageGatePass (source of truth for each row):
  - `_id`: string
  - `gatePassNo`: number (voucher)
  - `manualGatePassNumber`: number (optional)
  - `date`: ISO string (used for grouping)
  - `variety`: string
  - `bagSizes`: array of bag slot objects with fields: `size`, `currentQuantity`, `initialQuantity`, `bagType`, `chamber`, `floor`, `row`.

- Allocation key format (how selection is tracked):
  - `allocationKey(passId, sizeName, bagIndex)` produces a string using the unit separator `\u001f` between parts.
  - Allocation map: Record<allocationKey, number>. Zero-or-missing means not selected.

How interactions map to state & hooks
- Data fetch: `useStorageGatePassesForFarmer(farmerStorageLinkId)` → `allPasses`.
- Matrix hook: `useTransferGatePassMatrix({ allPasses, allocations, onAllocationsChange })` returns:
  - `displayGroups`: Date-grouped passes ready to iterate rows by date.
  - `visibleSizes`: array of size column names shown.
  - `selectedPassIds`: Set of pass ids currently checked.
  - `handlePassToggle(passId)`: selects/deselects voucher and fills/clears allocations for that pass.
  - `handleSlotClick` (in `TransferGatePassMatrix`): opens allocation sheet for a single slot. The allocation sheet calls `onAllocationChange(key, qty)`.

UI details to reimplement
- Table layout
  - Fixed left sticky columns for checkbox and voucher. The rest columns are size lanes that can scroll horizontally.
  - Header row contains size names centered. Rows are grouped by date — a full-width row with date label appears before its passes.
  - Alternate lane background styling is used to visually separate columns.

- Slot button
  - Shows short location (e.g. `Ch: A · F: 2 · R: 5`) and available quantity aligned right.
  - If selected, a small badge overlays top-right showing selected quantity.
  - Accessible label includes variety, size, location and available/selected counts.

- Empty seat
  - When a pass has no slots for a size, render a disabled `EmptySeat` button with dashed border for visual consistency.

Behavior rules and edge cases
- If `uniqueVarieties.length > 0 && varietyFilter is empty` the UI marks variety selection as required (`needsVarietySelection`) and prevents showing the matrix until a variety is chosen.
- `visibleSizes` are computed from filtered passes; the column picker falls back to `allTableSizes` when no table sizes available.
- Selecting a voucher populates allocations for all visible sizes in that voucher with the slot `currentQuantity` per bag slot (via `buildAllocationsFromPass`). Deselecting removes keys belonging to that pass.
- Allocations are an ephemeral map used by the form; `buildTransferItems(allocations, passes)` converts them into items used for submitting/review.

Accessibility notes
- Sticky column cells keep checkbox and voucher visible while horizontally scrolling size lanes; ensure `aria-label` on checkboxes and buttons.
- Buttons use clear accessible labels; the slot `aria-label` includes both location and quantity context.

Minimal JSON examples to give to another LLM
- Example StorageGatePass (single pass):

```json
{
  "_id": "pass_123",
  "gatePassNo": 4321,
  "manualGatePassNumber": 12,
  "date": "2026-08-16T09:00:00.000Z",
  "variety": "Apple",
  "bagSizes": [
    { "size": "10kg", "currentQuantity": 20, "initialQuantity": 20, "bagType": "jute", "chamber": "A", "floor": "1", "row": "5" },
    { "size": "5kg", "currentQuantity": 10, "initialQuantity": 10, "bagType": "jute", "chamber": "A", "floor": "1", "row": "6" }
  ],
  "remarks": ""
}
```

- Example allocations map (two slots selected):

```json
{
  "pass_123\u001f10kg\u001f0": 5,
  "pass_123\u001f5kg\u001f0": 3
}
```

Checklist for reproducing in another project
- UI primitives: table with sticky left columns, horizontal scrollable lanes, small toolbar for filters
- Data: grouped passes by date, per-pass bag slot arrays, allocation key format using `\u001f` separator
- Interactions: search, variety radio, location pickers, size column toggles, voucher select (bulk prefill), slot click (open allocation modal), per-slot allocation badge
- Accessibility: labels for checkbox and slot buttons, keyboard focus states for slots and dropdowns, aria-hidden decorative icons

Files & symbols to point the LLM to (for cross-repo context)
- `TransferGatePassesSection` — toolbar orchestration
- `useTransferGatePassMatrix` — filter/visible-size/selection logic
- `TransferGatePassMatrix` — table rendering and slot UI
- `gate-pass-matrix-utils` — `allocationKey`, `buildAllocationsFromPass`, `getBagSlotsForSize`, `groupPassesByDate`, `buildTransferItems`

Suggested prompt snippet for another LLM
"Recreate a horizontally-scrollable gate-pass matrix UI that: groups voucher rows by date; uses two left sticky columns (select checkbox and voucher number); shows dynamic size columns populated from dataset; displays per-size, per-pass slot buttons with location and available quantity; supports searching, variety selection, chamber/floor/row filters, size visibility toggles, voucher select (prefill allocations) and per-slot allocation modal. Data format: StorageGatePass (see example). Allocation keys use unit separator `\u001f`. Provide component structure, props, and minimal CSS guidelines for sticky columns and alternating size lane backgrounds."

-- end

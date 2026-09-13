# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.1] - 2026-06-12

Outgoing and transfer stock flows are now API-backed end to end, with a unified daybook feed for storage and outgoing gate passes, cancel support on outgoing cards, and a transfer stock report route.

### Added

- **Daybook API** — Unified `/daybook/` fetch helper, query keys, typed entry shapes (storage and outgoing), and React Query hook with list params for type, sort, page, and limit.
- **Daybook outgoing gate pass card** — Expandable card with bag breakdown, route/vehicle details, cancel flow with confirmation dialog and remarks, and loading skeleton.
- **Outgoing gate pass API** — Create and cancel helpers, typed request/response shapes, React Query mutation hooks, and cache invalidation for daybook and voucher numbers.
- **Create outgoing form** — Submits through the API with live voucher numbers, optional manual gate pass number, from/to/truck fields, review sheet updates, and success/error toasts.
- **Transfer stock API** — Create helper, typed body/response shapes, React Query mutation hook, and voucher-number cache invalidation on success.
- **Create transfer stock form** — Submits through the API with three live voucher numbers (transfer, outgoing, destination storage), truck number field, review sheet vehicle section, and success/error toasts.
- **Transfer stock report** — `/transfer/report` page with API-backed table, loading/error/empty states, and sidebar/topbar navigation entry.
- **UI** — shadcn `AlertDialog` for destructive confirmations.

### Changed

- **Daybook storage tab** — Loads mixed storage and outgoing entries from the unified daybook API; URL-synced type filter (all/incoming/outgoing), sort, page size, and pagination; gate-pass search disabled pending API support.
- **Daybook search params** — `type`, `sortBy`, `page`, and `limit` added to the daybook route search schema.
- **Voucher number hook** — Supports `outgoing-gate-pass` and `transfer-stock-gate-pass` receipt numbers.
- **Create storage gate pass** — Invalidates daybook list queries on successful create.
- **Button secondary variant** — Hover uses a subtle foreground mix for clearer feedback in light and dark themes.

## [0.4.0] - 2026-06-11

Booking gate passes are now API-backed end to end: create and edit flows with review sheets, a live daybook tab with search and pagination, and shared potato variety options across gate pass forms.

### Added

- **Booking gate pass API** — Create, list, search, update, by-ID lookup, cache lookup, query keys, typed request/response shapes, and React Query hooks for `/booking-gate-pass/`.
- **Booking gate pass card** — `BookingGatePassCard` and skeleton with expandable bag-size details, dispatch ledger info, and edit navigation.
- **Create booking form** — Submits through the API with live voucher numbers, date and manual gate pass fields, review sheet before submit, and dispatch ledger combobox with inline add-ledger dialog.
- **Edit booking form** — `/booking/$id` loads an existing gate pass, pre-fills the shared booking form, supports review before submit, and updates with success/error toasts.
- **Booking summary sheet & table** — Review UI for create/edit flows with bag-size totals and dispatch ledger labels.
- **Daybook booking tab** — Loads booking gate passes from the API with sort, configurable page size, pagination, debounced gate-pass-number search, refresh, loading/error/empty states, and a collapsible booking summary panel (placeholder totals until summary API is connected).
- **Potato variety constants** — Shared `POTATO_VARIETIES` and `POTATO_VARIETY_OPTIONS` in `constants.ts` for consistent variety pickers across the app.

### Changed

- **Voucher number hook** — Supports `booking-gate-pass` receipt numbers for create booking.
- **Gate pass variety pickers** — Incoming, grading, storage, dispatch pre-storage, and booking forms use the shared potato variety list instead of local hardcoded options.
- **Grading select step** — Variety combobox uses shared options while still allowing legacy values from existing records.
- **Gate pass update payloads** — Incoming, grading, and storage update mappers always send trimmed remarks (including empty) so cleared remarks persist on save.

## [0.3.9] - 2026-06-06

People now includes a farmer profile page with API-backed gate pass history, summary stats, and tabbed review across incoming, grading, storage, and dispatch pre-storage.

### Added

- **Farmer profile page** — `/people/$id` shows farmer details, bag-count summary cards, and tabbed gate pass lists with loading, error, empty, and refresh states.
- **Farmer storage link gate passes API** — Fetch helper, React Query hook, query keys, typed response shapes, and normalization for `/farmer-storage-link/:id/gate-passes`.
- **Farmer profile search params** — People cards pass name, mobile, account number, and address into the profile route for instant header display.

### Changed

- **Grading gate pass card** — Resolves incoming gross/tare weights from nested weight slips when top-level values are absent.
- **Gate pass types** — Grading incoming refs, incoming farmer storage links, and storage gate passes accept optional fields aligned with API payloads (weight slip refs, linked-by metadata, generation, stage).

## [0.3.8] - 2026-06-02

Incoming report now supports polished export flows with Excel download and printable HTML preview, plus supporting formatter and toolbar updates.

### Added

- **Incoming report export helpers** — New utilities to format export cell values, generate themed Excel files, and build printable HTML previews for incoming report rows.
- **Shared export utilities** — Blob download helper and report export theme utilities for consistent file naming and presentation.

### Changed

- **Incoming report toolbar** — Added export actions and improved report controls for download/preview workflows.
- **Incoming report formatting** — Updated formatter behavior to align table values with export output.
- **Incoming gate pass card** — Supporting UI updates to keep report-linked data presentation consistent.

## [0.3.7] - 2026-05-30

Analytics now loads live incoming, grading, and storage data with date filters, Recharts visualizations, a variety-by-size stock summary table, and a chamber/floor/row location dashboard.

### Added

- **Analytics date filters** — Shared from/to date params on the overview with apply/reset actions and query-key integration across tabs.
- **Incoming analytics API** — Variety distribution and daily/monthly trend fetch helpers with React Query keys and typed response shapes.
- **Grading analytics API** — Size distribution and area-wise size distribution fetch helpers with normalized response types.
- **Storage analytics API** — Storage summary and storage location-wise fetch helpers for variety/size totals and chamber/floor/row inventory.
- **Incoming analytics charts** — Variety distribution and daily/monthly trend Recharts views with loading, error, and empty states.
- **Grading analytics charts** — Size distribution and area-wise size distribution Recharts views with shared chart palette and size ordering.
- **Storage summary table** — Variety-by-size matrix with current, initial, and outgoing quantity tabs, column totals, and retry on error.
- **Storage location dashboard** — Cold storage inventory cards, chamber/floor/row cards, variety legend, search and variety filters, location and variety-summary tabs, and quantity mode switching.
- **Chart UI** — shadcn `Chart` primitives with theme chart tokens; `recharts` dependency for analytics visualizations.

### Changed

- **Analytics overview** — Tabs for incoming, grading, storage, and dispatch pre-storage now load API-backed content instead of placeholder metrics.
- **Analytics storage tab** — Replaces raw JSON review with the stock summary table and location-wise dashboard.
- **Analytics JSON section** — Shared loading/error/retry wrapper retained for dispatch pre-storage and interim grading/incoming sections where charts are not yet the sole view.

## [0.3.6] - 2026-05-27

Dispatch pre-storage now includes API-backed Nikasi gate pass creation and list workflows, with updated cards and summary review support.

### Added

- **Nikasi gate pass API** — Create/list helpers, typed request-response shapes, React Query hooks, and dispatch pre-storage query integration.
- **Nikasi gate pass card** — A dedicated card UI for Nikasi entries with details optimized for dispatch pre-storage review.
- **Dispatch pre-storage summary sheet** — Review sheet support for dispatch pre-storage create flow before final submission.
- **Dispatch ledger parties panel** — People tab panel for dispatch-ledger party selection in dispatch workflows.

### Changed

- **Dispatch pre-storage tab** — Loads and renders Nikasi gate passes using the new API-backed flow.
- **Dispatch pre-storage form** — Updated create form flow to align with Nikasi creation and summary review behavior.
- **Shared constants and storage card** — Minor supporting updates for list/display consistency across related gate pass views.

## [0.3.5] - 2026-05-27

People now includes API-backed dispatch ledger management with create and list workflows.

### Added

- **Dispatch ledger API** — Fetch and create helpers, React Query hooks, query keys, and typed response shapes for `/dispatch-ledger`.
- **Add dispatch ledger dialog** — TanStack Form + Zod dialog for name, address, and optional Indian mobile number with success/error toasts.
- **Dispatch ledger cards** — Dispatch ledger tab loads live records with search, newest/oldest sorting, refresh, loading, error, and empty states.

### Changed

- **People forms** — Farmer and dispatch ledger dialog field spacing is tighter for quicker data entry.

## [0.3.4] - 2026-05-26

Additional tools now include API-backed chamber temperature monitoring with preset comparisons, trend review, and create/edit workflows.

### Added

- **Temperature API** — Fetch, create, and update helpers, React Query hooks, query keys, and typed payloads for `/temperature`.
- **Temperature page** — `/additional/temperature` shows chamber presets, latest average, API refresh status, date/search filters, loading/error/empty states, and an editable records table.
- **Temperature trend chart** — Responsive multi-chamber line chart for reviewing movement across filtered records.
- **Temperature reading dialog** — Add and update chamber readings by date, time, and per-chamber value with mutation toasts.

### Changed

- **Additional page** — `/additional` is now a tool hub with a temperature card, nested route files, and a topbar title for the temperature route.

## [0.3.3] - 2026-05-26

Grading and incoming reviews now separate bardana from product weight, while storage gate passes carry stage information through create, edit, display, and audit flows.

### Added

- **Incoming net weight helper** — Shared grading utility resolves incoming gross/tare values and formats product net weight after bardana deduction.
- **Grading weight review** — Grading cards, summary sheets, and selected incoming tables show gross, tare, bardana, product net weight, graded output weight, and wastage totals.
- **Storage stage field** — Create/edit storage flows, API payloads, gate pass display, summary sheets, form defaults, validation, and audit formatting now include optional stage.

### Changed

- **Grading selection table** — Incoming gate pass selection supports net-weight display and refined linked-gate-pass resolution for edit flows.
- **Incoming review** — Incoming summary sheets and cards now show bardana and net product weight separately from weighbridge net weight.

## [0.3.2] - 2026-05-26

Storage report views now support saved table settings, richer filters, grouping, sorting, and paginated review for large report runs.

### Added

- **Storage report toolbar** — Date filters, text search, refresh, and view settings are combined into a responsive report toolbar.
- **Storage report view settings** — Filters, columns, grouping, and advanced logic tabs let users refine report views without leaving the table.
- **Storage report column defaults** — Browser-local storage saves column visibility and order preferences for repeat report review.

### Changed

- **Storage report table** — Adds sorting, pagination, grouping, aggregate quantity rows, and column-aware filtering for denser report analysis.
- **Storage report columns** — Bag-size columns now expose numeric accessors, sum aggregation, filter labels, and report-specific sort behavior.

## [0.3.1] - 2026-05-26

Storage gate passes can now be edited, audited, and reviewed through API-backed storage report and edit-history views.

### Added

- **Storage gate pass edit API** — Update, by-ID lookup, cache lookup, edit-history fetch, query keys, mutation hooks, and audit formatting helpers for storage gate passes.
- **Edit storage gate pass form** — `/storage/$id` loads an existing gate pass, pre-fills the shared storage form, supports review before submit, and updates with success/error toasts.
- **Storage edit history page** — `/storage/edit-history` shows paginated audit cards with field diffs, editor metadata, refresh controls, and edit links.
- **Storage report API** — `/storage-gate-pass/report` query hook and storage report page with date filters and JSON response review.

### Changed

- **Daybook storage tab** — “Storage Edit History” now navigates to the storage edit-history route.
- **Create storage gate pass flow** — Navigates back to the daybook storage tab after a successful create.
- **Storage form hook** — Accepts default values so create and edit flows can share the same form setup.

## [0.3.0] - 2026-05-25

Grading report view settings now support saved columns, grouping, and advanced logic, with grouped summaries and incoming report totals for faster report review.

### Added

- **Grading report columns tab** — Toggle visibility, drag columns into a custom order, and save or clear browser-local default column views.
- **Grading report grouping tab** — Group rows by selected columns, reorder group priority, and expand grouped report sections.
- **Advanced report filters** — AND/OR logic builder with text and numeric operators for grading report columns.
- **Incoming report totals** — Summary cards for filtered total bags, gross weight, and net weight.

### Changed

- **Grading report table** — Supports grouped rows, aggregate values, expandable group sections, and footer totals across visible report data.
- **Grading report columns** — Adds aggregation behavior and nested-column preference handling so saved views work with grouped incoming gate pass columns.
- **View settings sheet** — Combines filters, columns, grouping, and advanced logic into one apply/reset flow.

## [0.2.9] - 2026-05-25

Incoming report views can save reusable column defaults, reset filters back to defaults, and keep status styling readable in dark mode.

### Added

- **Incoming report column defaults** — Browser-local preferences for saved incoming report column visibility and order, with set/clear controls in the columns tab.
- **View filter reset** — Reset action in the view filters sheet restores filters, grouping, global conditions, and saved column defaults in one step.
- **UI** — shadcn-style Accordion component for collapsible surfaces.

### Changed

- **Incoming report table** — Initializes column visibility and order from saved defaults.
- **Incoming report status badge** — Strengthened font weight and dark-mode styling for graded statuses.

## [0.2.8] - 2026-05-24

Storage gate pass list, search, and create wired to the API; daybook storage tab shows live gate passes; Reports nav with report route shells.

### Added

- **Storage gate pass list API** — `getStorageGatePasses`, `searchStorageGatePasses`, shared query keys, and React Query hooks (`useStorageGatePasses`, `useSearchStorageGatePass`) for `/storage-gate-pass/`.
- **Create storage gate pass API** — `createStorageGatePass`, request body mapper, types, and `useCreateStorageGatePass` mutation with list and voucher-number cache invalidation on success.
- **Storage gate pass types** — `StorageGatePass`, list params, pagination, and search request/response shapes.
- **Storage gate pass card** — `StorageGatePassCard` and `StorageGatePassCardSkeleton` with expandable location/quantity details, farmer info, and actions.
- **Storage tab skeleton** — Full-page `StorageTabSkeleton` while storage gate passes load.
- **Reports navigation** — Collapsible “Reports” sidebar group with links to incoming, grading, storage, and dispatch pre/post-storage report routes.
- **Report routes** — `/incoming/report` (incoming report feature shell), plus placeholder pages for grading, storage, and dispatch reports.
- **Additional route** — `/additional` authenticated route shell.

### Changed

- **Daybook storage tab** — Loads storage gate passes from the API with sort, configurable page size, and pagination; debounced gate-pass-number search; loading, error, empty, and invalid-search states; refresh with fetch indicator.
- **Create storage form** — Submits through `useCreateStorageGatePass` with success/error toasts, form reset, and combobox reset on success; review sheet closes after create.
- **useCreateStorageForm** — `onCreate` callback replaces inline console log and toast handling in the form hook.
- **Topbar** — Route titles for report paths; logout menu item uses `destructive` variant.

## [0.2.7] - 2026-05-24

Grading gate pass edit and audit history wired to the API, with link/delink incoming gate passes on the select step and storage create form using live farmer links.

### Added

- **Update grading gate pass API** — `updateGradingGatePass`, body mapper, types, and `useUpdateGradingGatePass` mutation with list/detail cache invalidation on success.
- **Grading gate pass by ID** — `getGradingGatePassById`, `findGradingGatePassInCache`, and `useGradingGatePassById` (cache-first, then API fallback).
- **Incoming link on grading** — `linkIncomingToGradingGatePass`, `delinkIncomingFromGradingGatePass`, and `useGradingIncomingGatePassLink` for linking/unlinking incoming gate passes during edit.
- **Grading edit history API** — `getGradingGatePassEdits`, audit types, query keys, and `useGradingGatePassEdits` for paginated audit list.
- **Grading edit history page** — `GradingEditHistory` at `/grading/edit-history` with paginated audits, field diff tables, editor metadata, and links to edit grading gate passes.
- **Shared grading form hooks** — `useGradingForm` (create/edit shared logic) and `useEditGradingForm`; `gradingGatePassToFormValues` and incoming ref helpers for prefill and reset.
- **Incoming cache lookup** — `findIncomingGatePassByGatePassNoInCache` for resolving incoming refs when hydrating grading forms.
- **Grading incoming action cell** — Link/delink controls on the select-gate-passes step in edit mode.
- **Constants** — `STORAGE_CATEGORIES` for storage gate pass category options.

### Changed

- **Edit grading form** — Multi-step edit flow loads gate pass by route `id`, pre-fills from API, links/unlinks incoming gate passes, submits updates with toasts; loading and error states.
- **Grading edit route** — `/grading/$id` renders `EditGradingForm` with `gatePassId`.
- **Daybook grading tab** — “Grading Edit History” navigates to the new edit-history route.
- **Create storage form** — Farmer combobox uses live farmer link options, receipt voucher number from API, Add Farmer dialog, and `STORAGE_CATEGORIES`; removes mock farmer data.
- **Incoming edit history** — Card-based audit layout with shadcn `Table` for field diffs; skeleton matches card structure.
- **Searchable option combobox** — Disabled state shows `cursor-not-allowed` on input and trigger.
- **Topbar** — Route title for `/grading/edit-history`.

## [0.2.6] - 2026-05-24

Daybook grading tab wired to the API with paginated list, debounced search, and grading gate pass cards.

### Added

- **Grading gate pass list API** — `getGradingGatePasses`, `searchGradingGatePasses`, shared query keys, and React Query hooks (`useGradingGatePasses`, `useSearchGradingGatePass`) for `/grading-gate-pass/`.
- **Grading gate pass types** — `GradingGatePass`, list params, pagination, and search request/response shapes.
- **Grading gate pass card** — `GradingGatePassCard` and `GradingGatePassCardSkeleton` with expandable order details, farmer info, and linked incoming gate passes.
- **Grading tab skeleton** — Full-page `GradingTabSkeleton` while grading gate passes load.

### Changed

- **Daybook grading tab** — Loads grading gate passes from the API with sort, configurable page size, and pagination; debounced gate-pass-number search; loading, error, empty, and invalid-search states; refresh with fetch indicator.

## [0.2.5] - 2026-05-24

Add Farmer dialog on the People tab wired to the quick-register API with validation, suggested account numbers, and list refresh on success.

### Added

- **Quick register farmer API** — `quickRegisterFarmer`, request body mapper, types, and `useQuickRegisterFarmer` mutation with farmer storage links cache invalidation on success.
- **Add farmer dialog** — `AddFarmerDialog` with TanStack Form + Zod for name, address, mobile, account number, optional Aadhaar/PAN/image URL, and cost per bag; success/error toasts; resets on open.
- **Add farmer form schema** — `createAddFarmerFormSchema` with Indian mobile, Aadhaar, PAN, and URL validation; duplicate account/mobile checks against existing links; `buildAddFarmerPayload` for API submit.
- **Farmer account helpers** — `getNextAccountNumber`, `getUsedAccountNumbers`, and `getUsedMobileNumbers` derived from loaded farmer storage links.
- **Business number input** — Shared wheel-blur, spinner hiding, and arrow-key guards for numeric fields.
- **UI** — shadcn `Dialog` component.

### Changed

- **People tab** — “Add Farmer” opens the quick-register dialog; passes current links for uniqueness and next account number suggestions.

## [0.2.4] - 2026-05-24

Incoming gate pass edit wired to the API with cache-first load, farmer links from the API, and update mutation with toast feedback.

### Added

- **Update incoming gate pass API** — `updateIncomingGatePass`, request body mapper, types, and `useUpdateIncomingGatePass` mutation with list/detail cache invalidation on success.
- **Gate pass by ID hook** — `useIncomingGatePassById` resolves from React Query list cache first, then falls back to a paginated list fetch.
- **Cache lookup** — `findIncomingGatePassInCache` scans cached incoming gate pass list queries for a matching `_id`.
- **Form mapper** — `incomingGatePassToFormValues` maps an `IncomingGatePass` to `IncomingFormValues` for edit and reset.

### Changed

- **Edit incoming form** — Loads gate pass by route `id`; pre-fills fields from API data; submits updates via mutation with success/error toasts; uses live farmer link options; reset restores server values; loading and error states.
- **Incoming edit route** — `/incoming/$id` renders `EditIncomingForm` with `gatePassId` instead of a placeholder.
- **Gate pass card** — Removes internal “System Stage” field from expanded details.

## [0.2.3] - 2026-05-24

Daybook incoming tab wired to the API with paginated list, debounced search, and loading skeletons.

### Added

- **Incoming gate pass list API** — `getIncomingGatePasses`, `searchIncomingGatePasses`, shared query keys, and React Query hooks (`useIncomingGatePasses`, `useSearchIncomingGatePass`) for `/incoming-gate-pass/`.
- **Incoming gate pass types** — `IncomingGatePass`, list params, pagination, and search request/response shapes.
- **Gate pass card skeleton** — `GatePassCardSkeleton` for list loading states.
- **People tab skeleton** — Full-page `PeopleTabSkeleton` while farmer storage links load.
- **Constants** — `INCOMING_GATE_PASS_STATUSES` for graded/ungraded filter labels.
- **Dependency** — `usehooks-ts` for debounced search input.

### Changed

- **Daybook incoming tab** — Loads gate passes from the API with sort, status filter, configurable page size, and pagination; debounced gate-pass-number search; loading, error, empty, and invalid-search states; refresh with fetch indicator.
- **Gate pass card** — Uses shared `IncomingGatePass` type; shows category and stage badges; dark-mode styling for ungraded status; removes location column.
- **Create incoming gate pass** — Invalidates list queries on success and navigates to the daybook incoming tab.
- **People tab** — Shows full-page skeleton during initial load instead of inline card skeletons only.

## [0.2.2] - 2026-05-24

Incoming gate pass creation wired to the API with live voucher numbers, review submit, and improved weight-slip validation.

### Added

- **Create incoming gate pass API** — `createIncomingGatePass`, request body mapper, types, and `useCreateIncomingGatePass` mutation with voucher-number invalidation on success.
- **Voucher number hook** — `useGetReceiptVoucherNumber`, query keys, and prefetch helper for `/store-admin/voucher-number` (incoming and other gate-pass types).
- **HTTP error helper** — `getHttpStatusFromError` in `http-error.ts` (re-exported from `api-client`).

### Changed

- **Create incoming form** — Shows next gate pass number from the API; submits through the create mutation with toast feedback; resets form and combobox state on success; disables review when the voucher number is unavailable.
- **Weight slip fields** — Single `weightSlip` field with `weightSlipSchema` on blur; empty display for zero weights; `en-IN` formatting for calculated net weight.
- **Incoming form schema** — Exported `weightSlipSchema`; form validates on blur and submit.
- **API client** — `getApiErrorMessage` reads nested `error.message` from API responses.

## [0.2.1] - 2026-05-23

People tab wired to the farmer storage links API with search, sort, and card list UI.

### Added

- **Farmer storage links API** — `getFarmerStorageLinks`, React Query hook (`useFarmerStorageLinks`), and query keys for `/farmer-storage-link`.
- **People types** — `Farmer`, `FarmerStorageLink`, and typed API response shapes.
- **People card** — `PeopleCard` and `PeopleCardSkeleton` showing farmer name, account number, mobile, address, and active status.

### Changed

- **People tab** — Loads linked farmers from the API; client-side search by name and sort by newest/oldest; loading, error, and empty states; refresh with fetch indicator.

## [0.2.0] - 2026-05-23

Storage entry flow with review sheet, shared bag quantity UI, and daybook navigation into the new route.

### Added

- **Storage create form** — `/storage` route with `CreateStorageForm` (TanStack Form + Zod) for date, farmer link, variety/category, chamber/floor/row location, bag quantities, and remarks (mock options until API is connected).
- **Storage summary sheet** — `StorageSummarySheet` to review location, quantities, and totals before final submit.
- **Storage quantities** — `StorageQuantitiesSection` with default bag-size rows, extra rows, and validation via `storageFormSchema` / `storage-quantities-schema`.
- **Storage routes** — `storage.index` and `storage.$id` for create and future edit/detail flows.
- **Shared bag fields** — `BagSizeSelectField` and `FixedBagSizeLabel` in `bag-quantity-size-field.tsx` for grading and storage quantity tables.
- **Constants** — Chamber, floor, and storage row placeholders (`CHAMBERS`, `FLOORS`, `STORAGE_ROWS`) with defaults for form hints.

### Changed

- **Daybook storage tab** — “Add Storage” navigates to `/storage`.
- **Grading fill details step** — Extra quantity rows use `BagSizeSelectField`; default rows show fixed size labels instead of a disabled select.
- **Router** — Generated route tree registers `/storage` and `/storage/$id`.

## [0.1.9] - 2026-05-23

Grading create form review sheet, per-step validation, and scroll restoration for multi-step flows.

### Added

- **Grading summary sheet** — `GradingSummarySheet` to review selected gate passes, graded quantities, and totals before final submit on the create grading form.
- **Grading form schema** — Unified `gradingFormSchema` with per-step Zod schemas (`gradingSelectStepSchema`, `gradingFillDetailsSchema`) and shared `GRADING_FORM_STEPS` metadata.
- **Incoming gate passes summary card** — `IncomingGatePassesSummaryCard` for the review flow.
- **Grading constants & mock data** — Shared farmer link options and `MOCK_INCOMING_GATE_PASSES` module for gate pass selection and summary resolution.
- **Scroll helper** — `scrollMainToTop` scrolls the window and `data-main-scroll` containers after wizard step changes.

### Changed

- **Create grading form** — “Review” validates and opens the summary sheet; confirm submit runs from the sheet; per-step Next validation; Reset action; scroll to top when entering fill details.
- **Select gate passes step** — Parent-owned form instance; table uses shared mock data module.
- **Fill details step** — Wired to the parent form instance.
- **useCreateGradingForm** — Separate review vs submit submit actions with sheet open/close callbacks.
- **Data table** — Refinements for grading gate pass selection (sorting, layout, and mobile behavior).
- **Authenticated layout** — Main content uses `data-main-scroll` with vertical overflow for nested scroll restoration.
- **Router** — `scrollToTopSelectors` includes `[data-main-scroll]`.

### Removed

- **Multi-step example** — Demo wizard form (`multi-step-example.tsx`) and `/example` route.

## [0.1.7] - 2026-05-22

Incoming review sheet, param-based edit route, and gate pass card navigation by ID.

### Added

- **Incoming summary sheet** — `IncomingSummarySheet` for reviewing gate pass details (truck, farmer, variety, weights, remarks) before final submit on create and edit forms.
- **Edit incoming form** — Full `EditIncomingForm` on `/incoming/$id` with the same fields, validation, and review flow as create.

### Changed

- **Create incoming form** — “Review” validates the form and opens the summary sheet; confirm submit runs from the sheet instead of an immediate toast.
- **Incoming routes** — Edit moves from `/incoming/edit` to `/incoming/$id`; index route files use flat `incoming.index` / `incoming.$id` naming.
- **Gate pass card** — Edit navigates to `/incoming/$id` using `_id`; mock daybook data includes IDs for list keys and navigation.
- **Sheet** — Drops unnecessary `"use client"` directive.

### Removed

- **Incoming edit shell** — Placeholder `/incoming/edit` route replaced by the `$id` edit route.

## [0.1.6] - 2026-05-21

Incoming gate pass creation flow, form-ready date picker, and combobox/checkbox UI.

### Added

- **Incoming** — `/incoming` route with `CreateIncomingForm` (TanStack Form + Zod) for gate pass details, farmer link, variety/category/stage, weights, and remarks (mock options until API is connected).
- **Incoming edit route** — `/incoming/edit` route shell for future edit flow.
- **UI** — shadcn `Checkbox` and Base UI–backed `Combobox` components.
- **Dependencies** — `@base-ui/react` for combobox primitives.

### Changed

- **Daybook incoming tab** — “Add Incoming” navigates to `/incoming`.
- **Date picker** — `onBlur`, `aria-invalid`, and controlled sync without effect-driven updates; helpers kept module-private for form use.
- **Styles** — Hide number input spin buttons in WebKit and Firefox.
- **Vite** — Dev server listens on port 3000.

## [0.1.5] - 2026-05-20

Analytics and People pages, daybook workflow tab shells, and shared date/input UI.

### Added

- **Analytics** — `/analytics` route with from/to date pickers, apply/reset actions, and an overview grid of summary metric cards (placeholder data until API is connected).
- **People** — `/people` route with URL-synced tabs for People and Dispatch ledger, each with search/filter toolbars and empty-state shells.
- **Daybook tabs** — Grading, Storage, Dispatch pre-storage, and Dispatch post-storage tab components with list toolbars, pagination, and empty states wired into the daybook page.
- **Date picker** — `DatePickerInput` built on calendar popover and `InputGroup`.
- **UI** — shadcn `InputGroup` and `Textarea` components.

### Changed

- **Daybook** — Replaces placeholder card content for grading, storage, and dispatch tabs with dedicated tab components.
- **Popover** — Drops unnecessary `"use client"` directive.

## [0.1.4] - 2026-05-19

Daybook incoming tab with gate pass cards, filters, and supporting UI primitives.

### Added

- **Daybook incoming tab** — Search, sort/status filters, pagination shell, empty state, and mock gate pass list wired into the daybook page.
- **Gate pass card** — `GatePassCard` (`incoming-gate-pass-card.tsx`) with expandable details, farmer/weight-slip info, and action buttons.
- **UI** — shadcn `Empty`, `Item`, `Pagination`, and `Select` components.

### Changed

- **Sidebar** — Primary-accent active and hover styles for default menu buttons; focus ring aligned with app theme.
- **Daybook tabs** — Simplified tab trigger markup; incoming tab renders `DaybookIncomingTab` instead of placeholder card content.

## [0.1.3] - 2026-05-18

ERP-aligned UI polish, consistent authenticated page spacing, and configurable devtools.

### Added

- **Daybook feature** — `src/features/daybook/` with route wired from `/_authenticated/daybook`.
- **Devtools toggle** — `VITE_ENABLE_DEVTOOLS` in `.env.example` and `env.enableDevtools` so TanStack Router/Query/Form devtools can be turned on without relying on `import.meta.env.DEV` alone.
- **Typography** — Global `font-heading` on `h1`–`h3` in `index.css`.

### Changed

- **Authenticated layout** — Shared `<section>` shell with style-guide padding (`p-4 sm:p-6`), `max-w-7xl` content width, and vertical rhythm (`gap-4 sm:gap-6`) for all protected routes.
- **Login form** — Touch-friendly inputs, tabular mobile number, app name in description, and ERP-consistent card styling.
- **Chrome** — Sidebar group label, cold-storage branding truncation, and topbar page title (`font-heading`, `title` tooltip).
- **Theme** — Tighter `--radius`, neutral chart palette for light/dark.
- **Devtools** — Panel stays visible when enabled (`hideUntilHover: false`).

### Removed

- Empty `src/features/auth/index.tsx` barrel file.

## [0.1.2] - 2026-05-18

Authenticated app shell with sidebar navigation, top bar, and the first protected route.

### Added

- **Authenticated layout** — `/_authenticated` route guard (redirects unauthenticated users to login with return URL), shared layout with collapsible sidebar and top bar (`AppSidebar`, `AppTopbar`).
- **Daybook route** — `/daybook` as the first protected page under the authenticated layout.
- **Router auth context** — `auth` on router context (`isAuthenticated`, `user`, `accessToken`) supplied from `Providers` via the auth store.
- **UI** — shadcn `Sidebar` (and related primitives), `Avatar`, `Badge`, `Breadcrumb`, `Calendar`, `DropdownMenu`, `Popover`, `Sheet`, `Skeleton`, and `Tooltip`; `use-mobile` hook for responsive sidebar behavior.
- **Dependencies** — `date-fns` and `react-day-picker` for calendar/date UI.

### Changed

- Login success navigates to `/daybook` (or `?redirect=` when present); authenticated users visiting `/` are redirected to daybook or the redirect target.
- Home route validates optional `redirect` search param via Zod.

## [0.1.1] - 2026-05-18

Authentication flow, shared API client, and supporting UI for the login experience.

### Added

- **Authentication** — Login feature with TanStack Form + Zod validation, React Query mutations (`useLogin`, `useLogout`), and a Zustand auth store for access tokens and user session state.
- **API client** — Axios instance with bearer-token request interceptor, 401 handling (clear session + redirect), and typed env config (`VITE_API_BASE_URL`, `VITE_APP_NAME`) via `src/lib/env.ts`.
- **UI** — shadcn `Card`, `Field`, `Input`, `Label`, and `Separator` components; Sonner toasts for login feedback; theme provider (`next-themes`) with system/light/dark support.
- **Devtools** — Unified TanStack devtools panel (router, query, and form) in development.
- **Config** — `.env.example` documenting required `VITE_` variables; `.gitignore` entries for `.env` and local env overrides.

### Changed

- Home route (`/`) renders the login form instead of the starter demo.
- Router setup extracted to `src/router.ts`; providers wrap the app with `ThemeProvider`, `Toaster`, and consolidated devtools.
- Root layout simplified to route outlet only.

### Removed

- Example `useBearStore` Zustand demo store.

## [0.1.0] - 2026-05-17

First application scaffold for the Kapur frontend (`kf-frontend`).

### Added

- **Routing** — TanStack Router with file-based routes (`src/routes/`), generated route tree, intent-based preloading, and router context wired to React Query.
- **Data fetching** — TanStack Query with a shared `QueryClient` (60s default stale time, single retry) and dev-only React Query Devtools.
- **UI** — Tailwind CSS v4, shadcn/ui (`radix-luma` / zinc), Lucide icons, and an initial `Button` component.
- **State** — Zustand with an example `useBearStore`.
- **Tooling** — `@/` path alias, Prettier (+ Tailwind class sorting), React Compiler via Babel, and TanStack Router Vite plugin with auto code splitting.
- **Fonts** — Inter and Outfit variable font packages.
- **Dependencies** — Axios for HTTP, plus `class-variance-authority`, `clsx`, and `tailwind-merge` for component styling.

### Changed

- Replaced the Vite + React starter demo with a `Providers` entry point (`RouterProvider` + `QueryClientProvider`).
- Root layout includes basic navigation and route outlet; home route demonstrates shadcn `Button`.
- Vite config extended with Tailwind, TanStack Router, and React Compiler presets.

### Removed

- Default Vite starter styles (`App.css`) and demo application UI from the initial template.

[0.4.1]: https://github.com/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/compare/v0.3.9...v0.4.0
[0.3.9]: https://github.com/compare/v0.3.8...v0.3.9
[0.3.8]: https://github.com/compare/v0.3.7...v0.3.8
[0.3.7]: https://github.com/compare/v0.3.6...v0.3.7
[0.3.6]: https://github.com/compare/v0.3.5...v0.3.6
[0.3.5]: https://github.com/compare/v0.3.4...v0.3.5
[0.3.4]: https://github.com/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/compare/v0.2.9...v0.3.0
[0.2.9]: https://github.com/compare/v0.2.8...v0.2.9
[0.2.8]: https://github.com/compare/v0.2.7...v0.2.8
[0.2.7]: https://github.com/compare/v0.2.6...v0.2.7
[0.2.6]: https://github.com/compare/v0.2.5...v0.2.6
[0.2.5]: https://github.com/compare/v0.2.4...v0.2.5
[0.2.4]: https://github.com/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/compare/v0.1.9...v0.2.0
[0.1.9]: https://github.com/compare/v0.1.7...v0.1.9
[0.1.7]: https://github.com/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/compare/v0.0.0...v0.1.0

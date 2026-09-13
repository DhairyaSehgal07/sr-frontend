import type {
  ColumnFiltersState,
  ColumnOrderState,
  ColumnVisibilityState,
  GroupingState,
  Table,
} from '@tanstack/react-table';
import { CheckCircle2, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DispatchReportRow } from '@/features/dispatch-report/api/types';
import { getStoredDispatchReportColumnState } from '@/features/dispatch-report/utils/report-column-preferences';
import type { AdvancedReportGlobalFilter } from '@/features/dispatch-report/utils/report-filter-fns';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';
import AdvancedTab from './advanced-tab';
import ColumnsTab from './columns-tab';
import FiltersTab from './filters-tab';
import GroupingTab from './grouping-tab';

interface ViewFiltersSheetProps {
  table: Table<ReportFeatures, DispatchReportRow>;
}

function getDefaultGlobalFilter(manualGatePassSearch = ''): AdvancedReportGlobalFilter {
  return {
    logic: 'AND',
    conditions: [],
    manualGatePassSearch,
  };
}

function areColumnVisibilityStatesEqual(a: ColumnVisibilityState, b: ColumnVisibilityState) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (const key of keys) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}

function areColumnOrdersEqual(a: ColumnOrderState, b: ColumnOrderState) {
  return a.length === b.length && a.every((columnId, index) => columnId === b[index]);
}

export function ViewFiltersSheet({ table }: ViewFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [draftColumnFilters, setDraftColumnFilters] = useState<ColumnFiltersState>(
    () => table.store.state.columnFilters,
  );
  const [draftColumnVisibility, setDraftColumnVisibility] = useState<ColumnVisibilityState>(
    () => table.store.state.columnVisibility,
  );
  const [draftColumnOrder, setDraftColumnOrder] = useState<ColumnOrderState>(
    () => table.store.state.columnOrder,
  );
  const [draftGrouping, setDraftGrouping] = useState<GroupingState>(
    () => table.store.state.grouping,
  );
  const [draftGlobalFilter, setDraftGlobalFilter] = useState<AdvancedReportGlobalFilter>(() => ({
    logic: 'AND',
    conditions: [],
    ...table.store.state.globalFilter,
  }));
  const activeFilterCount = table.store.state.columnFilters.length;
  const activeGroupingCount = table.store.state.grouping.length;
  const activeAdvancedCount =
    table.store.state.globalFilter?.conditions?.filter(
      (condition: { operator: string; value: string }) =>
        condition.operator === 'isEmpty' ||
        condition.operator === 'isNotEmpty' ||
        condition.value.trim().length > 0,
    ).length ?? 0;
  const hiddenColumnCount = table
    .getAllLeafColumns()
    .filter((column) => table.store.state.columnVisibility[column.id] === false).length;
  const defaultColumnState = getStoredDispatchReportColumnState(
    table.getAllLeafColumns().map((column) => column.id),
  );
  const hasDraftViewChanges =
    draftColumnFilters.length > 0 ||
    !areColumnVisibilityStatesEqual(draftColumnVisibility, defaultColumnState.columnVisibility) ||
    !areColumnOrdersEqual(draftColumnOrder, defaultColumnState.columnOrder) ||
    draftGrouping.length > 0 ||
    draftGlobalFilter.logic !== 'AND' ||
    draftGlobalFilter.conditions.length > 0;

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const tableState = table.store.state;
      setDraftColumnFilters(tableState.columnFilters);
      setDraftColumnVisibility(tableState.columnVisibility);
      setDraftColumnOrder(tableState.columnOrder);
      setDraftGrouping(tableState.grouping);
      setDraftGlobalFilter({
        logic: 'AND',
        conditions: [],
        ...tableState.globalFilter,
      });
    }
    setOpen(nextOpen);
  };

  const handleApplyChanges = () => {
    table.setColumnFilters(draftColumnFilters);
    table.setColumnVisibility(draftColumnVisibility);
    table.setColumnOrder(draftColumnOrder);
    table.setGrouping(draftGrouping);
    table.setExpanded(draftGrouping.length > 0 ? true : {});
    table.setGlobalFilter({
      ...draftGlobalFilter,
      manualGatePassSearch:
        table.store.state.globalFilter?.manualGatePassSearch ??
        draftGlobalFilter.manualGatePassSearch ??
        '',
    });
    setOpen(false);
  };

  const handleResetChanges = () => {
    const manualGatePassSearch =
      table.store.state.globalFilter?.manualGatePassSearch ??
      draftGlobalFilter.manualGatePassSearch ??
      '';
    const defaultGlobalFilter = getDefaultGlobalFilter(manualGatePassSearch);
    const nextColumnState = getStoredDispatchReportColumnState(
      table.getAllLeafColumns().map((column) => column.id),
    );

    setDraftColumnFilters([]);
    setDraftColumnVisibility(nextColumnState.columnVisibility);
    setDraftColumnOrder(nextColumnState.columnOrder);
    setDraftGrouping([]);
    setDraftGlobalFilter(defaultGlobalFilter);

    table.setColumnFilters([]);
    table.setColumnVisibility(nextColumnState.columnVisibility);
    table.setColumnOrder(nextColumnState.columnOrder);
    table.setGrouping([]);
    table.setExpanded({});
    table.setGlobalFilter(defaultGlobalFilter);
    table.setPageIndex(0);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="min-w-0 flex-1 gap-1.5 border-primary text-primary hover:bg-primary/10 hover:text-primary lg:flex-none dark:border-border dark:bg-muted/20 dark:text-foreground dark:hover:bg-muted/40 dark:hover:text-foreground"
          aria-label="View filters"
        >
          <SlidersHorizontal className="size-4 shrink-0" aria-hidden />
          <span className="truncate">
            View filters
            {activeFilterCount > 0 ? ` (${activeFilterCount.toLocaleString('en-IN')})` : ''}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:max-w-full sm:data-[side=right]:max-w-2xl lg:data-[side=right]:max-w-3xl"
      >
        {/* ── Header ──────────────────────────────────────────── */}
        {/* Added pr-14 to ensure text doesn't overlap with the absolute close button */}
        <SheetHeader className="border-b border-border/40 pl-5 pr-14 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SlidersHorizontal className="size-4" />
            </span>
            <div className="min-w-0 space-y-0.5 text-left">
              <SheetTitle className="text-base font-semibold leading-none">
                View Settings
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground leading-snug">
                Manage table filters, columns, and advanced display groupings.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* ── Scrollable body ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="columns">
                Columns
                {hiddenColumnCount > 0 ? (
                  <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {hiddenColumnCount.toLocaleString('en-IN')} hidden
                  </span>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="grouping">
                Grouping
                {activeGroupingCount > 0 ? (
                  <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {activeGroupingCount.toLocaleString('en-IN')}
                  </span>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="advanced">
                Advanced
                {activeAdvancedCount > 0 ? (
                  <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {activeAdvancedCount.toLocaleString('en-IN')}
                  </span>
                ) : null}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="filters">
              <FiltersTab
                table={table}
                draftColumnFilters={draftColumnFilters}
                onDraftColumnFiltersChange={setDraftColumnFilters}
              />
            </TabsContent>

            <TabsContent value="columns">
              <ColumnsTab
                table={table}
                draftColumnVisibility={draftColumnVisibility}
                draftColumnOrder={draftColumnOrder}
                onDraftColumnVisibilityChange={setDraftColumnVisibility}
                onDraftColumnOrderChange={setDraftColumnOrder}
              />
            </TabsContent>

            <TabsContent value="grouping">
              <GroupingTab
                table={table}
                draftGrouping={draftGrouping}
                onDraftGroupingChange={setDraftGrouping}
              />
            </TabsContent>

            <TabsContent value="advanced">
              <AdvancedTab
                table={table}
                draftGlobalFilter={draftGlobalFilter}
                onDraftGlobalFilterChange={setDraftGlobalFilter}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <SheetFooter className="grid grid-cols-1 gap-2 border-t border-border/40 px-5 py-4 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-1.5"
            disabled={!hasDraftViewChanges}
            onClick={handleResetChanges}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <Button type="button" size="sm" className="w-full gap-1.5" onClick={handleApplyChanges}>
            <CheckCircle2 className="size-3.5" />
            Apply changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

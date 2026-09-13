import { move } from '@dnd-kit/helpers';
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import type {
  Column,
  ColumnOrderState,
  ColumnVisibilityState,
  RowData,
  Table,
} from '@tanstack/react-table';
import { GripVertical, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  clearStoredDispatchReportColumnState,
  hasStoredDispatchReportColumnState,
  saveDispatchReportColumnState,
} from '@/features/dispatch-report/utils/report-column-preferences';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';
import { cn } from '@/lib/utils';

const COLUMN_ORDER_GROUP = 'dispatch-report-columns';

interface ColumnsTabProps<TData extends RowData> {
  table: Table<ReportFeatures, TData>;
  draftColumnVisibility: ColumnVisibilityState;
  draftColumnOrder: ColumnOrderState;
  onDraftColumnVisibilityChange: (visibility: ColumnVisibilityState) => void;
  onDraftColumnOrderChange: (order: ColumnOrderState) => void;
}

interface ColumnVisibilityRowProps<TData extends RowData> {
  column: Column<ReportFeatures, TData, unknown>;
  index: number;
  isVisible: boolean;
  visibleColumnCount: number;
  onVisibilityChange: (columnId: string, visible: boolean) => void;
}

function getColumnLabel<TData extends RowData>(
  column: Column<ReportFeatures, TData, unknown>,
): string {
  return column.columnDef.meta?.filterLabel ?? column.id;
}

function getDraftColumnVisible(
  columnId: string,
  draftColumnVisibility: ColumnVisibilityState,
): boolean {
  return draftColumnVisibility[columnId] !== false;
}

function getOrderedColumns<TData extends RowData>(
  columns: Column<ReportFeatures, TData, unknown>[],
  draftColumnOrder: ColumnOrderState,
): Column<ReportFeatures, TData, unknown>[] {
  const columnsById = new Map(columns.map((column) => [column.id, column]));
  const orderedIds = [
    ...draftColumnOrder.filter((columnId) => columnsById.has(columnId)),
    ...columns
      .map((column) => column.id)
      .filter((columnId) => !draftColumnOrder.includes(columnId)),
  ];

  return orderedIds
    .map((columnId) => columnsById.get(columnId))
    .filter((column): column is Column<ReportFeatures, TData, unknown> => column != null);
}

function ColumnVisibilityRow<TData extends RowData>({
  column,
  index,
  isVisible,
  visibleColumnCount,
  onVisibilityChange,
}: ColumnVisibilityRowProps<TData>) {
  const canHide = column.getCanHide();
  const isLastVisibleColumn = isVisible && visibleColumnCount <= 1;
  const switchDisabled = !canHide || isLastVisibleColumn;
  const columnLabel = getColumnLabel(column);
  const { ref, handleRef, isDragging, isDropTarget } = useSortable({
    id: column.id,
    index,
    group: COLUMN_ORDER_GROUP,
    data: { index },
  });

  return (
    <div
      ref={ref}
      className={cn(
        'flex min-h-11 items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-[background-color,border-color,opacity,box-shadow]',
        isDragging && 'opacity-60 shadow-sm',
        isDropTarget && 'border-primary/50 bg-primary/5',
        !isVisible && 'bg-muted/20 text-muted-foreground',
      )}
    >
      <button
        ref={handleRef}
        type="button"
        className="flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        aria-label={`Reorder ${columnLabel}`}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-medium',
            isVisible ? 'text-foreground' : 'text-muted-foreground',
          )}
          title={columnLabel}
        >
          {columnLabel}
        </p>
      </div>

      <Switch
        size="sm"
        checked={isVisible}
        disabled={switchDisabled}
        onCheckedChange={(checked) => onVisibilityChange(column.id, checked === true)}
        aria-label={`${isVisible ? 'Hide' : 'Show'} ${columnLabel} column`}
      />
    </div>
  );
}

const ColumnsTab = <TData extends RowData>({
  table,
  draftColumnVisibility,
  draftColumnOrder,
  onDraftColumnVisibilityChange,
  onDraftColumnOrderChange,
}: ColumnsTabProps<TData>) => {
  const allColumns = table.getAllLeafColumns();
  const orderedColumns = useMemo(
    () => getOrderedColumns(allColumns, draftColumnOrder),
    [allColumns, draftColumnOrder],
  );
  const orderedColumnIds = orderedColumns.map((column) => column.id);
  const visibleColumnCount = orderedColumns.filter((column) =>
    getDraftColumnVisible(column.id, draftColumnVisibility),
  ).length;
  const hiddenColumnCount = orderedColumns.length - visibleColumnCount;
  const columnIds = allColumns.map((column) => column.id);
  const [hasSavedDefault, setHasSavedDefault] = useState(() =>
    hasStoredDispatchReportColumnState(),
  );
  const [preferenceStatus, setPreferenceStatus] = useState<'idle' | 'saved' | 'cleared' | 'error'>(
    'idle',
  );

  const handleVisibilityChange = (columnId: string, visible: boolean) => {
    const nextVisibility = { ...draftColumnVisibility };

    if (visible) {
      delete nextVisibility[columnId];
    } else {
      nextVisibility[columnId] = false;
    }

    onDraftColumnVisibilityChange(nextVisibility);
  };

  const handleShowAll = () => {
    onDraftColumnVisibilityChange({});
  };

  const handleResetOrder = () => {
    onDraftColumnOrderChange([]);
  };

  const handleSaveDefaultColumns = () => {
    const saved = saveDispatchReportColumnState(columnIds, draftColumnVisibility, draftColumnOrder);

    setHasSavedDefault(saved);
    setPreferenceStatus(saved ? 'saved' : 'error');
  };

  const handleClearDefaultColumns = () => {
    const cleared = clearStoredDispatchReportColumnState();

    if (cleared) {
      setHasSavedDefault(false);
      setPreferenceStatus('cleared');
      return;
    }

    setPreferenceStatus('error');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled || !event.operation.target) return;

    onDraftColumnOrderChange(move(orderedColumnIds, event).map(String));
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Column visibility & order
            </p>
            <p className="text-sm text-muted-foreground">
              Drag rows to reorder. Toggle columns to show or hide them.
            </p>
          </div>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto shrink-0 px-0 text-primary"
            disabled={hiddenColumnCount === 0}
            onClick={handleShowAll}
          >
            Show all
          </Button>
        </div>
      </div>

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground">Default column view</p>
          <p className="text-sm text-muted-foreground">
            Save the current visible columns and order for this browser.
          </p>
          {preferenceStatus !== 'idle' ? (
            <p
              className={cn(
                'text-xs',
                preferenceStatus === 'error' ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {preferenceStatus === 'saved'
                ? 'Default column view saved.'
                : preferenceStatus === 'cleared'
                  ? 'Default column view cleared.'
                  : 'Could not update local storage.'}
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleSaveDefaultColumns}
          >
            <Save className="size-3.5" aria-hidden />
            Set default
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5"
            disabled={!hasSavedDefault}
            onClick={handleClearDefaultColumns}
          >
            <Trash2 className="size-3.5" aria-hidden />
            Clear
          </Button>
        </div>
      </section>

      <div className="rounded-xl border border-border bg-muted/10 p-2">
        <DragDropProvider onDragEnd={handleDragEnd}>
          <div className="space-y-2">
            {orderedColumns.map((column, index) => (
              <ColumnVisibilityRow
                key={column.id}
                column={column}
                index={index}
                isVisible={getDraftColumnVisible(column.id, draftColumnVisibility)}
                visibleColumnCount={visibleColumnCount}
                onVisibilityChange={handleVisibilityChange}
              />
            ))}
          </div>
        </DragDropProvider>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <p className="min-w-0 text-sm text-muted-foreground">
          <span className="tabular-nums text-foreground">
            {visibleColumnCount.toLocaleString('en-IN')}
          </span>{' '}
          of{' '}
          <span className="tabular-nums text-foreground">
            {orderedColumns.length.toLocaleString('en-IN')}
          </span>{' '}
          columns visible
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          disabled={draftColumnOrder.length === 0}
          onClick={handleResetOrder}
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Reset order
        </Button>
      </div>
    </div>
  );
};

export default ColumnsTab;

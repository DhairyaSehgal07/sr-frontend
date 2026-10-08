import type { Column, GroupingState, RowData, Table } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, Layers3, ListTree, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';
import { cn } from '@/lib/utils';

interface GroupingTabProps<TData extends RowData> {
  table: Table<ReportFeatures, TData>;
  draftGrouping: GroupingState;
  onDraftGroupingChange: (grouping: GroupingState) => void;
}

interface ActiveGroupRowProps<TData extends RowData> {
  column: Column<ReportFeatures, TData, unknown>;
  index: number;
  total: number;
  onMove: (fromIndex: number, toIndex: number) => void;
  onRemove: (columnId: string) => void;
}

function getColumnLabel<TData extends RowData>(
  column: Column<ReportFeatures, TData, unknown>,
): string {
  return column.columnDef.meta?.filterLabel ?? column.id;
}

function moveGroup(grouping: GroupingState, fromIndex: number, toIndex: number): GroupingState {
  const next = [...grouping];
  const [removed] = next.splice(fromIndex, 1);
  if (!removed) return grouping;
  next.splice(toIndex, 0, removed);
  return next;
}

function ActiveGroupRow<TData extends RowData>({
  column,
  index,
  total,
  onMove,
  onRemove,
}: ActiveGroupRowProps<TData>) {
  const columnLabel = getColumnLabel(column);

  return (
    <div className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 text-sm">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold tabular-nums text-primary">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground" title={columnLabel}>
          {columnLabel}
        </p>
        <p className="text-xs text-muted-foreground">Group priority {index + 1}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={index === 0}
          onClick={() => onMove(index, index - 1)}
          aria-label={`Move ${columnLabel} group up`}
        >
          <ArrowUp className="size-3.5" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={index === total - 1}
          onClick={() => onMove(index, index + 1)}
          aria-label={`Move ${columnLabel} group down`}
        >
          <ArrowDown className="size-3.5" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => onRemove(column.id)}
          aria-label={`Remove ${columnLabel} group`}
        >
          <X className="size-3.5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

const GroupingTab = <TData extends RowData>({
  table,
  draftGrouping,
  onDraftGroupingChange,
}: GroupingTabProps<TData>) => {
  const groupableColumns = table.getAllLeafColumns().filter((column) => column.getCanGroup());
  const columnsById = new Map(groupableColumns.map((column) => [column.id, column]));
  const activeColumns = draftGrouping
    .map((columnId) => columnsById.get(columnId))
    .filter((column): column is Column<ReportFeatures, TData, unknown> => column != null);
  const availableColumns = groupableColumns.filter((column) => !draftGrouping.includes(column.id));

  const handleAddGroup = (columnId: string) => {
    onDraftGroupingChange([...draftGrouping, columnId]);
  };

  const handleRemoveGroup = (columnId: string) => {
    onDraftGroupingChange(draftGrouping.filter((groupedColumnId) => groupedColumnId !== columnId));
  };

  const handleMoveGroup = (fromIndex: number, toIndex: number) => {
    onDraftGroupingChange(moveGroup(draftGrouping, fromIndex, toIndex));
  };

  return (
    <div className="space-y-5 pt-4">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Active groups
          </p>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto shrink-0 px-0 text-primary"
            disabled={draftGrouping.length === 0}
            onClick={() => onDraftGroupingChange([])}
          >
            Clear all
          </Button>
        </div>

        {activeColumns.length > 0 ? (
          <div className="space-y-2">
            {activeColumns.map((column, index) => (
              <ActiveGroupRow
                key={column.id}
                column={column}
                index={index}
                total={activeColumns.length}
                onMove={handleMoveGroup}
                onRemove={handleRemoveGroup}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 px-4 py-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl text-muted-foreground">
              <ListTree className="size-9" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-semibold text-foreground">No groups yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add columns from below to group rows together.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Available columns
          </p>
          <span className="text-xs tabular-nums text-muted-foreground">
            {availableColumns.length.toLocaleString('en-IN')} available
          </span>
        </div>

        <div className="space-y-2">
          {availableColumns.length > 0 ? (
            availableColumns.map((column) => {
              const columnLabel = getColumnLabel(column);

              return (
                <div
                  key={column.id}
                  className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-card px-4 py-2 text-sm"
                >
                  <Layers3
                    className={cn(
                      'size-4 shrink-0 text-muted-foreground',
                      column.getIsVisible() && 'text-primary',
                    )}
                    aria-hidden
                  />
                  <p
                    className="min-w-0 flex-1 truncate text-sm font-medium text-foreground"
                    title={columnLabel}
                  >
                    {columnLabel}
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto shrink-0 gap-1 px-0 text-primary"
                    onClick={() => handleAddGroup(column.id)}
                  >
                    <Plus className="size-4" aria-hidden />
                    Add
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-6 text-center">
              <p className="text-sm font-medium text-foreground">All columns are grouped</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Remove an active group to make it available again.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default GroupingTab;

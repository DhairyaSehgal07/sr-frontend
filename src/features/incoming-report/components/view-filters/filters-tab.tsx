import { useMemo, useState } from 'react';
import type { Column, ColumnFiltersState, RowData, Table } from '@tanstack/react-table';
import { ChevronDown, Search, X } from 'lucide-react';
import type { ReportFeatures } from '@/lib/tanstack-table/report-table-features';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  getReportFilterValueKey,
  type SelectedValuesFilterValue,
} from '@/features/incoming-report/utils/report-filter-fns';

type FilterOption = {
  key: string;
  label: string;
  count: number;
  isBlank: boolean;
};

interface FiltersTabProps<TData extends RowData> {
  table: Table<ReportFeatures, TData>;
  draftColumnFilters: ColumnFiltersState;
  onDraftColumnFiltersChange: (filters: ColumnFiltersState) => void;
}

interface ColumnFilterSectionProps<TData extends RowData> {
  column: Column<ReportFeatures, TData, unknown>;
  isOpen: boolean;
  draftColumnFilters: ColumnFiltersState;
  searchQuery: string;
  onToggleOpen: () => void;
  onSearchChange: (value: string) => void;
  onDraftColumnFiltersChange: (filters: ColumnFiltersState) => void;
}

function getColumnLabel<TData extends RowData>(
  column: Column<ReportFeatures, TData, unknown>,
): string {
  return column.columnDef.meta?.filterLabel ?? column.id;
}

function getDraftSelectedKeys(
  columnId: string,
  draftColumnFilters: ColumnFiltersState,
): Set<string> | null {
  const filterValue = draftColumnFilters.find((filter) => filter.id === columnId)?.value;

  if (!Array.isArray(filterValue)) return null;

  return new Set(filterValue.map(String));
}

function setDraftFilterValue(
  draftColumnFilters: ColumnFiltersState,
  columnId: string,
  value: SelectedValuesFilterValue | null,
): ColumnFiltersState {
  const remainingFilters = draftColumnFilters.filter((filter) => filter.id !== columnId);

  if (value === null) return remainingFilters;

  return [...remainingFilters, { id: columnId, value }];
}

function getFilterSummary(selectedCount: number, totalCount: number): string {
  if (totalCount === 0) return 'No values';
  if (selectedCount === totalCount) return 'All';
  if (selectedCount === 0) return 'None';
  return `${selectedCount.toLocaleString('en-IN')} selected`;
}

function ColumnFilterSection<TData extends RowData>({
  column,
  isOpen,
  draftColumnFilters,
  searchQuery,
  onToggleOpen,
  onSearchChange,
  onDraftColumnFiltersChange,
}: ColumnFilterSectionProps<TData>) {
  const columnLabel = getColumnLabel(column);
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const selectedKeys = getDraftSelectedKeys(column.id, draftColumnFilters);
  const formatter = column.columnDef.meta?.filterValueFormatter;
  const options: FilterOption[] = Array.from(column.getFacetedUniqueValues().entries())
    .map(([value, count]) => {
      const rawLabel = formatter?.(value) ?? String(value ?? '');
      const isBlank = value == null || value === '' || rawLabel === '';

      return {
        key: getReportFilterValueKey(value),
        label: isBlank ? 'Blank' : rawLabel,
        count,
        isBlank,
      };
    })
    .sort((a, b) =>
      a.label.localeCompare(b.label, 'en-IN', {
        numeric: true,
        sensitivity: 'base',
      }),
    );
  const optionKeys = options.map((option) => option.key);
  const selectedCount =
    selectedKeys == null
      ? options.length
      : options.filter((option) => selectedKeys.has(option.key)).length;
  const visibleOptions =
    normalizedSearch.length === 0
      ? options
      : options.filter((option) => option.label.toLowerCase().includes(normalizedSearch));
  const allVisibleValuesSelected = options.length > 0 && selectedCount === options.length;
  const summary = getFilterSummary(selectedCount, options.length);

  const commitSelection = (nextSelectedKeys: Set<string>) => {
    const nextValue = optionKeys.filter((key) => nextSelectedKeys.has(key));

    onDraftColumnFiltersChange(
      setDraftFilterValue(
        draftColumnFilters,
        column.id,
        nextValue.length === optionKeys.length ? null : nextValue,
      ),
    );
  };

  const handleOptionChange = (optionKey: string, checked: boolean) => {
    const nextSelectedKeys = new Set(selectedKeys ?? optionKeys);

    if (checked) {
      nextSelectedKeys.add(optionKey);
    } else {
      nextSelectedKeys.delete(optionKey);
    }

    commitSelection(nextSelectedKeys);
  };

  const handleSelectAll = () => {
    onDraftColumnFiltersChange(setDraftFilterValue(draftColumnFilters, column.id, null));
  };

  const handleDeselectAll = () => {
    onDraftColumnFiltersChange(setDraftFilterValue(draftColumnFilters, column.id, []));
  };

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        aria-expanded={isOpen}
        onClick={onToggleOpen}
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-foreground">
            {columnLabel}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">{summary}</span>
          <ChevronDown
            className={cn(
              'size-4 text-muted-foreground transition-transform',
              isOpen && 'rotate-180',
            )}
            aria-hidden
          />
        </span>
      </button>

      {isOpen ? (
        <div className="border-t border-border">
          <div className="relative border-b border-border">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={`Search ${columnLabel.toLowerCase()}...`}
              className="h-11 rounded-none border-0 bg-background pl-10 pr-10 focus-visible:ring-0"
              aria-label={`Search ${columnLabel} filter values`}
            />
            {searchQuery ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label={`Clear ${columnLabel} search`}
                onClick={() => onSearchChange('')}
              >
                <X className="size-3.5" aria-hidden />
              </Button>
            ) : null}
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {visibleOptions.length > 0 ? (
              visibleOptions.map((option, index) => {
                const optionId = `${column.id}-filter-${index}`;
                const checked = selectedKeys == null || selectedKeys.has(option.key);

                return (
                  <label
                    key={`${option.key}-${index}`}
                    htmlFor={optionId}
                    className="flex min-h-11 cursor-pointer items-center gap-3 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted/40"
                  >
                    <Checkbox
                      id={optionId}
                      checked={checked}
                      onCheckedChange={(value) => handleOptionChange(option.key, value === true)}
                      aria-label={`${checked ? 'Remove' : 'Add'} ${option.label} ${columnLabel} filter`}
                    />
                    <span
                      className={cn(
                        'min-w-0 flex-1 truncate',
                        option.isBlank && 'text-muted-foreground',
                      )}
                      title={option.label}
                    >
                      {option.label}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {option.count.toLocaleString('en-IN')}
                    </span>
                  </label>
                );
              })
            ) : (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No values match this search.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/20 px-4 py-3">
            <p className="min-w-0 truncate text-sm text-muted-foreground">
              <span className="tabular-nums">
                {selectedCount.toLocaleString('en-IN')} of {options.length.toLocaleString('en-IN')}
              </span>{' '}
              selected
            </p>
            {allVisibleValuesSelected ? (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto shrink-0 px-0 text-primary"
                disabled={options.length === 0}
                onClick={handleDeselectAll}
              >
                Deselect all
              </Button>
            ) : (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto shrink-0 px-0 text-primary"
                disabled={options.length === 0}
                onClick={handleSelectAll}
              >
                Select all
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

const FiltersTab = <TData extends RowData>({
  table,
  draftColumnFilters,
  onDraftColumnFiltersChange,
}: FiltersTabProps<TData>) => {
  const filterableColumns = useMemo(
    () => table.getAllLeafColumns().filter((column) => column.getCanFilter()),
    [table],
  );
  const [openColumnId, setOpenColumnId] = useState<string | null>(filterableColumns[0]?.id ?? null);
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

  if (filterableColumns.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
        <p className="text-sm font-medium text-foreground">No filterable columns</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This table does not expose any column filters yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Column filters
        </p>
        <p className="text-sm text-muted-foreground">
          Choose the values to keep in each column, then apply changes.
        </p>
      </div>

      <div className="space-y-2">
        {filterableColumns.map((column) => (
          <ColumnFilterSection
            key={column.id}
            column={column}
            isOpen={openColumnId === column.id}
            draftColumnFilters={draftColumnFilters}
            searchQuery={searchQueries[column.id] ?? ''}
            onToggleOpen={() =>
              setOpenColumnId((current) => (current === column.id ? null : column.id))
            }
            onSearchChange={(value) =>
              setSearchQueries((current) => ({
                ...current,
                [column.id]: value,
              }))
            }
            onDraftColumnFiltersChange={onDraftColumnFiltersChange}
          />
        ))}
      </div>
    </div>
  );
};

export default FiltersTab;

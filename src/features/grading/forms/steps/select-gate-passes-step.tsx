import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import type { RowSelectionState } from '@tanstack/react-table';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  SearchableOptionCombobox,
  filterAndSortOptions,
  type ComboboxOption,
} from '@/components/searchable-option-combobox';
import type { GradingFormApi } from '@/features/grading/forms/use-grading-form';
import type { IncomingGatePassesByFarmerParams } from '@/features/incoming/api/types';
import { useIncomingGatePassesByFarmer } from '@/features/incoming/api/use-incoming-gate-passes-by-farmer';
import { useFarmerLinkOptions } from '@/features/people/api/use-farmer-link-options';
import { farmerLinkOptionsToComboboxOptions } from '@/features/people/utils/farmer-link-combobox';
import { getGradingGatePassColumns } from './columns';
import type { GradingSelectIncomingGatePasses } from '../../types';
import { POTATO_VARIETY_OPTIONS } from '@/lib/constants';
import { DataTable } from './data-table';

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

function idsToRowSelection(ids: string[]): RowSelectionState {
  return Object.fromEntries(ids.map((id) => [id, true]));
}

function rowSelectionToIds(selection: RowSelectionState): string[] {
  return Object.keys(selection).filter((id) => selection[id]);
}

const INCOMING_GATE_PASSES_BY_FARMER_PARAMS: IncomingGatePassesByFarmerParams = {
  sortOrder: 'desc',
  status: 'ungraded',
};

type SelectGatePassesStepProps = {
  form: GradingFormApi;
  linkedGatePasses?: GradingSelectIncomingGatePasses[];
  prefilledFarmerOption?: ComboboxOption;
  /** Combobox display text when editing an existing grading pass */
  initialFarmerSearchLabel?: string;
  initialVariety?: string;
  showActionsColumn?: boolean;
  /** Edit flow: farmer is fixed; variety and gate pass selection remain editable */
  isFarmerLinkReadOnly?: boolean;
  gradingGatePassId?: string;
};

function resolveComboboxSearchLabel(value: string, options: ComboboxOption[]): string {
  if (!value.trim()) return '';
  const match = options.find((option) => option.id === value);
  return match?.label ?? value;
}

type GatePassesTableSectionProps = {
  form: GradingFormApi;
  farmerStorageLinkId: string;
  variety: string;
  gatePasses: GradingSelectIncomingGatePasses[];
  linkedGatePasses?: GradingSelectIncomingGatePasses[];
  isLoadingGatePasses: boolean;
  showActionsColumn?: boolean;
  gradingGatePassId?: string;
};

function GatePassesTableSection({
  form,
  farmerStorageLinkId,
  variety,
  gatePasses,
  linkedGatePasses = [],
  isLoadingGatePasses,
  showActionsColumn = false,
  gradingGatePassId,
}: GatePassesTableSectionProps) {
  const getGatePassRowId = useCallback((row: GradingSelectIncomingGatePasses) => row._id, []);

  const tableColumns = useMemo(
    () =>
      getGradingGatePassColumns({
        showActions: showActionsColumn,
        gradingGatePassId,
        farmerStorageLinkId,
      }),
    [showActionsColumn, gradingGatePassId, farmerStorageLinkId],
  );

  const tableData = useMemo(() => {
    if (!farmerStorageLinkId.trim() || !variety.trim()) return [];

    const filtered = gatePasses.filter((gatePass) => gatePass.variety === variety);
    const merged = [...filtered];

    for (const linked of linkedGatePasses) {
      if (linked.variety !== variety) continue;
      if (merged.some((row) => row._id === linked._id)) continue;
      merged.push(linked);
    }

    return merged.sort((a, b) => b.gatePassNo - a.gatePassNo);
  }, [farmerStorageLinkId, gatePasses, linkedGatePasses, variety]);

  return (
    <form.Field name="selectedIncomingGatePassIds">
      {(field) => {
        const isInvalid = isFieldInvalid(field.state.meta);
        const rowSelection = idsToRowSelection(field.state.value);

        return (
          <Field className="gap-3" data-invalid={isInvalid}>
            <FieldLabel>Gate passes</FieldLabel>
            <FieldDescription>
              Select incoming gate passes for the chosen farmer and variety. Use the search box to
              filter by manual gate pass number.
            </FieldDescription>
            <DataTable
              columns={tableColumns}
              data={tableData}
              getRowId={getGatePassRowId}
              isLoading={isLoadingGatePasses}
              rowSelection={rowSelection}
              onRowSelectionChange={(updater) => {
                const next = typeof updater === 'function' ? updater(rowSelection) : updater;
                field.handleChange(rowSelectionToIds(next));
              }}
            />
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}

type VarietyFieldProps = {
  form: GradingFormApi;
  varietyOptions: ComboboxOption[];
  disabled: boolean;
  selectedVariety: string;
};

function VarietyField({ form, varietyOptions, disabled, selectedVariety }: VarietyFieldProps) {
  const [varietySearch, setVarietySearch] = useState(() => selectedVariety);
  const [varietyComboboxOpen, setVarietyComboboxOpen] = useState(false);

  const resolvedVarietyLabel = useMemo(
    () => resolveComboboxSearchLabel(selectedVariety, varietyOptions),
    [selectedVariety, varietyOptions],
  );

  const comboboxSearch = useMemo(() => {
    if (varietyComboboxOpen) return varietySearch;
    if (!selectedVariety.trim()) return '';
    return varietySearch.trim() ? varietySearch : resolvedVarietyLabel;
  }, [varietyComboboxOpen, varietySearch, selectedVariety, resolvedVarietyLabel]);

  const handleVarietyComboboxOpenChange = useCallback(
    (open: boolean) => {
      setVarietyComboboxOpen(open);
      if (!open) return;
      if (!selectedVariety.trim()) {
        setVarietySearch('');
        return;
      }
      setVarietySearch((current) => (current.trim() ? current : resolvedVarietyLabel));
    },
    [selectedVariety, resolvedVarietyLabel],
  );

  const sortedVarieties = useMemo(
    () => filterAndSortOptions(varietySearch, varietyOptions),
    [varietySearch, varietyOptions],
  );

  return (
    <form.Field name="variety">
      {(field) => {
        const isInvalid = isFieldInvalid(field.state.meta);
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor="select-gate-passes-variety">Variety</FieldLabel>
            <SearchableOptionCombobox
              id="select-gate-passes-variety"
              name={field.name}
              value={field.state.value}
              onValueChange={(value) => {
                if (value === field.state.value) return;
                field.handleChange(value);
                form.setFieldValue('selectedIncomingGatePassIds', []);
              }}
              onBlur={field.handleBlur}
              isInvalid={isInvalid}
              disabled={disabled}
              placeholder={
                disabled
                  ? 'Select a farmer first…'
                  : varietyOptions.length === 0
                    ? 'No varieties found'
                    : 'Search varieties…'
              }
              emptyMessage="No varieties found."
              options={varietyOptions}
              sortedOptions={sortedVarieties}
              search={comboboxSearch}
              setSearch={setVarietySearch}
              open={varietyComboboxOpen}
              setOpen={handleVarietyComboboxOpenChange}
            />
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}

export function SelectGatePassesStep({
  form,
  linkedGatePasses,
  prefilledFarmerOption,
  initialFarmerSearchLabel = '',
  initialVariety = '',
  showActionsColumn = false,
  isFarmerLinkReadOnly = false,
  gradingGatePassId,
}: SelectGatePassesStepProps) {
  const { data: farmerLinkOptions = [], isLoading: isLoadingFarmers } = useFarmerLinkOptions();
  const farmerOptions = useMemo<ComboboxOption[]>(() => {
    const options = farmerLinkOptionsToComboboxOptions(farmerLinkOptions);
    if (!prefilledFarmerOption) return options;
    if (options.some((option) => option.id === prefilledFarmerOption.id)) {
      return options;
    }
    return [...options, prefilledFarmerOption];
  }, [farmerLinkOptions, prefilledFarmerOption]);
  const [farmerSearch, setFarmerSearch] = useState(() => initialFarmerSearchLabel);
  const [farmerComboboxOpen, setFarmerComboboxOpen] = useState(false);

  const sortedFarmers = useMemo(
    () => filterAndSortOptions(farmerSearch, farmerOptions),
    [farmerSearch, farmerOptions],
  );

  const resetVarietyAndSelection = useCallback(() => {
    form.setFieldValue('variety', '');
    form.setFieldValue('selectedIncomingGatePassIds', []);
  }, [form]);

  return (
    <form.Subscribe
      selector={(state) => ({
        farmerStorageLinkId: state.values.farmerStorageLinkId,
        variety: state.values.variety,
      })}
      children={({ farmerStorageLinkId, variety }) => (
        <SelectGatePassesStepContent
          form={form}
          linkedGatePasses={linkedGatePasses}
          showActionsColumn={showActionsColumn}
          isFarmerLinkReadOnly={isFarmerLinkReadOnly}
          gradingGatePassId={gradingGatePassId}
          farmerStorageLinkId={farmerStorageLinkId}
          variety={variety}
          initialVariety={initialVariety}
          farmerOptions={farmerOptions}
          sortedFarmers={sortedFarmers}
          farmerSearch={farmerSearch}
          setFarmerSearch={setFarmerSearch}
          farmerComboboxOpen={farmerComboboxOpen}
          setFarmerComboboxOpen={setFarmerComboboxOpen}
          isLoadingFarmers={isLoadingFarmers}
          resetVarietyAndSelection={resetVarietyAndSelection}
        />
      )}
    />
  );
}

type SelectGatePassesStepContentProps = {
  form: GradingFormApi;
  linkedGatePasses?: GradingSelectIncomingGatePasses[];
  showActionsColumn?: boolean;
  isFarmerLinkReadOnly: boolean;
  gradingGatePassId?: string;
  farmerStorageLinkId: string;
  variety: string;
  initialVariety: string;
  farmerOptions: ComboboxOption[];
  sortedFarmers: ComboboxOption[];
  farmerSearch: string;
  setFarmerSearch: Dispatch<SetStateAction<string>>;
  farmerComboboxOpen: boolean;
  setFarmerComboboxOpen: (open: boolean) => void;
  isLoadingFarmers: boolean;
  resetVarietyAndSelection: () => void;
};

function SelectGatePassesStepContent({
  form,
  linkedGatePasses,
  showActionsColumn = false,
  isFarmerLinkReadOnly,
  gradingGatePassId,
  farmerStorageLinkId,
  variety,
  initialVariety,
  farmerOptions,
  sortedFarmers,
  farmerSearch,
  setFarmerSearch,
  farmerComboboxOpen,
  setFarmerComboboxOpen,
  isLoadingFarmers,
  resetVarietyAndSelection,
}: SelectGatePassesStepContentProps) {
  const resolvedFarmerLabel = useMemo(
    () => resolveComboboxSearchLabel(farmerStorageLinkId, farmerOptions),
    [farmerStorageLinkId, farmerOptions],
  );

  const comboboxFarmerSearch = useMemo(() => {
    if (farmerComboboxOpen) return farmerSearch;
    if (!farmerStorageLinkId.trim()) return farmerSearch;
    return farmerSearch.trim() ? farmerSearch : resolvedFarmerLabel;
  }, [farmerComboboxOpen, farmerSearch, farmerStorageLinkId, resolvedFarmerLabel]);

  const handleFarmerComboboxOpenChange = useCallback(
    (open: boolean) => {
      setFarmerComboboxOpen(open);
      if (!open) return;
      if (!farmerStorageLinkId.trim()) {
        setFarmerSearch('');
        return;
      }
      setFarmerSearch((current) => (current.trim() ? current : resolvedFarmerLabel));
    },
    [farmerStorageLinkId, resolvedFarmerLabel, setFarmerComboboxOpen, setFarmerSearch],
  );

  const {
    data: gatePassResult,
    isLoading: isLoadingGatePasses,
    isFetching: isFetchingGatePasses,
  } = useIncomingGatePassesByFarmer(farmerStorageLinkId, INCOMING_GATE_PASSES_BY_FARMER_PARAMS);

  const gatePasses = useMemo(() => {
    const rows = gatePassResult?.incomingGatePasses ?? [];
    return rows.filter((gatePass) => gatePass.status === 'NOT_GRADED');
  }, [gatePassResult?.incomingGatePasses]);

  const varietyOptions = useMemo<ComboboxOption[]>(() => {
    const currentVariety = variety.trim();
    if (
      currentVariety.length > 0 &&
      !POTATO_VARIETY_OPTIONS.some((option) => option.id === currentVariety)
    ) {
      return [...POTATO_VARIETY_OPTIONS, { id: currentVariety, label: currentVariety }];
    }

    return POTATO_VARIETY_OPTIONS;
  }, [variety]);

  const showGatePassLoading =
    farmerStorageLinkId.trim().length > 0 && (isLoadingGatePasses || isFetchingGatePasses);

  return (
    <div className="flex flex-col gap-8">
      <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <form.Field name="farmerStorageLinkId">
          {(field) => {
            const isInvalid = isFieldInvalid(field.state.meta);
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="select-gate-passes-farmer">Farmer Link</FieldLabel>
                <SearchableOptionCombobox
                  id="select-gate-passes-farmer"
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(value) => {
                    if (isFarmerLinkReadOnly || value === field.state.value) {
                      return;
                    }
                    field.handleChange(value);
                    resetVarietyAndSelection();
                  }}
                  onBlur={field.handleBlur}
                  isInvalid={isInvalid}
                  disabled={isLoadingFarmers || isFarmerLinkReadOnly}
                  placeholder={
                    isFarmerLinkReadOnly
                      ? comboboxFarmerSearch || '—'
                      : isLoadingFarmers
                        ? 'Loading farmers…'
                        : 'Search farmers…'
                  }
                  emptyMessage="No farmers found."
                  options={farmerOptions}
                  sortedOptions={sortedFarmers}
                  search={comboboxFarmerSearch}
                  setSearch={setFarmerSearch}
                  open={farmerComboboxOpen}
                  setOpen={handleFarmerComboboxOpenChange}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <VarietyField
          form={form}
          varietyOptions={varietyOptions}
          selectedVariety={variety || initialVariety}
          disabled={
            isFarmerLinkReadOnly
              ? showGatePassLoading
              : !farmerStorageLinkId.trim() || showGatePassLoading
          }
        />
      </FieldGroup>

      <GatePassesTableSection
        form={form}
        farmerStorageLinkId={farmerStorageLinkId}
        variety={variety}
        gatePasses={gatePasses}
        linkedGatePasses={linkedGatePasses}
        showActionsColumn={showActionsColumn}
        gradingGatePassId={gradingGatePassId}
        isLoadingGatePasses={variety.trim().length > 0 && showGatePassLoading}
      />
    </div>
  );
}

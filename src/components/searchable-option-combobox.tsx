import type { RefObject } from 'react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { cn } from '@/lib/utils';

export type ComboboxOption = {
  id: string;
  label: string;
  name?: string;
  accountNumber?: number;
};

export type SearchableOptionComboboxProps = {
  id: string;
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  onBlur: () => void;
  isInvalid: boolean;
  placeholder: string;
  emptyMessage: string;
  options: ComboboxOption[];
  sortedOptions: ComboboxOption[];
  search: string;
  setSearch: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  disabled?: boolean;
  portalContainer?: RefObject<HTMLElement | ShadowRoot | null>;
};

const TOKEN_SEPARATOR_REGEX = /[\s./\-_,]+/;

function tokenizeLabel(label: string): string[] {
  return label
    .split(TOKEN_SEPARATOR_REGEX)
    .map((token) => token.trim())
    .filter(Boolean);
}

type MatchScore = {
  rank: number;
  tokenIndex: number;
  matchPosition: number;
  label: string;
};

function getMatchScore(label: string, query: string): MatchScore | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return { rank: 0, tokenIndex: 0, matchPosition: 0, label };
  }

  const labelLower = label.toLowerCase();
  const tokens = tokenizeLabel(label).map((token) => token.toLowerCase());

  if (labelLower === normalized) {
    return { rank: 1, tokenIndex: 0, matchPosition: 0, label };
  }

  const tokenStartIndex = tokens.findIndex((token) => token.startsWith(normalized));
  if (tokenStartIndex !== -1) {
    return {
      rank: 2,
      tokenIndex: tokenStartIndex,
      matchPosition: tokenStartIndex,
      label,
    };
  }

  if (labelLower.startsWith(normalized)) {
    return {
      rank: 3,
      tokenIndex: Number.MAX_SAFE_INTEGER,
      matchPosition: 0,
      label,
    };
  }

  const containsIndex = labelLower.indexOf(normalized);
  if (containsIndex !== -1) {
    return {
      rank: 4,
      tokenIndex: Number.MAX_SAFE_INTEGER,
      matchPosition: containsIndex,
      label,
    };
  }

  return null;
}

function compareMatchScores(a: MatchScore, b: MatchScore): number {
  if (a.rank !== b.rank) {
    return a.rank - b.rank;
  }

  if (a.rank === 2 && a.tokenIndex !== b.tokenIndex) {
    return a.tokenIndex - b.tokenIndex;
  }

  if (a.rank === 4 && a.matchPosition !== b.matchPosition) {
    return a.matchPosition - b.matchPosition;
  }

  return a.label.localeCompare(b.label);
}

// eslint-disable-next-line react-refresh/only-export-components
export function filterAndSortOptions(query: string, options: ComboboxOption[]): ComboboxOption[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return options;
  }

  return options
    .map((option) => ({
      option,
      score: getMatchScore(option.label, normalized),
    }))
    .filter((entry): entry is { option: ComboboxOption; score: MatchScore } => entry.score !== null)
    .sort((a, b) => compareMatchScores(a.score, b.score))
    .map((entry) => entry.option);
}

export function SearchableOptionCombobox({
  id,
  name,
  value,
  onValueChange,
  onBlur,
  isInvalid,
  placeholder,
  emptyMessage,
  options,
  sortedOptions,
  search,
  setSearch,
  open,
  setOpen,
  disabled = false,
  portalContainer,
}: SearchableOptionComboboxProps) {
  const selected = options.find((option) => option.id === value) ?? null;

  return (
    <Combobox
      items={options}
      filteredItems={sortedOptions}
      filter={null}
      itemToStringLabel={(option) => option.label}
      itemToStringValue={(option) => option.label}
      value={selected}
      inputValue={search}
      open={open}
      onOpenChange={setOpen}
      autoHighlight={'always' as unknown as boolean}
      onInputValueChange={(inputValue) => {
        setSearch(inputValue);
        if (!inputValue.trim()) {
          return;
        }
        const matches = filterAndSortOptions(inputValue, options);
        onValueChange(matches[0]?.id ?? '');
      }}
      onValueChange={(val) => {
        onValueChange(val ? val.id : '');
        setSearch(val ? val.label : '');
      }}
    >
      <ComboboxInput
        id={id}
        name={name}
        placeholder={placeholder}
        aria-invalid={isInvalid}
        disabled={disabled}
        onFocus={() => {
          if (!disabled) setOpen(true);
        }}
        onBlur={onBlur}
        className={cn(
          'w-full',
          disabled &&
            'cursor-not-allowed **:data-[slot=input-group-control]:cursor-not-allowed **:data-[slot=input-group-button]:cursor-not-allowed',
        )}
      />
      <ComboboxContent portalContainer={portalContainer}>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(option) => (
            <ComboboxItem key={option.id} value={option}>
              {option.name != null && option.accountNumber != null ? (
                <>
                  <span>{option.name}</span>
                  <span className="text-muted-foreground"> (Account #{option.accountNumber})</span>
                </>
              ) : (
                option.label
              )}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

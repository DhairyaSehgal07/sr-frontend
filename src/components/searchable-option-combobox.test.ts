import { describe, expect, it } from 'vitest';

import { filterAndSortOptions, type ComboboxOption } from '@/components/searchable-option-combobox';

const TEST_VARIETIES: ComboboxOption[] = [
  { id: 'K. Pukhraj', label: 'K. Pukhraj' },
  { id: 'Pushkar', label: 'Pushkar' },
  { id: 'PBW 343', label: 'PBW 343' },
  { id: 'HD 3086', label: 'HD 3086' },
  { id: 'Raj 3077', label: 'Raj 3077' },
];

function labels(options: ComboboxOption[]) {
  return options.map((option) => option.label);
}

describe('filterAndSortOptions', () => {
  it('prioritizes K. Pukhraj for query Puk', () => {
    expect(labels(filterAndSortOptions('Puk', TEST_VARIETIES))).toEqual(['K. Pukhraj']);
  });

  it('ranks Raj 3077 before K. Pukhraj for query Raj', () => {
    expect(labels(filterAndSortOptions('Raj', TEST_VARIETIES))).toEqual(['Raj 3077', 'K. Pukhraj']);
  });

  it('matches HD 3086 for query 308', () => {
    expect(labels(filterAndSortOptions('308', TEST_VARIETIES))).toEqual(['HD 3086']);
  });

  it('matches PBW 343 for query PBW', () => {
    expect(labels(filterAndSortOptions('PBW', TEST_VARIETIES))).toEqual(['PBW 343']);
  });

  it('matches Pushkar for query Push', () => {
    expect(labels(filterAndSortOptions('Push', TEST_VARIETIES))).toEqual(['Pushkar']);
  });

  it('matches token prefixes and single-letter variety codes', () => {
    expect(labels(filterAndSortOptions('Pukh', TEST_VARIETIES))).toEqual(['K. Pukhraj']);
    expect(labels(filterAndSortOptions('K', TEST_VARIETIES))).toContain('K. Pukhraj');
  });
});

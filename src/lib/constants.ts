export const BAG_SIZES = [
  'Ration',
  'Seed',
  'Goli',
  'Number-8',
  'Number-10',
  'Number-12',
  'Number-6/4',
  'Cut',
] as const;

export const BAG_TYPES = ['JUTE', 'LENO'] as const;

export type BagType = (typeof BAG_TYPES)[number];

export const DEFAULT_BAG_TYPE = 'JUTE';

/** Example chamber values (free-text in storage forms; used for placeholders) */
export const CHAMBERS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

/** Example floor values (free-text in storage forms; used for placeholders) */
export const FLOORS = ['1', '2', '3', '4'] as const;

/** Example row values (free-text in storage forms; used for placeholders) */
export const STORAGE_ROWS = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
] as const;

export const DEFAULT_CHAMBER = CHAMBERS[0];
export const DEFAULT_FLOOR = FLOORS[0];
export const DEFAULT_STORAGE_ROW = STORAGE_ROWS[0];

export const STORAGE_CATEGORIES = [
  'OWNED',
  'PURCHASED',
  'CONTRACT FARMING',
  'RENTAL',
  'FAZALPUR',
] as const;

export const INCOMING_CATEGORIES = [
  'Own Stock',
  'Contract Farming',
  'Fazalpur',
  'Purchases-Apr',
  'Conversion',
  'Transfer From Stores',
] as const;

export const OUTGOING_CATEGORIES = ['Outgoing to Shed', 'Outgoing To Farmer'] as const;

export type OutgoingCategory = (typeof OUTGOING_CATEGORIES)[number];

export const INCOMING_STAGES = [
  'G0',
  'G1',
  'G2',
  'G3',
  'Government',
  'Ration',
  'Unspecial',
  'BR',
] as const;

export const INCOMING_GATE_PASS_STATUSES = ['Graded', 'Ungraded'] as const;

export const JUTE_BAG_WEIGHT = 0.7;
export const LENO_BAG_WEIGHT = 0.06;

export const DISPATCH_PRE_STORAGE_CATEGORIES = [
  'Consumption/Donation',
  'Contract Farming',
  'Fazalpur',
  'Local Sale',
  'Sowing',
  'Transfer to other store',
  'Truck Loading',
] as const;

export const POTATO_VARIETIES = [
  'Atlantic',
  'Cardinal',
  'Chipsona 1',
  'Chipsona 2',
  'Chipsona 3',
  'Colomba',
  'Desiree',
  'Diamond',
  'Suriya',
  'FC - 11',
  'FC - 12',
  'FC - 5',
  'Himalini',
  'Fry Sona',
  'KCM',
  'K. Badshah',
  'K. Chandramukhi',
  'K. Jyoti',
  'K. Pukhraj',
  'Kuroda',
  'Khyati',
  'L.R',
  'Lav Kar',
  'Lima',
  'Mohan',
  'Pushkar',
  'SU - Khyati',
  'Super Six',
] as const;

export type PotatoVariety = (typeof POTATO_VARIETIES)[number];

export const POTATO_VARIETY_OPTIONS = POTATO_VARIETIES.map((value) => ({
  id: value,
  label: value,
}));

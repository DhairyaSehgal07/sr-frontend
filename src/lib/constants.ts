export const BAG_SIZES = [
  'Ration',
  'Seed',
  'Goli',
  'Keri',
  'Number-8',
  'Number-9',
  'Number-10',
  'Number-11',
  'Number-12',
  'Number-6/4',
  'Cut',
  'Cut-Ration',
  'Cut-Seed',
  'Cut-Goli',
] as const;

export const DISPATCH_PRE_STORAGE_CATEGORIES = [
  'Consumption/Donation',
  'Contract Farming',
  'Local Sale',
  'Sowing',
  'Other State',
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

import {
  assignTableAPIs,
  functionalUpdate,
  makeStateUpdater,
  type OnChangeFn,
  type RowData,
  type TableFeature,
  type TableFeatures,
  type Updater,
} from '@tanstack/react-table';

export type DensityState = 'sm' | 'md' | 'lg';

export interface TableState_Density {
  density: DensityState;
}

export interface TableOptions_Density {
  enableDensity?: boolean;
  onDensityChange?: OnChangeFn<DensityState>;
}

export interface Table_Density {
  setDensity: (updater: Updater<DensityState>) => void;
  toggleDensity: (value?: DensityState) => void;
}

declare module '@tanstack/react-table' {
  interface Plugins {
    densityPlugin: TableFeature;
  }

  interface TableState_FeatureMap {
    densityPlugin: TableState_Density;
  }

  interface TableOptions_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    densityPlugin: TableOptions_Density;
  }

  interface Table_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
    densityPlugin: Table_Density;
  }
}

export const densityPlugin: TableFeature = {
  getInitialState: (initialState) => ({
    density: 'md',
    ...initialState,
  }),

  getDefaultTableOptions: (table) => ({
    enableDensity: true,
    onDensityChange: makeStateUpdater('density', table),
  }),

  constructTableAPIs: (table) => {
    const onDensityChange = (table.options as TableOptions_Density).onDensityChange;

    assignTableAPIs('densityPlugin', table, {
      table_setDensity: {
        fn: (updater: Updater<DensityState>) => {
          const safeUpdater: Updater<DensityState> = (old) => functionalUpdate(updater, old);
          return onDensityChange?.(safeUpdater);
        },
      },
      table_toggleDensity: {
        fn: (value?: DensityState) => {
          const safeUpdater: Updater<DensityState> = (old) => {
            if (value) return value;
            return old === 'lg' ? 'md' : old === 'md' ? 'sm' : 'lg';
          };
          return onDensityChange?.(safeUpdater);
        },
      },
    });
  },
};

import { combineSlices, configureStore } from '@reduxjs/toolkit';
import { estimateSlice } from '../features/estimate/estimateSlice.ts';
import { healthSlice } from '../features/health/healthSlice.ts';

// Add every new slice here; combineSlices infers RootState from them.
export const rootReducer = combineSlices(healthSlice, estimateSlice);

export type RootState = ReturnType<typeof rootReducer>;

/** Factory function so tests can build an isolated store with preloaded state. */
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({ reducer: rootReducer, preloadedState });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];

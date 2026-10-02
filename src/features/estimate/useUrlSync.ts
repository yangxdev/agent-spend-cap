import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks.ts';
import { estimateSlice, hydrateFromSearch, selectRaw } from './estimateSlice.ts';
import { FIELD_SPECS } from './fields.ts';

/**
 * Reads the query string into the store on mount, then keeps `location.search` in step with the raw fields.
 * Nothing is written until the store has left its initial state, so opening a shared link is never wiped.
 */
export function useUrlSync() {
  const dispatch = useAppDispatch();
  const raw = useAppSelector(selectRaw);

  useEffect(() => {
    dispatch(hydrateFromSearch(window.location.search));
  }, [dispatch]);

  useEffect(() => {
    if (raw === estimateSlice.getInitialState()) return;
    const params = new URLSearchParams();
    for (const { key } of FIELD_SPECS) {
      const value = raw[key].trim();
      if (value) params.set(key, value);
    }
    if (raw.tool !== 'generic') params.set('tool', raw.tool);
    const query = params.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
    );
  }, [raw]);
}

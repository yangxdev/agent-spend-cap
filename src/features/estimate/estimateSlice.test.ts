import { describe, expect, it } from 'vitest';
import { makeStore } from '../../app/store.ts';
import {
  hydrateFromSearch,
  loadExample,
  selectEstimate,
  selectFieldErrors,
  selectInputs,
  setField,
} from './estimateSlice.ts';

describe('estimateSlice', () => {
  it('AC5: selector is null when empty and an Estimate after loadExample', () => {
    const store = makeStore();
    expect(selectEstimate(store.getState())).toBeNull();
    store.dispatch(loadExample());
    expect(selectEstimate(store.getState())?.worst).toBeGreaterThan(0);
  });

  it('keeps half-typed text and reports invalid fields', () => {
    const store = makeStore();
    store.dispatch(loadExample());
    store.dispatch(setField({ field: 'ip', value: '2.' }));
    expect(store.getState().estimate.ip).toBe('2.');
    store.dispatch(setField({ field: 'ot', value: 'abc' }));
    expect(selectEstimate(store.getState())).toBeNull();
    expect(selectFieldErrors(store.getState()).ot).toMatch(/number/);
  });

  it('AC2: empty retries counts as 0 and empty cap as null', () => {
    const store = makeStore();
    store.dispatch(loadExample());
    store.dispatch(setField({ field: 'r', value: '' }));
    expect(selectInputs(store.getState())).toMatchObject({ retries: 0, capUsd: null });
  });

  it('AC6: hydrates from a query string', () => {
    const store = makeStore();
    store.dispatch(hydrateFromSearch('?ip=3&op=15&it=1000&ot=500&t=10&a=2&r=1&tool=codex'));
    expect(store.getState().estimate).toMatchObject({ ip: '3', r: '1', tool: 'codex' });
    expect(selectEstimate(store.getState())?.worst).toBeCloseTo(0.42);
  });
});

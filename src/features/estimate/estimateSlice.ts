import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { EXAMPLE_RUN, estimate } from './estimate.ts';
import { FIELD_SPECS, parseField, type NumericKey, type ToolId } from './fields.ts';
import type { RunInputs } from './types.ts';
import { decodeInputs, decodeTool } from './url.ts';

export type EstimateState = Record<NumericKey, string> & { tool: ToolId };

const initialState: EstimateState = {
  ip: '',
  op: '',
  it: '',
  ot: '',
  t: '',
  a: '',
  r: '',
  cap: '',
  tool: 'generic',
};

export const estimateSlice = createSlice({
  name: 'estimate',
  initialState,
  reducers: {
    setField(state, action: PayloadAction<{ field: NumericKey; value: string }>) {
      state[action.payload.field] = action.payload.value;
    },
    setTool(state, action: PayloadAction<ToolId>) {
      state.tool = action.payload;
    },
    loadExample(state) {
      for (const spec of FIELD_SPECS) {
        const value = EXAMPLE_RUN[spec.prop];
        state[spec.key] = value === null ? '' : String(value);
      }
    },
    hydrateFromSearch(state, action: PayloadAction<string>) {
      const decoded = decodeInputs(action.payload);
      for (const spec of FIELD_SPECS) {
        const value = decoded[spec.prop];
        if (value !== undefined && value !== null) state[spec.key] = String(value);
      }
      const tool = decodeTool(action.payload);
      if (tool) state.tool = tool;
    },
  },
});

export const { setField, setTool, loadExample, hydrateFromSearch } = estimateSlice.actions;

interface SliceRoot {
  estimate: EstimateState;
}

export const selectRaw = (state: SliceRoot) => state.estimate;

/** Message for each non-empty field that is not a valid number in range. */
export const selectFieldErrors = createSelector(selectRaw, (raw) => {
  const errors: Partial<Record<NumericKey, string>> = {};
  for (const spec of FIELD_SPECS) {
    if (parseField(raw[spec.key], spec.max).kind === 'invalid') {
      errors[spec.key] = `Enter a number from 0 to ${spec.max.toLocaleString('en-US')}.`;
    }
  }
  return errors;
});

/** The parsed inputs, or null while a required field is empty or invalid. */
export const selectInputs = createSelector(selectRaw, (raw): RunInputs | null => {
  const values: Record<string, number | null> = {};
  for (const spec of FIELD_SPECS) {
    const parsed = parseField(raw[spec.key], spec.max);
    if (parsed.kind === 'invalid') return null;
    if (parsed.kind === 'empty') {
      if (spec.required) return null;
      values[spec.prop] = spec.prop === 'capUsd' ? null : 0;
    } else {
      values[spec.prop] = parsed.value;
    }
  }
  return values as unknown as RunInputs;
});

export const selectEstimate = createSelector(selectInputs, (inputs) =>
  inputs ? estimate(inputs) : null,
);

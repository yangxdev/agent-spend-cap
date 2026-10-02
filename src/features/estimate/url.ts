import { FIELD_SPECS, TOOL_IDS, type ToolId } from './fields.ts';
import type { RunInputs } from './types.ts';

export function encodeInputs(inputs: RunInputs, tool?: ToolId): string {
  const params = new URLSearchParams();
  for (const spec of FIELD_SPECS) {
    const value = inputs[spec.prop];
    if (value !== null) params.set(spec.key, String(value));
  }
  if (tool) params.set('tool', tool);
  return params.toString();
}

/** Reads known keys, drops negative, blank and non-finite values, clamps oversized ones. Never throws. */
export function decodeInputs(search: string): Partial<RunInputs> {
  const params = new URLSearchParams(search);
  const result: Partial<RunInputs> = {};
  for (const spec of FIELD_SPECS) {
    const text = params.get(spec.key)?.trim();
    if (!text) continue;
    const value = Number(text);
    if (!Number.isFinite(value) || value < 0) continue;
    result[spec.prop] = Math.min(value, spec.max);
  }
  return result;
}

export function decodeTool(search: string): ToolId | null {
  const tool = new URLSearchParams(search).get('tool');
  return TOOL_IDS.find((id) => id === tool) ?? null;
}

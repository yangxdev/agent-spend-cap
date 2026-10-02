import type { RunInputs } from './types.ts';

export const TOOL_IDS = ['claude-code', 'codex', 'generic'] as const;
export type ToolId = (typeof TOOL_IDS)[number];

/** Query-string keys, which are also the keys of the raw form state. */
export type NumericKey = 'ip' | 'op' | 'it' | 'ot' | 't' | 'a' | 'r' | 'cap';

export interface FieldSpec {
  key: NumericKey;
  prop: keyof RunInputs;
  label: string;
  hint: string;
  max: number;
  required: boolean;
  inputMode: 'decimal' | 'numeric';
}

export const FIELD_SPECS: readonly FieldSpec[] = [
  {
    key: 'ip',
    prop: 'inPricePerM',
    label: 'Input price',
    hint: 'USD per 1M input tokens',
    max: 1_000_000,
    required: true,
    inputMode: 'decimal',
  },
  {
    key: 'op',
    prop: 'outPricePerM',
    label: 'Output price',
    hint: 'USD per 1M output tokens',
    max: 1_000_000,
    required: true,
    inputMode: 'decimal',
  },
  {
    key: 'it',
    prop: 'inTokensPerTurn',
    label: 'Input tokens per turn',
    hint: 'Average, including context sent each turn',
    max: 10_000_000,
    required: true,
    inputMode: 'numeric',
  },
  {
    key: 'ot',
    prop: 'outTokensPerTurn',
    label: 'Output tokens per turn',
    hint: 'Average',
    max: 10_000_000,
    required: true,
    inputMode: 'numeric',
  },
  {
    key: 't',
    prop: 'turnsPerAgent',
    label: 'Turns per agent',
    hint: 'Model calls in one pass',
    max: 1_000_000,
    required: true,
    inputMode: 'numeric',
  },
  {
    key: 'a',
    prop: 'agents',
    label: 'Parallel agents',
    hint: 'Agents running at once',
    max: 100_000,
    required: true,
    inputMode: 'numeric',
  },
  {
    key: 'r',
    prop: 'retries',
    label: 'Retries per agent',
    hint: 'Extra full passes in the worst case. Empty means 0',
    max: 1_000,
    required: false,
    inputMode: 'numeric',
  },
  {
    key: 'cap',
    prop: 'capUsd',
    label: 'Spend cap (USD)',
    hint: 'Optional. Empty uses the worst case rounded up',
    max: 1_000_000_000,
    required: false,
    inputMode: 'decimal',
  },
];

/** Parses one raw field: `empty` for blank text, `invalid` for anything that is not a number in range. */
export function parseField(
  raw: string,
  max: number,
): { kind: 'empty' } | { kind: 'invalid' } | { kind: 'ok'; value: number } {
  const text = raw.trim();
  if (text === '') return { kind: 'empty' };
  const value = Number(text);
  if (!Number.isFinite(value) || value < 0 || value > max) return { kind: 'invalid' };
  return { kind: 'ok', value };
}

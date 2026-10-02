import { describe, expect, it } from 'vitest';
import { EXAMPLE_RUN } from './estimate.ts';
import { decodeInputs, decodeTool, encodeInputs } from './url.ts';
import type { RunInputs } from './types.ts';

describe('url codec', () => {
  it('AC3: round-trips valid inputs', () => {
    const inputs: RunInputs = { ...EXAMPLE_RUN, inPricePerM: 3.25, retries: 0, capUsd: 12.5 };
    expect(decodeInputs(encodeInputs(inputs, 'codex'))).toEqual(inputs);
    expect(decodeTool(encodeInputs(inputs, 'codex'))).toBe('codex');
  });

  it('omits a null cap and decodes the rest', () => {
    const { capUsd, ...rest } = EXAMPLE_RUN;
    expect(capUsd).toBeNull();
    expect(decodeInputs(encodeInputs(EXAMPLE_RUN))).toEqual(rest);
  });

  it('AC4: omits negative, non-numeric and infinite values, clamps oversized ones', () => {
    const search = '?ip=-3&op=abc&it=Infinity&ot=&t=99999999999&a=5&r=NaN&cap=-0.5&x=1';
    expect(decodeInputs(search)).toEqual({ turnsPerAgent: 1_000_000, agents: 5 });
    expect(decodeInputs('%%%&&=')).toEqual({});
    expect(decodeInputs('a=1e400')).toEqual({});
  });

  it('ignores unknown tools', () => {
    expect(decodeTool('?tool=vim')).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { estimate, REPORTED_FAN_OUT } from './estimate.ts';
import type { RunInputs } from './types.ts';

const base: RunInputs = {
  inPricePerM: 3,
  outPricePerM: 15,
  inTokensPerTurn: 1000,
  outTokensPerTurn: 500,
  turnsPerAgent: 10,
  agents: 2,
  retries: 0,
  capUsd: null,
};

describe('estimate', () => {
  it('AC1: computes cost per turn, typical and worst for the worked example', () => {
    const e = estimate(base);
    expect(e.costPerTurn).toBeCloseTo(0.0105);
    expect(e.typical).toBeCloseTo(0.21);
    expect(e.worst).toBeCloseTo(e.typical);
  });

  it('AC2: worst = typical * (1 + retries) and fan-out uses 826 agents', () => {
    const cases: RunInputs[] = [
      { ...base, retries: 1 },
      { ...base, retries: 4, agents: 7, turnsPerAgent: 33 },
      { ...base, inPricePerM: 0.5, outPricePerM: 2.25, inTokensPerTurn: 123456, retries: 2.5 },
      { ...base, agents: 100000, retries: 10, outTokensPerTurn: 0 },
    ];
    for (const inputs of cases) {
      const e = estimate(inputs);
      expect(e.worst).toBeCloseTo(e.typical * (1 + inputs.retries), 6);
      expect(e.fanOut.agents).toBe(826);
      expect(REPORTED_FAN_OUT).toBe(826);
      expect(e.fanOut.worst).toBeCloseTo(
        e.costPerTurn * inputs.turnsPerAgent * 826 * (1 + inputs.retries),
        6,
      );
    }
  });
});

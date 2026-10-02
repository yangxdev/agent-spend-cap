import type { Estimate, RunInputs } from './types.ts';

/** The agent count described in the Hacker News thread the blueprint cites. */
export const REPORTED_FAN_OUT = 826;

/** Illustrative numbers only. They are not real prices. */
export const EXAMPLE_RUN: RunInputs = {
  inPricePerM: 2,
  outPricePerM: 10,
  inTokensPerTurn: 20000,
  outTokensPerTurn: 1500,
  turnsPerAgent: 40,
  agents: 5,
  retries: 2,
  capUsd: null,
};

export function estimate(inputs: RunInputs): Estimate {
  const { inPricePerM, outPricePerM, inTokensPerTurn, outTokensPerTurn } = inputs;
  const { turnsPerAgent, agents, retries } = inputs;
  const costPerTurn = (inTokensPerTurn * inPricePerM + outTokensPerTurn * outPricePerM) / 1e6;
  const typical = costPerTurn * turnsPerAgent * agents;
  const fanOutTypical = costPerTurn * turnsPerAgent * REPORTED_FAN_OUT;
  return {
    costPerTurn,
    typical,
    worst: typical * (1 + retries),
    fanOut: {
      agents: REPORTED_FAN_OUT,
      typical: fanOutTypical,
      worst: fanOutTypical * (1 + retries),
    },
  };
}

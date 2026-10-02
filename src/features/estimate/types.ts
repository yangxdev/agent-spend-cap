export interface RunInputs {
  inPricePerM: number; // USD per 1M input tokens
  outPricePerM: number; // USD per 1M output tokens
  inTokensPerTurn: number;
  outTokensPerTurn: number;
  turnsPerAgent: number;
  agents: number; // parallel agents
  retries: number; // extra full passes per agent in the worst case (0 = none)
  capUsd: number | null; // optional spend cap; null = derive from worst case
}

export interface Estimate {
  costPerTurn: number;
  typical: number;
  worst: number;
  fanOut: { agents: number; typical: number; worst: number };
}

import type { Estimate, RunInputs } from '../estimate/types.ts';
import type { ConfigTemplate } from './templates.ts';

export interface CapValues {
  maxTurns: number;
  maxAgents: number;
  capUsd: number;
}

export function renderTemplate(template: ConfigTemplate, values: CapValues): string {
  return template.body
    .replaceAll('{{maxTurns}}', String(values.maxTurns))
    .replaceAll('{{maxAgents}}', String(values.maxAgents))
    .replaceAll('{{capUsd}}', values.capUsd.toFixed(2));
}

/** The user's cap if set, else the worst case rounded up to the next whole dollar. */
export function suggestedCap(estimate: Estimate, capUsd: number | null): number {
  return capUsd ?? Math.ceil(estimate.worst);
}

export function capValues(inputs: RunInputs, estimate: Estimate): CapValues {
  return {
    maxTurns: Math.ceil(inputs.turnsPerAgent * (1 + inputs.retries)),
    maxAgents: inputs.agents,
    capUsd: suggestedCap(estimate, inputs.capUsd),
  };
}

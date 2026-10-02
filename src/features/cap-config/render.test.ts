import { describe, expect, it } from 'vitest';
import { estimate } from '../estimate/estimate.ts';
import type { RunInputs } from '../estimate/types.ts';
import { capValues, renderTemplate, suggestedCap } from './render.ts';
import { TEMPLATES } from './templates.ts';

const inputs: RunInputs = {
  inPricePerM: 3,
  outPricePerM: 15,
  inTokensPerTurn: 1000,
  outTokensPerTurn: 500,
  turnsPerAgent: 10,
  agents: 4,
  retries: 3,
  capUsd: null,
};

describe('cap config', () => {
  it('AC7: leaves no placeholder and formats the cap with two decimals', () => {
    for (const template of TEMPLATES) {
      const out = renderTemplate(template, { maxTurns: 40, maxAgents: 4, capUsd: 5 });
      expect(out).not.toContain('{{');
      expect(out).toContain('5.00');
    }
  });

  it('AC7: max-turns is turns * (1 + retries) and max-agents is agents', () => {
    const values = capValues(inputs, estimate(inputs));
    expect(values.maxTurns).toBe(40);
    expect(values.maxAgents).toBe(4);
  });

  it('AC8: suggests the worst case rounded up, or the user cap', () => {
    const e = { ...estimate(inputs), worst: 12.34 };
    expect(suggestedCap(e, null)).toBe(13);
    expect(suggestedCap(e, 5)).toBe(5);
  });

  it('AC9: every template has a body, starts with the unchecked comment and is unverified', () => {
    expect(TEMPLATES.map((t) => t.id)).toEqual(['claude-code', 'codex', 'generic']);
    for (const template of TEMPLATES) {
      expect(template.body.length).toBeGreaterThan(0);
      expect(
        template.body.startsWith("# Example only: check names against the tool's current docs"),
      ).toBe(true);
      expect(template.verifiedOn).toBeNull();
    }
  });
});

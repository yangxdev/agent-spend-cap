import type { ToolId } from '../estimate/fields.ts';

export interface ConfigTemplate {
  id: ToolId;
  label: string;
  /** Text with {{maxTurns}}, {{maxAgents}}, {{capUsd}} placeholders. */
  body: string;
  /** ISO date a person checked this against the tool's docs. null = not checked. */
  verifiedOn: string | null;
}

const COST_HOOK = `#!/bin/sh
# stop-at-spend.sh: exit non-zero once the cumulative cost passes the cap.
# Your tool or wrapper must write the running total (USD) to ./run-cost.txt.
cost=$(cat ./run-cost.txt 2>/dev/null || echo 0)
if [ "$(echo "$cost > {{capUsd}}" | bc -l)" = "1" ]; then
  echo "spend cap {{capUsd}} USD reached (at $cost USD), stopping" >&2
  exit 1
fi`;

export const TEMPLATES: readonly ConfigTemplate[] = [
  {
    id: 'claude-code',
    label: 'claude code',
    verifiedOn: null,
    body: `# Example only: check names against the tool's current docs
# Limit turns per agent run:
claude -p "<your task>" --max-turns {{maxTurns}}

# .claude/settings.json: run a check before every tool call (the hook script is below)
# {
#   "hooks": {
#     "PreToolUse": [
#       { "matcher": "*", "hooks": [{ "type": "command", "command": "./stop-at-spend.sh" }] }
#     ]
#   }
# }

# Subagents: start at most {{maxAgents}} at once.

${COST_HOOK}`,
  },
  {
    id: 'codex',
    label: 'codex',
    verifiedOn: null,
    body: `# Example only: check names against the tool's current docs
# Limit turns per agent run:
# max_turns = {{maxTurns}}      (config.toml)

# Parallel agents: run at most {{maxAgents}} at once.
# max_agents = {{maxAgents}}    (config.toml)

# Wire this into whatever pre-command hook your setup offers:

${COST_HOOK}`,
  },
  {
    id: 'generic',
    label: 'generic',
    verifiedOn: null,
    body: `# Example only: check names against the tool's current docs
# Set these in your tool's settings:
#   max turns per agent:  {{maxTurns}}
#   max parallel agents:  {{maxAgents}}
#   spend cap:            {{capUsd}} USD
# Then wire this script into whatever hook the tool offers:

${COST_HOOK}`,
  },
];

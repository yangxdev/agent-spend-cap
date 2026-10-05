import { useAppSelector } from '../../app/hooks.ts';
import { CellGrid, EmptyState, Note, Pane, Stat } from '../../components/ui/index.ts';
import { formatUsd } from '../../lib/format.ts';
import { selectEstimate } from './estimateSlice.ts';

export function EstimatePane() {
  const result = useAppSelector(selectEstimate);

  return (
    <Pane label="Estimate">
      {result ? (
        <div className="space-y-4">
          <CellGrid>
            <Stat value={formatUsd(result.typical)} caption="Typical: the plan as typed" />
            <Stat value={formatUsd(result.worst)} caption="Worst case: every agent retries" />
            <Stat
              value={formatUsd(result.fanOut.worst)}
              caption={`Reported fan-out: ${result.fanOut.agents} agents, worst case`}
            />
          </CellGrid>
          <Note>Prices are the ones you typed. Nothing is fetched.</Note>
          <Note>
            Fan-out row uses 826 agents, the count described in one public report; it is not a
            forecast.
          </Note>
        </div>
      ) : (
        <EmptyState
          title="No estimate yet"
          body="Enter prices and a run shape, or load the example run."
        />
      )}
    </Pane>
  );
}

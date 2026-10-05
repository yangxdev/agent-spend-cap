import { useAppDispatch, useAppSelector } from '../../app/hooks.ts';
import { ViewHeader } from '../../components/shell/index.ts';
import { Button } from '../../components/ui/index.ts';
import { formatUsd } from '../../lib/format.ts';
import { useCopy } from '../../lib/useCopy.ts';
import { CapConfigPane } from '../cap-config/CapConfigPane.tsx';
import { LimitsPane } from '../limits/LimitsPane.tsx';
import { EstimatePane } from './EstimatePane.tsx';
import { loadExample, selectEstimate } from './estimateSlice.ts';
import { InputsPane } from './InputsPane.tsx';
import { useUrlSync } from './useUrlSync.ts';

export function EstimateScreen() {
  const dispatch = useAppDispatch();
  const result = useAppSelector(selectEstimate);
  const { status, copy, preRef } = useCopy();
  useUrlSync();

  return (
    <>
      <ViewHeader
        title="Estimate"
        meta={
          result
            ? `Worst case ${formatUsd(result.worst)} if every agent retries`
            : 'Fill in the inputs, or try the example.'
        }
        actions={
          <>
            <Button
              variant="primary"
              disabled={!result}
              onClick={() => void copy(window.location.href, 'Link copied')}
            >
              Copy link
            </Button>
            <Button onClick={() => dispatch(loadExample())}>Example run</Button>
            <p role="status" className="font-mono text-small text-ink-soft">
              {status}
            </p>
          </>
        }
      />
      <div className="grid gap-4 px-edge py-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <InputsPane className="lg:row-span-2" />
        <EstimatePane />
        <CapConfigPane copy={copy} preRef={preRef} />
        <LimitsPane className="lg:col-span-2" />
      </div>
    </>
  );
}

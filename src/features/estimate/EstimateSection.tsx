import { useAppDispatch, useAppSelector } from '../../app/hooks.ts';
import { Button, CellGrid, EmptyState, Field, Note, Stat } from '../../components/ui/index.ts';
import { Section } from '../../components/shell/index.ts';
import { formatUsd } from '../../lib/format.ts';
import {
  loadExample,
  selectEstimate,
  selectFieldErrors,
  selectRaw,
  setField,
} from './estimateSlice.ts';
import { FIELD_SPECS } from './fields.ts';
import { useUrlSync } from './useUrlSync.ts';

// The spend cap is edited in section 02.
const ESTIMATE_FIELDS = FIELD_SPECS.filter((spec) => spec.key !== 'cap');

export function EstimateSection() {
  const dispatch = useAppDispatch();
  const raw = useAppSelector(selectRaw);
  const errors = useAppSelector(selectFieldErrors);
  const result = useAppSelector(selectEstimate);
  useUrlSync();

  return (
    <Section id="estimate" index="01" label="Estimate" title="Size the run before it starts">
      <div className="space-y-10">
        <div>
          <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {ESTIMATE_FIELDS.map((spec) => (
              <Field
                key={spec.key}
                label={spec.label}
                hint={spec.hint}
                error={errors[spec.key]}
                inputMode={spec.inputMode}
                autoComplete="off"
                value={raw[spec.key]}
                onChange={(event) =>
                  dispatch(setField({ field: spec.key, value: event.target.value }))
                }
              />
            ))}
          </div>
          <div className="mt-6">
            <Button onClick={() => dispatch(loadExample())}>Example run</Button>
          </div>
        </div>

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
      </div>
    </Section>
  );
}

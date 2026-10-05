import { useAppDispatch, useAppSelector } from '../../app/hooks.ts';
import { Button, EmptyState, Field, Note, Pane, Segmented } from '../../components/ui/index.ts';
import type { CopyApi } from '../../lib/useCopy.ts';
import {
  selectEstimate,
  selectFieldErrors,
  selectInputs,
  selectRaw,
  setField,
  setTool,
} from '../estimate/estimateSlice.ts';
import { capValues, renderTemplate } from './render.ts';
import { TEMPLATES } from './templates.ts';

const TOOL_OPTIONS = TEMPLATES.map((t) => ({ value: t.id, label: t.label }));

export function CapConfigPane({ copy, preRef }: Pick<CopyApi, 'copy' | 'preRef'>) {
  const dispatch = useAppDispatch();
  const raw = useAppSelector(selectRaw);
  const errors = useAppSelector(selectFieldErrors);
  const inputs = useAppSelector(selectInputs);
  const result = useAppSelector(selectEstimate);

  const template = TEMPLATES.find((t) => t.id === raw.tool) ?? TEMPLATES[0];
  const config =
    template && inputs && result ? renderTemplate(template, capValues(inputs, result)) : null;

  return (
    <Pane label="Cap config">
      {template && config ? (
        <div className="space-y-6">
          <Segmented
            label="Tool"
            options={TOOL_OPTIONS}
            value={template.id}
            onChange={(id) => dispatch(setTool(id))}
          />
          <Field
            label="Spend cap (USD)"
            hint="Optional. Empty uses the worst case rounded up to a whole dollar."
            error={errors.cap}
            inputMode="decimal"
            autoComplete="off"
            value={raw.cap}
            onChange={(event) => dispatch(setField({ field: 'cap', value: event.target.value }))}
          />
          <div className="space-y-3">
            <pre
              ref={preRef}
              tabIndex={0}
              aria-label="Cap config"
              className="overflow-x-auto border border-line-strong bg-canvas p-4 font-mono text-small whitespace-pre text-ink"
            >
              {config}
            </pre>
            <Note>
              {template.verifiedOn
                ? `Checked on ${template.verifiedOn}`
                : "Unchecked example. Names and flags may be out of date, so check them against the tool's docs before relying on this."}
            </Note>
          </div>
          <div>
            <Button variant="ghost" onClick={() => void copy(config, 'Copied')}>
              Copy config
            </Button>
          </div>
        </div>
      ) : (
        <EmptyState
          title="Nothing to generate yet"
          body="Fill in the inputs, or load the example run."
        />
      )}
    </Pane>
  );
}

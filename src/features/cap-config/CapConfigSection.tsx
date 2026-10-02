import { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks.ts';
import { Section } from '../../components/shell/index.ts';
import { Button, EmptyState, Field, Note, Segmented } from '../../components/ui/index.ts';
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

export function CapConfigSection() {
  const dispatch = useAppDispatch();
  const raw = useAppSelector(selectRaw);
  const errors = useAppSelector(selectFieldErrors);
  const inputs = useAppSelector(selectInputs);
  const result = useAppSelector(selectEstimate);
  const [status, setStatus] = useState('');
  const preRef = useRef<HTMLPreElement>(null);

  const template = TEMPLATES.find((t) => t.id === raw.tool) ?? TEMPLATES[0];
  const config =
    template && inputs && result ? renderTemplate(template, capValues(inputs, result)) : null;

  function selectText() {
    const pre = preRef.current;
    if (!pre) return;
    const range = document.createRange();
    range.selectNodeContents(pre);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  async function copy(text: string, done: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(done);
    } catch {
      selectText();
      setStatus('Clipboard unavailable. The text is selected: press Ctrl+C or Cmd+C.');
    }
  }

  return (
    <Section id="cap-config" index="02" label="Cap config" title="Copy a cap config" tone="zone">
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
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => void copy(config, 'Copied')}>
              Copy config
            </Button>
            <Button onClick={() => void copy(window.location.href, 'Link copied')}>
              Copy link
            </Button>
          </div>
        </div>
      ) : (
        <EmptyState
          title="Nothing to generate yet"
          body="Fill in the estimate above, or load the example run."
        />
      )}
      <p role="status" className="mt-4 min-h-6 font-mono text-small text-ink-soft">
        {status}
      </p>
    </Section>
  );
}

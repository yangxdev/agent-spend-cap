import { useAppDispatch, useAppSelector } from '../../app/hooks.ts';
import { Field, Pane } from '../../components/ui/index.ts';
import { selectFieldErrors, selectRaw, setField } from './estimateSlice.ts';
import { FIELD_SPECS } from './fields.ts';

// The spend cap is edited in the Cap config pane.
const ESTIMATE_FIELDS = FIELD_SPECS.filter((spec) => spec.key !== 'cap');

export function InputsPane({ className }: { className?: string }) {
  const dispatch = useAppDispatch();
  const raw = useAppSelector(selectRaw);
  const errors = useAppSelector(selectFieldErrors);

  return (
    <Pane label="Inputs" className={className}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-1">
        {ESTIMATE_FIELDS.map((spec) => (
          <Field
            key={spec.key}
            label={spec.label}
            hint={spec.hint}
            error={errors[spec.key]}
            inputMode={spec.inputMode}
            autoComplete="off"
            value={raw[spec.key]}
            onChange={(event) => dispatch(setField({ field: spec.key, value: event.target.value }))}
          />
        ))}
      </div>
    </Pane>
  );
}

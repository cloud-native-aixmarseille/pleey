import { useFieldContext } from './form-context';
import { readFieldError } from './read-field-error';

interface FieldState<TValue> {
  readonly field: ReturnType<typeof useFieldContext<TValue>>;
  readonly fieldId: string;
  readonly error: string | null;
}

export function useFieldState<TValue = string>(): FieldState<TValue> {
  const field = useFieldContext<TValue>();
  const fieldId = String(field.name).replace(/\./g, '-');
  const error = field.state.meta.isTouched
    ? (field.state.meta.errors.map(readFieldError).find(Boolean) ?? null)
    : null;

  return { field, fieldId, error };
}

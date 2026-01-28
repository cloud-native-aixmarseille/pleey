import type { TextFormFieldProps } from '../../../application/shared/contracts/form.port';
import { Input } from '../ui/forms/input';
import { FormFieldShell } from './form-field-shell';
import { useFieldState } from './use-field-state';

export function TextFormField({
  autoComplete,
  description,
  label,
  placeholder,
  required = false,
  type = 'text',
}: TextFormFieldProps) {
  const { field, fieldId, error } = useFieldState<string>();

  return (
    <FormFieldShell
      description={description}
      error={error}
      id={fieldId}
      label={label}
      required={required}
    >
      {({ describedBy, invalid }) => (
        <Input
          aria-describedby={describedBy}
          autoComplete={autoComplete}
          id={fieldId}
          invalid={invalid}
          name={String(field.name)}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          value={field.state.value ?? ''}
        />
      )}
    </FormFieldShell>
  );
}

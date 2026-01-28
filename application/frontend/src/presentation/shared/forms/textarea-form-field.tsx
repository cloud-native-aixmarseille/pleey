import type { TextareaFormFieldProps } from '../../../application/shared/contracts/form.port';
import { Textarea } from '../ui/forms/textarea';
import { FormFieldShell } from './form-field-shell';
import { useFieldState } from './use-field-state';

export function TextareaFormField({
  description,
  label,
  placeholder,
  required = false,
  rows = 4,
}: TextareaFormFieldProps) {
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
        <Textarea
          aria-describedby={describedBy}
          id={fieldId}
          invalid={invalid}
          name={String(field.name)}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          placeholder={placeholder}
          rows={rows}
          value={field.state.value ?? ''}
        />
      )}
    </FormFieldShell>
  );
}

import type { SelectFormFieldProps } from '../../../application/shared/contracts/form.port';
import { Select } from '../ui/forms/select';
import { FormFieldShell } from './form-field-shell';
import { useFieldState } from './use-field-state';

export function SelectFormField({
  description,
  label,
  options,
  placeholder,
  required = false,
}: SelectFormFieldProps) {
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
        <Select
          aria-describedby={describedBy}
          id={fieldId}
          invalid={invalid}
          name={String(field.name)}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          value={field.state.value ?? ''}
        >
          {placeholder ? (
            <option disabled value="">
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option disabled={option.disabled} key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      )}
    </FormFieldShell>
  );
}

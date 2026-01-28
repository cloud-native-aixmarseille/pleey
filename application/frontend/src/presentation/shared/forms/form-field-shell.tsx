import type { ReactNode } from 'react';
import { FieldShell } from '../ui/forms/field-shell';

interface FormFieldShellProps {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly error?: string | null;
  readonly required?: boolean;
  readonly children: (options: { describedBy?: string; invalid: boolean }) => ReactNode;
}

export function FormFieldShell({
  children,
  description,
  error,
  id,
  label,
  required = false,
}: FormFieldShellProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <FieldShell
      description={description}
      descriptionId={descriptionId}
      error={error}
      errorId={errorId}
      id={id}
      label={label}
      required={required}
    >
      {children({ describedBy, invalid: Boolean(error) })}
    </FieldShell>
  );
}

import type { PropsWithChildren } from 'react';
import { formRecipes } from '../foundation/ui-recipes';

interface FieldShellProps extends PropsWithChildren {
  readonly description?: string;
  readonly descriptionId?: string;
  readonly error?: string | null;
  readonly errorId?: string;
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
}

export function FieldShell({
  children,
  description,
  descriptionId,
  error,
  errorId,
  id,
  label,
  required = false,
}: FieldShellProps) {
  return (
    <div style={formRecipes.fieldShell}>
      <label htmlFor={id} style={formRecipes.fieldLabel}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {description ? (
        <p id={descriptionId} style={formRecipes.fieldDescription}>
          {description}
        </p>
      ) : null}
      {error ? (
        <p aria-live="assertive" id={errorId} role="alert" style={formRecipes.fieldError}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

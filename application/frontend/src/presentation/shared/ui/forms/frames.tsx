import type { ComponentPropsWithoutRef, PropsWithChildren, ReactNode } from 'react';
import { formRecipes } from '../foundation/ui-recipes';

interface FormRootProps extends Omit<ComponentPropsWithoutRef<'form'>, 'className' | 'style'> {
  readonly children: ReactNode;
}

interface FormSectionFrameProps extends PropsWithChildren {
  readonly legend: string;
  readonly description?: string;
  readonly descriptionId?: string;
}

interface FormFieldFrameProps {
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
  readonly description?: string;
  readonly descriptionId?: string;
  readonly error?: string | null;
  readonly errorId?: string;
  readonly children: ReactNode;
}

export function FormRoot({ children, ...props }: FormRootProps) {
  return (
    <form style={formRecipes.root} {...props}>
      {children}
    </form>
  );
}

export function FormSectionFrame({
  children,
  description,
  descriptionId,
  legend,
}: FormSectionFrameProps) {
  return (
    <fieldset aria-describedby={descriptionId} style={formRecipes.fieldset}>
      <legend style={formRecipes.legend}>{legend}</legend>
      {description ? (
        <p id={descriptionId} style={formRecipes.fieldDescription}>
          {description}
        </p>
      ) : null}
      {children}
    </fieldset>
  );
}

export function FormFieldFrame({
  children,
  description,
  descriptionId,
  error,
  errorId,
  id,
  label,
  required = false,
}: FormFieldFrameProps) {
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

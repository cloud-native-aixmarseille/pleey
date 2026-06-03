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

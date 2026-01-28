import type { PropsWithChildren } from 'react';
import { FormSectionFrame } from '../ui/forms/frames';

interface FormSectionProps extends PropsWithChildren {
  readonly legend: string;
  readonly description?: string;
}

export function FormSection({ children, description, legend }: FormSectionProps) {
  const descriptionId = description
    ? `${legend.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-description`
    : undefined;

  return (
    <FormSectionFrame description={description} descriptionId={descriptionId} legend={legend}>
      {children}
    </FormSectionFrame>
  );
}

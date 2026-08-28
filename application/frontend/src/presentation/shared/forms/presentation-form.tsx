import type { FormHTMLAttributes, ReactNode, SyntheticEvent } from 'react';
import type { PresentationFormApi } from '../../../application/shared/ports/form.port';
import { FormRoot } from '../ui/forms/frames';

type PresentationFormRuntime = Pick<PresentationFormApi<Record<string, unknown>>, 'handleSubmit'>;

interface PresentationFormProps
  extends Omit<FormHTMLAttributes<HTMLFormElement>, 'children' | 'className' | 'onSubmit' | 'style'> {
  readonly children: ReactNode;
  readonly form: PresentationFormRuntime;
}

export function PresentationForm({ children, form, ...props }: PresentationFormProps) {
  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    await form.handleSubmit();
  }

  return (
    <FormRoot noValidate onSubmit={handleSubmit} {...props}>
      {children}
    </FormRoot>
  );
}

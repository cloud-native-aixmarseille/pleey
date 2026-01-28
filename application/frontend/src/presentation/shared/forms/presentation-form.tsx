import type { FormEvent, FormHTMLAttributes, ReactNode } from 'react';
import { FormRoot } from '../ui/forms/frames';

interface PresentationFormRuntime {
  handleSubmit: () => void | Promise<void>;
}

interface PresentationFormProps
  extends Omit<
    FormHTMLAttributes<HTMLFormElement>,
    'children' | 'className' | 'onSubmit' | 'style'
  > {
  readonly children: ReactNode;
  readonly form: PresentationFormRuntime;
}

export function PresentationForm({ children, form, ...props }: PresentationFormProps) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

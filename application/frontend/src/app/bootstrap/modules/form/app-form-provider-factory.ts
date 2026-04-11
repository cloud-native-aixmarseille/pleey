import { injectable } from 'inversify';
import { createElement, type PropsWithChildren, type ReactNode } from 'react';
import { TanstackFormAdapter } from '../../../../infrastructure/forms/tanstack-form.adapter';
import { PresentationFormProvider } from '../../../../presentation/shared/forms/form-provider';
import { AppProviderOrder, BaseAppProviderFactory } from '../../app-provider-factory';

const formPort = new TanstackFormAdapter().createPort();

function AppFormProvider({ children }: PropsWithChildren) {
  return createElement(PresentationFormProvider, { value: formPort }, children);
}

@injectable()
export class AppFormProviderFactory extends BaseAppProviderFactory {
  readonly order = AppProviderOrder.FORM;

  protected create(children: ReactNode): ReactNode {
    return createElement(AppFormProvider, undefined, children);
  }
}

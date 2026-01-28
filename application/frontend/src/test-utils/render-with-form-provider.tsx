import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { TanstackFormAdapter } from '../infrastructure/forms/tanstack-form.adapter';
import { MantineUiAdapter } from '../infrastructure/ui/mantine-ui.adapter';
import { PresentationFormProvider } from '../presentation/shared/forms/form-provider';
import { PresentationUiProvider, PresentationUiRoot } from '../presentation/shared/ui/provider';

const formPort = new TanstackFormAdapter().createPort();
const uiPort = new MantineUiAdapter().createPort();

export function renderWithFormProvider(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, {
    wrapper: ({ children }) => (
      <PresentationUiProvider value={uiPort}>
        <PresentationUiRoot>
          <PresentationFormProvider value={formPort}>{children}</PresentationFormProvider>
        </PresentationUiRoot>
      </PresentationUiProvider>
    ),
    ...options,
  });
}

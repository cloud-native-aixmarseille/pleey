import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MantineUiAdapter } from '../infrastructure/ui/mantine-ui.adapter';
import { PresentationUiProvider, PresentationUiRoot } from '../presentation/shared/ui/provider';

const uiPort = new MantineUiAdapter().createPort();

export function renderWithUiProvider(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, {
    wrapper: ({ children }) => (
      <PresentationUiProvider value={uiPort}>
        <PresentationUiRoot>{children}</PresentationUiRoot>
      </PresentationUiProvider>
    ),
    ...options,
  });
}

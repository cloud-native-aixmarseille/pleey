import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MantineUiAdapter } from '../infrastructure/ui/mantine-ui.adapter';
import { CaptchaProvider } from '../presentation/identity/contexts/captcha-context';
import { PresentationUiProvider, PresentationUiRoot } from '../presentation/shared/ui/provider';
import { CaptchaWidgetMockFactory } from './mocks/captcha-widget-mock-factory';

const captchaWidgetPort = new CaptchaWidgetMockFactory().create();
const uiPort = new MantineUiAdapter().createPort();

export function renderWithUiProvider(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, {
    wrapper: ({ children }) => (
      <PresentationUiProvider value={uiPort}>
        <PresentationUiRoot>
          <CaptchaProvider value={captchaWidgetPort}>{children}</CaptchaProvider>
        </PresentationUiRoot>
      </PresentationUiProvider>
    ),
    ...options,
  });
}

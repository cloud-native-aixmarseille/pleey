import { inject, injectable } from 'inversify';
import { createElement, type ReactNode } from 'react';
import {
  type CaptchaWidgetPort,
  CaptchaWidgetPortToken,
} from '../../../../application/identity/ports/captcha-widget.port';
import { CaptchaProvider } from '../../../../presentation/identity/contexts/captcha-context';
import { AppProviderOrder, BaseAppProviderFactory } from '../../app-provider-factory';

@injectable()
export class AppCaptchaProviderFactory extends BaseAppProviderFactory {
  readonly order = AppProviderOrder.AUTH;

  constructor(@inject(CaptchaWidgetPortToken) private readonly widget: CaptchaWidgetPort) {
    super();
  }

  protected create(children: ReactNode): ReactNode {
    return createElement(CaptchaProvider, { value: this.widget }, children);
  }
}

import type { CaptchaWidgetPort, CaptchaWidgetProps } from '../../application/identity/ports/captcha-widget.port';

function CaptchaWidgetMock({ labels, onTokenChange }: CaptchaWidgetProps) {
  return (
    <button aria-label={labels.verifyAriaLabel} onClick={() => onTokenChange('captcha-test-token')} type="button">
      {labels.initial}
    </button>
  );
}

export class CaptchaWidgetMockFactory {
  create(): CaptchaWidgetPort {
    return { Widget: CaptchaWidgetMock };
  }
}

import type { ComponentType } from 'react';

export type CaptchaAction = 'signup' | 'password-recovery';

interface CaptchaWidgetLabels {
  readonly providerLabel: string;
  readonly initial: string;
  readonly verifying: string;
  readonly solved: string;
  readonly error: string;
  readonly required: string;
  readonly troubleshooting: string;
  readonly wasmDisabled: string;
  readonly groupAriaLabel: string;
  readonly verifyAriaLabel: string;
  readonly verifyingAriaLabel: string;
  readonly verifiedAriaLabel: string;
  readonly errorAriaLabel: string;
}

export interface CaptchaWidgetProps {
  readonly action: CaptchaAction;
  readonly labels: CaptchaWidgetLabels;
  readonly onTokenChange: (token: string | null) => void;
  readonly onError: () => void;
}

export interface CaptchaWidgetPort {
  readonly Widget: ComponentType<CaptchaWidgetProps>;
}

export const CaptchaWidgetPortToken = Symbol('CaptchaWidgetPort');

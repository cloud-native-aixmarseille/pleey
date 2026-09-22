export interface CaptchaConfig {
  readonly secret: string;
  readonly valkeyUrl: string;
}
export const CAPTCHA_CONFIG = Symbol('CAPTCHA_CONFIG');

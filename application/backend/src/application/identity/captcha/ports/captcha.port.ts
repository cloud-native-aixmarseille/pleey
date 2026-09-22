import type { CaptchaAction } from '../../../../domain/identity/enums/captcha-action.enum';

export type CaptchaChallenge = {
  challenge: { c: number; s: number; d: number };
  token: string;
  expires: number;
};
export type CaptchaProof = { token: string; solutions: number[] };
export type CaptchaRedemption = { success: true; token: string; expires: number };

export interface CaptchaPort {
  challenge(action: CaptchaAction, peer: string): Promise<CaptchaChallenge>;
  redeem(action: CaptchaAction, proof: CaptchaProof, peer: string): Promise<CaptchaRedemption>;
  verify(action: CaptchaAction, token: string, peer: string): Promise<void>;
}
export const CaptchaPortProvider = Symbol('CaptchaPort');

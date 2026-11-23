export type ParticipantId = string & { readonly __identifierBrand: "ParticipantId" };
export type UserId = string & { readonly __identifierBrand: "UserId" };

export interface PublicUserProfile {
  readonly id: UserId;
  readonly isAnonymous?: boolean;
  readonly username: string;
  readonly email: string;
  readonly avatarUri?: string | null;
  readonly createdAt?: string | null;
}

export interface AuthSession {
  readonly id: string;
  readonly isAnonymous: boolean;
  readonly expiresIn: number;
  readonly user: PublicUserProfile;
}

export const CaptchaAction = {
  SIGNUP: "signup",
  PASSWORD_RECOVERY: "password-recovery",
} as const;
export type CaptchaAction = (typeof CaptchaAction)[keyof typeof CaptchaAction];

export const PASSWORD_INPUT_MIN_LENGTH = 6;
export const PASSWORD_INPUT_MAX_UTF8_BYTES = 72;

export function isPasswordInputWithinUtf8ByteLimit(value: string): boolean {
  return new TextEncoder().encode(value).length <= PASSWORD_INPUT_MAX_UTF8_BYTES;
}

export function isPasswordInputValid(value: string): boolean {
  return value.length >= PASSWORD_INPUT_MIN_LENGTH && isPasswordInputWithinUtf8ByteLimit(value);
}

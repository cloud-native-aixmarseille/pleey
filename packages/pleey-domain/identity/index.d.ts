export type GuestId = string & {
  readonly __identifierBrand: 'GuestId';
};

export type UserId = string & {
  readonly __identifierBrand: 'UserId';
};

export type AuthToken = string;

export interface PublicUserProfile {
  readonly id: UserId;
  readonly username: string;
  readonly email: string;
  readonly avatarUri?: string | null;
  readonly createdAt?: string | null;
}

export interface AuthSession {
  readonly accessToken: AuthToken;
  readonly refreshToken: AuthToken;
  readonly expiresIn: number;
  readonly user: PublicUserProfile;
}

export const CaptchaAction: {
  readonly SIGNUP: 'signup';
  readonly PASSWORD_RECOVERY: 'password-recovery';
};

export type CaptchaAction = (typeof CaptchaAction)[keyof typeof CaptchaAction];

export const PASSWORD_INPUT_MIN_LENGTH: 6;
export const PASSWORD_INPUT_MAX_UTF8_BYTES: 72;

export function isPasswordInputWithinUtf8ByteLimit(value: string): boolean;
export function isPasswordInputValid(value: string): boolean;

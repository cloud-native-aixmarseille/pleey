export const CaptchaAction = {
  SIGNUP: 'signup',
  PASSWORD_RECOVERY: 'password-recovery',
};

export const PASSWORD_INPUT_MIN_LENGTH = 6;
export const PASSWORD_INPUT_MAX_UTF8_BYTES = 72;

export function isPasswordInputWithinUtf8ByteLimit(value) {
  return new TextEncoder().encode(value).length <= PASSWORD_INPUT_MAX_UTF8_BYTES;
}

export function isPasswordInputValid(value) {
  return value.length >= PASSWORD_INPUT_MIN_LENGTH && isPasswordInputWithinUtf8ByteLimit(value);
}

import { ThemeErrorCode as SharedThemeErrorCode, THEME_ERROR_TRANSLATION_KEYS } from '@pleey/domain/theme';
import { DomainError } from '../../shared/errors/domain-error';

export const ThemeErrorCode = SharedThemeErrorCode;
export type ThemeErrorCode = (typeof ThemeErrorCode)[keyof typeof ThemeErrorCode];

export const THEME_ERROR_DEFINITIONS = {
  [ThemeErrorCode.INVALID_DOCUMENT]: {
    code: ThemeErrorCode.INVALID_DOCUMENT,
    message: 'Invalid theme document.',
    messageKey: THEME_ERROR_TRANSLATION_KEYS[ThemeErrorCode.INVALID_DOCUMENT],
  },
  [ThemeErrorCode.INVALID_SELECTION]: {
    code: ThemeErrorCode.INVALID_SELECTION,
    message: 'Theme is unavailable in this organization.',
    messageKey: THEME_ERROR_TRANSLATION_KEYS[ThemeErrorCode.INVALID_SELECTION],
  },
  [ThemeErrorCode.REVISION_CONFLICT]: {
    code: ThemeErrorCode.REVISION_CONFLICT,
    message: 'The theme has changed. Reload before saving.',
    messageKey: THEME_ERROR_TRANSLATION_KEYS[ThemeErrorCode.REVISION_CONFLICT],
  },
  [ThemeErrorCode.INVALID_ASSET]: {
    code: ThemeErrorCode.INVALID_ASSET,
    message: 'Invalid theme image.',
    messageKey: THEME_ERROR_TRANSLATION_KEYS[ThemeErrorCode.INVALID_ASSET],
  },
  [ThemeErrorCode.NOT_FOUND]: {
    code: ThemeErrorCode.NOT_FOUND,
    message: 'Theme not found.',
    messageKey: THEME_ERROR_TRANSLATION_KEYS[ThemeErrorCode.NOT_FOUND],
  },
};
export class ThemeError extends DomainError<ThemeErrorCode> {
  constructor(code: ThemeErrorCode, context: Record<string, unknown>) {
    super(THEME_ERROR_DEFINITIONS[code], context);
  }
}

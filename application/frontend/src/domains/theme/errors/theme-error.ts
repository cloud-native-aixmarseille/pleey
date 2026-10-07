import { DomainError } from '../../shared/errors/domain-error';
export enum ThemeErrorCode {
  INVALID_DOCUMENT = 'THEME_INVALID_DOCUMENT',
  INVALID_SELECTION = 'THEME_INVALID_SELECTION',
  REVISION_CONFLICT = 'THEME_REVISION_CONFLICT',
  INVALID_ASSET = 'THEME_INVALID_ASSET',
  NOT_FOUND = 'THEME_NOT_FOUND',
}
const definitions = {
  [ThemeErrorCode.INVALID_DOCUMENT]: {
    code: ThemeErrorCode.INVALID_DOCUMENT,
    message: 'Invalid theme document.',
    messageKey: 'theme.errors.invalidDocument',
  },
  [ThemeErrorCode.INVALID_SELECTION]: {
    code: ThemeErrorCode.INVALID_SELECTION,
    message: 'Theme is unavailable in this organization.',
    messageKey: 'theme.errors.invalidSelection',
  },
  [ThemeErrorCode.REVISION_CONFLICT]: {
    code: ThemeErrorCode.REVISION_CONFLICT,
    message: 'The theme has changed. Reload before saving.',
    messageKey: 'theme.errors.revisionConflict',
  },
  [ThemeErrorCode.INVALID_ASSET]: {
    code: ThemeErrorCode.INVALID_ASSET,
    message: 'Invalid theme image.',
    messageKey: 'theme.errors.invalidAsset',
  },
  [ThemeErrorCode.NOT_FOUND]: {
    code: ThemeErrorCode.NOT_FOUND,
    message: 'Theme not found.',
    messageKey: 'theme.errors.notFound',
  },
};
export class ThemeError extends DomainError<ThemeErrorCode> {
  constructor(code: ThemeErrorCode, context: Record<string, unknown>) {
    super(definitions[code], context);
  }
}

import { type DomainErrorDefinition } from '../../../../shared/errors/domain-error';

export enum PlayableContentImportParserErrorCode {
  EMPTY_FILE = 'PLAYABLE_CONTENT_IMPORT_EMPTY_FILE',
  INVALID_FILE = 'PLAYABLE_CONTENT_IMPORT_INVALID_FILE',
  UNSUPPORTED_FORMAT = 'PLAYABLE_CONTENT_IMPORT_UNSUPPORTED_FORMAT',
}

export const PLAYABLE_CONTENT_IMPORT_PARSER_ERROR_DEFINITIONS: Readonly<
  Record<
    PlayableContentImportParserErrorCode,
    DomainErrorDefinition<PlayableContentImportParserErrorCode>
  >
> = {
  [PlayableContentImportParserErrorCode.EMPTY_FILE]: {
    code: PlayableContentImportParserErrorCode.EMPTY_FILE,
    messageKey: PlayableContentImportParserErrorCode.EMPTY_FILE,
  },
  [PlayableContentImportParserErrorCode.INVALID_FILE]: {
    code: PlayableContentImportParserErrorCode.INVALID_FILE,
    messageKey: PlayableContentImportParserErrorCode.INVALID_FILE,
  },
  [PlayableContentImportParserErrorCode.UNSUPPORTED_FORMAT]: {
    code: PlayableContentImportParserErrorCode.UNSUPPORTED_FORMAT,
    messageKey: PlayableContentImportParserErrorCode.UNSUPPORTED_FORMAT,
  },
};

export { PlayableContentImportEmptyFileError } from './playable-content-import-empty-file.error';
export { PlayableContentImportInvalidFileError } from './playable-content-import-invalid-file.error';
export { PlayableContentImportUnsupportedFormatError } from './playable-content-import-unsupported-format.error';

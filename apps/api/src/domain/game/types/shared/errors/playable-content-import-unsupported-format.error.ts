import { PlayableContentImportParserErrorCode } from './import-parser.error';
import { PlayableContentImportParserError } from './playable-content-import-parser.error';

export class PlayableContentImportUnsupportedFormatError extends PlayableContentImportParserError {
  constructor(context?: Record<string, unknown>) {
    super(PlayableContentImportParserErrorCode.UNSUPPORTED_FORMAT, context);
  }
}

import { PlayableContentImportParserErrorCode } from './import-parser.error';
import { PlayableContentImportParserError } from './playable-content-import-parser.error';

export class PlayableContentImportInvalidFileError extends PlayableContentImportParserError {
  constructor(context?: Record<string, unknown>) {
    super(PlayableContentImportParserErrorCode.INVALID_FILE, context);
  }
}

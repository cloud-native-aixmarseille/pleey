import { PlayableContentImportParserErrorCode } from './import-parser.error';
import { PlayableContentImportParserError } from './playable-content-import-parser.error';

export class PlayableContentImportEmptyFileError extends PlayableContentImportParserError {
  constructor(context?: Record<string, unknown>) {
    super(PlayableContentImportParserErrorCode.EMPTY_FILE, context);
  }
}

import { DomainError } from '../../../../shared/errors/domain-error';
import {
  PLAYABLE_CONTENT_IMPORT_PARSER_ERROR_DEFINITIONS,
  PlayableContentImportParserErrorCode,
} from './import-parser.error';

export abstract class PlayableContentImportParserError extends DomainError<PlayableContentImportParserErrorCode> {
  protected constructor(code: PlayableContentImportParserErrorCode, context?: Record<string, unknown>) {
    super(PLAYABLE_CONTENT_IMPORT_PARSER_ERROR_DEFINITIONS[code], context);
  }
}

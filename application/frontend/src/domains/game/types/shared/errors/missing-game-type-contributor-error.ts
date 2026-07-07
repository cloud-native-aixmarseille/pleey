import { DomainError } from '../../../../shared/errors/domain-error';
import {
  GAME_TYPE_REGISTRY_ERROR_DEFINITIONS,
  MISSING_GAME_TYPE_CONTRIBUTOR_ERROR_CODE,
} from './game-type-registry.error';

export class MissingGameTypeContributorError extends DomainError<
  typeof MISSING_GAME_TYPE_CONTRIBUTOR_ERROR_CODE
> {
  constructor(context?: Record<string, unknown>) {
    super(GAME_TYPE_REGISTRY_ERROR_DEFINITIONS[MISSING_GAME_TYPE_CONTRIBUTOR_ERROR_CODE], context);
  }
}

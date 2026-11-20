import type { DomainErrorDefinition } from '../../../../shared/errors/domain-error';

export const MISSING_GAME_TYPE_CONTRIBUTOR_ERROR_CODE = 'MISSING_GAME_TYPE_CONTRIBUTOR';

export const GAME_TYPE_REGISTRY_ERROR_DEFINITIONS: Readonly<
  Record<
    typeof MISSING_GAME_TYPE_CONTRIBUTOR_ERROR_CODE,
    DomainErrorDefinition<typeof MISSING_GAME_TYPE_CONTRIBUTOR_ERROR_CODE>
  >
> = {
  [MISSING_GAME_TYPE_CONTRIBUTOR_ERROR_CODE]: {
    code: MISSING_GAME_TYPE_CONTRIBUTOR_ERROR_CODE,
    message: MISSING_GAME_TYPE_CONTRIBUTOR_ERROR_CODE,
    messageKey: MISSING_GAME_TYPE_CONTRIBUTOR_ERROR_CODE,
  },
};

export { MissingGameTypeContributorError } from './missing-game-type-contributor-error';

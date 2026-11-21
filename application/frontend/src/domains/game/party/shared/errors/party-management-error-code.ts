import { DomainError, type DomainErrorDefinition } from '../../../../shared/errors/domain-error';

export enum PartyManagementErrorCode {
  PLAYER_ALREADY_IN_ACTIVE_PARTY = 'game.party.errors.playerAlreadyInActiveParty',
  CREATE_FAILED = 'game.party.errors.createFailed',
  GUEST_NAME_REQUIRED = 'game.party.errors.guestNameRequired',
  HOST_PARTY_CONTROL_FORBIDDEN = 'game.party.errors.hostPartyControlForbidden',
  JOIN_FAILED = 'game.party.errors.joinFailed',
  LIST_FAILED = 'game.party.errors.listFailed',
  LEAVE_FAILED = 'game.party.errors.leaveFailed',
  CONNECTION_LOST = 'game.party.errors.connectionLost',
  OBSERVE_FAILED = 'game.party.errors.observeFailed',
  PARTY_COMMAND_NOT_AVAILABLE = 'game.party.errors.partyCommandNotAvailable',
  PARTY_NOT_FOUND = 'game.party.errors.partyNotFound',
  PARTY_STAGES_NOT_AVAILABLE = 'game.party.errors.partyStagesNotAvailable',
  VALIDATION_FAILED = 'game.party.errors.validationFailed',
}

export const PARTY_MANAGEMENT_ERROR_DEFINITIONS: Readonly<
  Record<PartyManagementErrorCode, DomainErrorDefinition<PartyManagementErrorCode>>
> = {
  [PartyManagementErrorCode.PLAYER_ALREADY_IN_ACTIVE_PARTY]: {
    code: PartyManagementErrorCode.PLAYER_ALREADY_IN_ACTIVE_PARTY,
    message: 'game.party.errors.playerAlreadyInActiveParty',
    messageKey: 'game.party.errors.playerAlreadyInActiveParty',
  },
  [PartyManagementErrorCode.CREATE_FAILED]: {
    code: PartyManagementErrorCode.CREATE_FAILED,
    message: 'game.party.errors.createFailed',
    messageKey: 'game.party.errors.createFailed',
  },
  [PartyManagementErrorCode.GUEST_NAME_REQUIRED]: {
    code: PartyManagementErrorCode.GUEST_NAME_REQUIRED,
    message: 'game.party.errors.guestNameRequired',
    messageKey: 'game.party.errors.guestNameRequired',
  },
  [PartyManagementErrorCode.HOST_PARTY_CONTROL_FORBIDDEN]: {
    code: PartyManagementErrorCode.HOST_PARTY_CONTROL_FORBIDDEN,
    message: 'game.party.errors.hostPartyControlForbidden',
    messageKey: 'game.party.errors.hostPartyControlForbidden',
  },
  [PartyManagementErrorCode.JOIN_FAILED]: {
    code: PartyManagementErrorCode.JOIN_FAILED,
    message: 'game.party.errors.joinFailed',
    messageKey: 'game.party.errors.joinFailed',
  },
  [PartyManagementErrorCode.LIST_FAILED]: {
    code: PartyManagementErrorCode.LIST_FAILED,
    message: 'game.party.errors.listFailed',
    messageKey: 'game.party.errors.listFailed',
  },
  [PartyManagementErrorCode.LEAVE_FAILED]: {
    code: PartyManagementErrorCode.LEAVE_FAILED,
    message: 'game.party.errors.leaveFailed',
    messageKey: 'game.party.errors.leaveFailed',
  },
  [PartyManagementErrorCode.CONNECTION_LOST]: {
    code: PartyManagementErrorCode.CONNECTION_LOST,
    message: 'game.party.errors.connectionLost',
    messageKey: 'game.party.errors.connectionLost',
  },
  [PartyManagementErrorCode.OBSERVE_FAILED]: {
    code: PartyManagementErrorCode.OBSERVE_FAILED,
    message: 'game.party.errors.observeFailed',
    messageKey: 'game.party.errors.observeFailed',
  },
  [PartyManagementErrorCode.PARTY_COMMAND_NOT_AVAILABLE]: {
    code: PartyManagementErrorCode.PARTY_COMMAND_NOT_AVAILABLE,
    message: 'game.party.errors.partyCommandNotAvailable',
    messageKey: 'game.party.errors.partyCommandNotAvailable',
  },
  [PartyManagementErrorCode.PARTY_NOT_FOUND]: {
    code: PartyManagementErrorCode.PARTY_NOT_FOUND,
    message: 'game.party.errors.partyNotFound',
    messageKey: 'game.party.errors.partyNotFound',
  },
  [PartyManagementErrorCode.PARTY_STAGES_NOT_AVAILABLE]: {
    code: PartyManagementErrorCode.PARTY_STAGES_NOT_AVAILABLE,
    message: 'game.party.errors.partyStagesNotAvailable',
    messageKey: 'game.party.errors.partyStagesNotAvailable',
  },
  [PartyManagementErrorCode.VALIDATION_FAILED]: {
    code: PartyManagementErrorCode.VALIDATION_FAILED,
    message: 'game.party.errors.validationFailed',
    messageKey: 'game.party.errors.validationFailed',
  },
};

export class PartyObservationFailedError extends DomainError<PartyManagementErrorCode> {
  constructor(context?: Record<string, unknown>) {
    super(PARTY_MANAGEMENT_ERROR_DEFINITIONS[PartyManagementErrorCode.OBSERVE_FAILED], context);
  }
}

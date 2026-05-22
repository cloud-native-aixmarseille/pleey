import type { PartyActionId } from '../../../../../../../domains/game/party/shared/entities/party-action';
import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import type { PlayableChoiceResultActionTileCopy } from './playable-choice-result-action-tile';

export interface PlayableChoiceRuntimeCopy extends PlayableChoiceResultActionTileCopy {
  readonly paused: string;
  readonly pointsAwarded: string;
  readonly responseLocked: string;
  readonly resultCorrect: string;
  readonly resultHeading: string;
  readonly resultIncorrect: string;
  readonly resultIncorrectHint: string;
  readonly resultNoAnswer: string;
  readonly resultNoAnswerHint: string;
}

export interface PlayableChoiceHostRuntimePanelProps {
  readonly copy: PlayableChoiceRuntimeCopy;
  readonly party: PartyObservation;
  readonly testIdPrefix: string;
}

export interface PlayableChoicePlayerStageSurfaceProps extends PlayableChoiceHostRuntimePanelProps {
  readonly onLeaveParty: () => void;
  readonly onSubmitAction: (actionId: PartyActionId) => void;
  readonly pendingActionId: PartyActionId | null;
  readonly playerActionErrorMessage: string | null;
}

export interface PlayableChoicePlayerResultSurfaceProps
  extends PlayableChoiceHostRuntimePanelProps {
  readonly onLeaveParty: () => void;
}

import type { ParticipantId } from '@pleey/contracts/identity';

export interface ExpireAnonymousParticipantCommand {
  readonly generation: number;
  readonly participantId: ParticipantId;
  readonly retirementId: string;
}

export abstract class AnonymousParticipantRetirementPort {
  abstract expireParticipant(command: ExpireAnonymousParticipantCommand): Promise<void>;
}

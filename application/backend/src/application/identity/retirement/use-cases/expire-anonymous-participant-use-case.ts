import { Inject, Injectable } from '@nestjs/common';
import { AnonymousParticipantRetirementPort } from '../ports/anonymous-participant-retirement.port';

@Injectable()
export class ExpireAnonymousParticipantUseCase {
  constructor(
    @Inject(AnonymousParticipantRetirementPort)
    private readonly retirementPort: AnonymousParticipantRetirementPort,
  ) {}

  execute(command: Parameters<AnonymousParticipantRetirementPort['expireParticipant']>[0]): Promise<void> {
    return this.retirementPort.expireParticipant(command);
  }
}

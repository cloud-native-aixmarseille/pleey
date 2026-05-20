import { Inject, Injectable } from '@nestjs/common';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { GameTypePartyActionPolicyRegistryPort } from '../../../../game/types/shared/ports/game-type-party-action-policy-registry.port';
import { BroadcastPartyObservationUseCase } from '../../shared/use-cases/broadcast-party-observation-use-case';
import type { SubmitPartyActionDto } from '../dto/submit-party-action.dto';
import { PlayerPartyActionRuntimePort } from '../ports/player-party-action-runtime.port';

@Injectable()
export class SubmitPartyActionUseCase {
  constructor(
    @Inject(PlayerPartyActionRuntimePort)
    private readonly playerPartyActionRuntime: PlayerPartyActionRuntimePort,
    @Inject(GameTypePartyActionPolicyRegistryPort)
    private readonly gameTypePartyActionPolicyRegistry: GameTypePartyActionPolicyRegistryPort,
    private readonly broadcastPartyObservationUseCase: BroadcastPartyObservationUseCase,
  ) {}

  async execute(input: SubmitPartyActionDto): Promise<void> {
    const target = await this.playerPartyActionRuntime.findSubmissionTarget({
      partyId: input.partyId,
      playerIdentity: input.playerIdentity,
    });

    if (!target) {
      throw new Error(GameErrorCode.PARTY_NOT_FOUND);
    }

    if (
      target.context?.lifecycle.stageId !== null &&
      target.context?.lifecycle.stageId !== undefined &&
      target.playerActionState?.stageId === target.context.lifecycle.stageId
    ) {
      throw new Error(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
    }

    const policy = this.gameTypePartyActionPolicyRegistry.resolveByGameType(target.gameType);
    const resolution = await policy.evaluateSubmission({
      actionId: input.actionId,
      context: target.context,
      gameId: target.gameId,
      partyId: target.partyId,
      playerIdentity: target.playerIdentity,
      status: target.status,
    });

    await this.playerPartyActionRuntime.saveSubmissionResult({
      actionId: input.actionId,
      context: resolution.context,
      partyId: target.partyId,
      playerIdentity: target.playerIdentity,
      scoreDelta: resolution.scoreDelta,
      status: resolution.status,
    });
    await this.broadcastPartyObservationUseCase.execute({ partyId: target.partyId });
  }
}

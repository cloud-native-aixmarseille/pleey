import { Injectable } from '@nestjs/common';
import type { PartyObservationSnapshot } from '../../../../../application/game/party/shared/entities/party-observation-snapshot';
import { PartyCommandNotAvailableError } from '../../../../../domain/game/errors';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';
import type { PartyRuntimeContext } from '../../../../../domain/game/party/shared/entities/party-runtime-context';
import { MediaErrorCode } from '../../../../../domain/media/enums/media-error-code.enum';
import { MediaAccessIssuer } from '../../../../../domain/media/ports/media-access-issuer.port';
import type { PartyObserverSocketData } from '../party-observer-socket-data';
import { PartyObservationAudienceResolver } from './party-observation-audience-resolver';

type RuntimeMedia = NonNullable<NonNullable<PartyRuntimeContext['stage']>['current']>['media'];

@Injectable()
export class PartyObservationMediaAccessService {
  constructor(
    private readonly issuer: MediaAccessIssuer,
    private readonly audienceResolver: PartyObservationAudienceResolver,
  ) {}

  async request(
    socket: { readonly id: string; readonly data: PartyObserverSocketData },
    snapshot: PartyObservationSnapshot,
    assetId: string,
  ) {
    const audience = await this.audienceResolver.resolve(socket, snapshot.hostObservation);
    const context = audience.kind === 'host' ? snapshot.hostObservation.context : snapshot.playerObservation.context;
    const media = context?.stage?.current?.media ?? context?.result?.current?.media;

    if (
      audience.kind === 'observer' ||
      (audience.kind === 'player' &&
        (!audience.canAccessMedia || snapshot.hostObservation.status === PartyStatus.ENDED)) ||
      !media?.id ||
      media.id !== assetId
    ) {
      throw new PartyCommandNotAvailableError({
        partyId: snapshot.hostObservation.partyId,
        reason: 'mediaAccessDenied',
      });
    }

    return { ...(await this.issuer.issue(assetId)), partyId: snapshot.hostObservation.partyId };
  }

  async toDeliveryContext(
    context: PartyRuntimeContext | null,
    partyId: string,
    allowMedia: boolean,
  ): Promise<PartyRuntimeContext | null> {
    if (!context) return null;

    if (context.stage?.current) {
      return {
        ...context,
        stage: {
          ...context.stage,
          current: {
            ...context.stage.current,
            media: await this.toDeliveryMedia(context.stage.current.media, partyId, allowMedia),
          },
        },
      };
    }

    if (context.result?.current) {
      return {
        ...context,
        result: {
          ...context.result,
          current: {
            ...context.result.current,
            media: await this.toDeliveryMedia(context.result.current.media, partyId, allowMedia),
          },
        },
      };
    }

    return context;
  }

  private async toDeliveryMedia(media: RuntimeMedia, partyId: string, allowMedia: boolean): Promise<RuntimeMedia> {
    // Legacy runtime JSON without an asset identifier must never expose its stored URI.
    if (!allowMedia || !media?.id) return null;
    try {
      return { ...(await this.issuer.issue(media.id)), partyId };
    } catch (error) {
      if (error instanceof Error && error.message === MediaErrorCode.MEDIA_UNAVAILABLE) return null;
      throw error;
    }
  }
}

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DEFAULT_PARTY_SETTINGS, type PartySettings } from '../../../domain/game/party/shared/entities/party-settings';

interface PersistedPartySettings {
  readonly allowJoiningAfterStart?: unknown;
  readonly allowOptionChangeAfterVoting?: unknown;
  readonly randomizeOptionOrder?: unknown;
  readonly randomizeStageOrder?: unknown;
}

@Injectable()
export class PrismaPartySettingsMapper {
  readonly defaults = DEFAULT_PARTY_SETTINGS;

  toOptionalPartySettings(source: unknown): PartySettings | null {
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      return null;
    }

    const record = source as PersistedPartySettings;

    return {
      allowJoiningAfterStart: Boolean(record.allowJoiningAfterStart),
      allowOptionChangeAfterVoting: Boolean(record.allowOptionChangeAfterVoting),
      randomizeOptionOrder: Boolean(record.randomizeOptionOrder),
      randomizeStageOrder: Boolean(record.randomizeStageOrder),
    };
  }

  toPartySettings(source: unknown): PartySettings {
    return this.toOptionalPartySettings(source) ?? this.defaults;
  }

  toPersistedPartySettings(settings: PartySettings): Prisma.InputJsonValue {
    return {
      allowJoiningAfterStart: settings.allowJoiningAfterStart,
      allowOptionChangeAfterVoting: settings.allowOptionChangeAfterVoting,
      randomizeOptionOrder: settings.randomizeOptionOrder,
      randomizeStageOrder: settings.randomizeStageOrder,
    } satisfies Prisma.InputJsonValue;
  }
}

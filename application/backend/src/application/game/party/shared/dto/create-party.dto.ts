import type { GameId } from '@pleey/domain/game';
import type { PartySettings } from '@pleey/domain/party';
import type { ThemeId } from '@pleey/domain/theme';
import type { UserId } from '../../../../../domain/identity/entities/user';

export interface CreatePartyDto {
  readonly gameId: GameId;
  readonly hostUserId: UserId;
  readonly privatePartyPassword?: string;
  readonly settingsOverride?: Partial<PartySettings>;
  readonly themeIdOverride?: ThemeId | null;
}

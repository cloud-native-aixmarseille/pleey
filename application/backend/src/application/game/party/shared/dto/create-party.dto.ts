import type { GameId } from '@pleey/domain/game';
import type { PartySettings } from '../../../../../domain/game/party/shared/entities/party-settings';
import type { UserId } from '../../../../../domain/identity/entities/user';
import type { ThemeId } from '../../../../../domain/theme/entities/theme-id';

export interface CreatePartyDto {
  readonly gameId: GameId;
  readonly hostUserId: UserId;
  readonly privatePartyPassword?: string;
  readonly settingsOverride?: Partial<PartySettings>;
  readonly themeIdOverride?: ThemeId | null;
}

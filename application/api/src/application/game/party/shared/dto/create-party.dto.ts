import type { GameId } from '@pleey/contracts/game';
import type { PartySettings } from '@pleey/contracts/party';
import type { ThemeId } from '@pleey/contracts/theme';
import type { UserId } from '../../../../../domain/identity/entities/user';

export interface CreatePartyDto {
  readonly gameId: GameId;
  readonly hostUserId: UserId;
  readonly privatePartyPassword?: string;
  readonly settingsOverride?: Partial<PartySettings>;
  readonly themeIdOverride?: ThemeId | null;
}

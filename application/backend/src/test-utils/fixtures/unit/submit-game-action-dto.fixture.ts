import type { SubmitGameActionDto } from '../../../application/game-session/live/player/dto/submit-game-action-dto';
import type { UserId } from '../../../domain/auth/entities/user';
import type { GameSessionPin } from '../../../domain/game/entities/game-session';
import type { GuestId } from '../../../domain/game/entities/player-state';
import type { QuestionAnswerId } from '../../../domain/quiz/entities/question-answer';

export type SubmitGameActionDtoFixtureParams = Partial<SubmitGameActionDto> & {
  pin?: GameSessionPin;
  userId?: UserId;
  guestId?: GuestId;
  actionId?: QuestionAnswerId;
  timeLeft?: number;
};

export const createSubmitGameActionDtoFixture = (
  params: SubmitGameActionDtoFixtureParams = {},
): SubmitGameActionDto => ({
  pin: '123456',
  guestId: 'guest-1' as GuestId,
  actionId: 1 as QuestionAnswerId,
  timeLeft: 10,
  ...params,
});

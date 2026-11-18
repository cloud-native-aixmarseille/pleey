import { GameType as SharedGameType } from '@pleey/domain/game';

export const GameType = SharedGameType;
export type GameType = (typeof GameType)[keyof typeof GameType];
export type { GameTypeId } from '@pleey/domain/game';

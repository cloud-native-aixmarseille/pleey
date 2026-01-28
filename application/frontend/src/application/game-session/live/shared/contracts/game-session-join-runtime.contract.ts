export interface JoinGameDispatchCommand {
  readonly pin: string;
  readonly username: string;
  readonly userId?: number;
  readonly guestId?: string;
}

export enum JoinGameDispatchReceiptStatus {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export type JoinGameDispatchReceipt =
  | {
      readonly status: JoinGameDispatchReceiptStatus.ACCEPTED;
      readonly avatarUri: string | null;
    }
  | {
      readonly status: JoinGameDispatchReceiptStatus.REJECTED;
      readonly errorCode: string;
    };

export interface GameSessionJoinRuntimePort {
  joinGame(command: JoinGameDispatchCommand): void;
  joinGameWithReceipt(command: JoinGameDispatchCommand): Promise<JoinGameDispatchReceipt>;
}

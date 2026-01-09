/**
 * Game Socket Interface
 * Defines the contract for real-time game communication
 * Following Dependency Inversion Principle (SOLID)
 */
export type GameSocketOutboundEvent =
  | {
    type: "join-game";
    pin: string;
    username: string;
    userId?: number;
    guestId?: string;
  }
  | {
    type: "start-game";
    pin: string;
  }
  | {
    type: "stop-game";
    pin: string;
    hostId: number;
  }
  | {
    type: "resume-game";
    pin: string;
    hostId: number;
  }
  | {
    type: "end-game";
    pin: string;
    hostId: number;
  }
  | {
    type: "submit-answer";
    pin: string;
    userId?: number;
    guestId?: string;
    answer: string;
    timeLeft: number;
  }
  | {
    type: "next-question";
    pin: string;
  };

export interface IGameSocket {
  publish(event: GameSocketOutboundEvent): void;
}

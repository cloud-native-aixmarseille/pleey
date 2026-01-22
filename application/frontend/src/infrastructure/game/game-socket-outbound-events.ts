import type { GameSocketOutboundEvent } from "../../domains/game/ports/game-socket";

export type OutboundPayloadByType = {
  [E in GameSocketOutboundEvent as E["type"]]: Omit<E, "type">;
};

export type OutboundPayloadByTypeKey = keyof OutboundPayloadByType;

export const GAME_SOCKET_OUTBOUND_EVENT = {
  JOIN_GAME: "join-game",
  START_GAME: "start-game",
  STOP_GAME: "stop-game",
  RESUME_GAME: "resume-game",
  END_GAME: "end-game",
  SUBMIT_ANSWER: "submit-answer",
  NEXT_QUESTION: "next-question",
} as const satisfies Record<string, OutboundPayloadByTypeKey>;

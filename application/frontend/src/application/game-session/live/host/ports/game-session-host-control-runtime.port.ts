export interface PauseGameCommand {
  readonly pin: string;
}

export interface ResumeGameCommand {
  readonly pin: string;
}

export interface RewindStageCommand {
  readonly pin: string;
}

export interface RestartStageCommand {
  readonly pin: string;
}

export interface ReturnToLobbyCommand {
  readonly pin: string;
}

export interface NextStageCommand {
  readonly pin: string;
}

export interface EndGameCommand {
  readonly pin: string;
}

export interface GameSessionHostControlRuntimePort {
  /** Pause the active session and keep the current stage/time state resumable. */
  pauseGame(command: PauseGameCommand): void;

  /** Resume a previously paused session from its preserved current stage state. */
  resumeGame(command: ResumeGameCommand): void;

  /** Restart the current stage from the beginning without moving to a different stage. */
  restartStage(command: RestartStageCommand): void;

  /** Move the session back to the previous stage instead of replaying the current one. */
  rewindStage(command: RewindStageCommand): void;

  /** Leave live stage flow and return the session to its lobby state. */
  returnToLobby(command: ReturnToLobbyCommand): void;

  /** Advance the session to the next stage in the game flow. */
  nextStage(command: NextStageCommand): void;

  /** End the session definitively and stop the live game flow. */
  endGame(command: EndGameCommand): void;
}

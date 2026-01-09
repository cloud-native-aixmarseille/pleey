export interface GameSession {
  sessionId?: number;
  pin: string;
  quizId?: number;
  hostId?: number;
  status: string;
  currentQuestion?: number | null;
  createdAt?: string;
}

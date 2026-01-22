export interface GameSession {
  sessionId?: number;
  pin: string;
  quizId?: number;
  hostId?: number;
  status: string;
  currentQuestionId?: number | null;
  createdAt?: string;
}

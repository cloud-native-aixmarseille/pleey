export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  created_by: number;
  created_at: string;
}

export interface Question {
  id: number;
  quiz_id: number;
  question_text: string;
  type: string;
  correct_answer: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  time_limit: number;
  points: number;
}

export interface GameSession {
  pin: string;
  quiz_id: number;
  status: string;
}

export interface Player {
  id: number;
  username: string;
}

export interface AnswerResult {
  isCorrect: boolean;
  points: number;
  correctAnswer: string;
  statistics?: AnswerStatistics;
}

export interface AnswerStatistics {
  totalAnswers: number;
  answerDistribution: {
    A?: number;
    B?: number;
    C?: number;
    D?: number;
    true?: number;
    false?: number;
  };
}

export interface LeaderboardEntry {
  username: string;
  totalPoints: number;
  rank: number;
  userId?: number;
}

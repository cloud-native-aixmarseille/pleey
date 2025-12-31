export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  avatarUrl?: string | null;
}

export interface Organization {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: number;
  organizationId: number;
  userId: number;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

export interface OrganizationDashboard {
  organization: {
    id: number;
    name: string;
    description: string | null;
  };
  stats: {
    totalQuizzes: number;
    totalGameSessions: number;
    activeGameSessions: number;
    totalMembers: number;
  };
}

export interface Quiz {
  id: number;
  title: string;
  description: string | null;
  created_by: number;
  organizationId?: number;
  created_at: string;
  question_count?: number;
  is_active?: boolean;
}

export interface Question {
  id: number;
  quiz_id: number;
  question_text: string;
  type: string;
  correct_answer: string;
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  time_limit: number;
  points: number;
}

export interface GameSession {
  sessionId?: number;
  session_id?: number;
  pin: string;
  quizId?: number;
  quiz_id?: number;
  adminId?: number;
  admin_id?: number;
  status: string;
  currentQuestion?: number;
  current_question?: number;
  createdAt?: string;
  created_at?: string;
}

export interface Player {
  id: number;
  username: string;
  avatar: string;
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

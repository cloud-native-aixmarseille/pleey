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

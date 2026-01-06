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

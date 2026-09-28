export function buildQuizQuestionMediaUri(questionId: string, updatedAt: Date): string {
  return `/api/quiz-questions/${encodeURIComponent(questionId)}/media?v=${updatedAt.getTime()}`;
}

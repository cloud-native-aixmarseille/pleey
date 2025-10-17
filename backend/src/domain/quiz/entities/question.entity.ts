/**
 * Question Domain Entity
 * Represents a quiz question in the domain
 */
export class Question {
  constructor(
    public readonly id: number,
    public readonly quizId: number,
    public readonly questionText: string,
    public readonly type: 'multiple' | 'truefalse',
    public readonly correctAnswer: string,
    public readonly optionA: string | null,
    public readonly optionB: string | null,
    public readonly optionC: string | null,
    public readonly optionD: string | null,
    public readonly timeLimit: number,
    public readonly points: number,
  ) {}

  /**
   * Checks if the answer is correct
   */
  isAnswerCorrect(answer: string): boolean {
    return answer === this.correctAnswer;
  }

  /**
   * Gets all options for the question
   */
  getOptions(): string[] {
    const options = [this.optionA, this.optionB, this.optionC, this.optionD];
    return options.filter((opt) => opt !== null) as string[];
  }

  /**
   * Validates if question has minimum required data
   */
  isValid(): boolean {
    return (
      this.questionText.trim().length > 0 &&
      this.correctAnswer.trim().length > 0 &&
      this.timeLimit > 0 &&
      this.points > 0
    );
  }
}

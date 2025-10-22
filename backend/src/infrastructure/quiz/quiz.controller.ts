import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GetAllQuizzesUseCase } from '../../application/quiz/use-cases/get-all-quizzes.use-case';
import { GetQuizQuestionsUseCase } from '../../application/quiz/use-cases/get-quiz-questions.use-case';

@Controller('quizzes')
export class QuizController {
  constructor(
    private readonly getAllQuizzesUseCase: GetAllQuizzesUseCase,
    private readonly getQuizQuestionsUseCase: GetQuizQuestionsUseCase,
  ) { }

  @Get()
  async findAll() {
    const quizzes = await this.getAllQuizzesUseCase.execute();
    return quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      createdById: quiz.createdById,
      createdAt: quiz.createdAt,
    }));
  }

  @Get(':quizId/questions')
  async findQuestions(@Param('quizId', ParseIntPipe) quizId: number) {
    const questions = await this.getQuizQuestionsUseCase.execute(quizId);

    return questions.map((question) => ({
      id: question.id,
      quiz_id: question.quizId,
      question_text: question.questionText,
      type: question.type,
      correct_answer: question.correctAnswer,
      option_a: question.optionA,
      option_b: question.optionB,
      option_c: question.optionC,
      option_d: question.optionD,
      time_limit: question.timeLimit,
      points: question.points,
    }));
  }
}

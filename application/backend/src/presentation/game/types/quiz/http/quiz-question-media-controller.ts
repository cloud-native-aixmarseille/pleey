import { Controller, Get, NotFoundException, Param, Res, StandardSchemaValidationPipe, UsePipes } from '@nestjs/common';
import type { Response } from 'express';
import { QuizQuestionIdentifier } from '../../../../../application/game/types/quiz/services/quiz-question-identifier';
import { GetQuizQuestionMediaUseCase } from '../../../../../application/game/types/quiz/use-cases/get-quiz-question-media-use-case';
import {
  type QuizQuestionMediaHttpResponse,
  type QuizQuestionMediaQuestionIdParam,
  quizQuestionMediaHttpResponseSchema,
  quizQuestionMediaQuestionIdParamSchema,
} from './types/quiz-question-media.schemas';

@UsePipes(new StandardSchemaValidationPipe())
@Controller('api/quiz-questions')
export class QuizQuestionMediaController {
  constructor(
    private readonly getQuizQuestionMediaUseCase: GetQuizQuestionMediaUseCase,
    private readonly quizQuestionIdentifier: QuizQuestionIdentifier,
  ) {}

  // Intentionally public: live host and player screens load question media directly through
  // browser media elements, including guest participants who do not have back-office JWTs.
  @Get(':questionId/media')
  async getQuestionMedia(
    @Param('questionId', { schema: quizQuestionMediaQuestionIdParamSchema })
    questionId: QuizQuestionMediaQuestionIdParam,
    @Res() res: Response,
  ): Promise<void> {
    const media = await this.getQuizQuestionMediaUseCase.execute(this.quizQuestionIdentifier.parse(questionId));

    if (!media) {
      throw new NotFoundException();
    }

    this.sendResponse(res, this.createMediaResponse(media.mimeType, media.content));
  }

  private createMediaResponse(mimeType: string, content: Uint8Array): QuizQuestionMediaHttpResponse {
    return quizQuestionMediaHttpResponseSchema.parse({
      content,
      headers: {
        cacheControl: 'public, max-age=60',
        contentType: mimeType,
      },
    });
  }

  private sendResponse(res: Response, mediaResponse: QuizQuestionMediaHttpResponse): void {
    res.setHeader('Cache-Control', mediaResponse.headers.cacheControl);
    res.setHeader('Content-Type', mediaResponse.headers.contentType);
    res.send(mediaResponse.content);
  }
}

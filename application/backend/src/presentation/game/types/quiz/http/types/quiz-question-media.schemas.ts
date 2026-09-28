import * as z from 'zod';

const questionMediaHeaderValueSchema = z.string().min(1);

export const quizQuestionMediaQuestionIdParamSchema = z.uuid({ version: 'v7' });
export type QuizQuestionMediaQuestionIdParam = z.infer<typeof quizQuestionMediaQuestionIdParamSchema>;

export const quizQuestionMediaHttpResponseSchema = z.object({
  content: z.instanceof(Uint8Array),
  headers: z.object({
    cacheControl: questionMediaHeaderValueSchema,
    contentType: questionMediaHeaderValueSchema,
  }),
});

export type QuizQuestionMediaHttpResponse = z.infer<typeof quizQuestionMediaHttpResponseSchema>;

import { describe, expect, it, vi } from 'vitest';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import { ProjectIdentifier } from '../../../../application/workspace/shared/services/identifiers/project-identifier';
import { QuizQuestionType } from '../../../../domain/game/types/quiz/entities/quiz-question';
import { SelectableOption } from '../../../../domain/game/types/shared/entities/selectable-option';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import type { PrismaService } from '../../../database/prisma-service';
import { PrismaQuizManagementRepository } from './prisma-quiz-management.repository';

describe('PrismaQuizManagementRepository', () => {
  it('creates a quiz with initial question positions from array order', async () => {
    const createdAt = new Date('2026-06-01T10:00:00.000Z');
    const prisma = {
      game: {
        create: vi.fn().mockResolvedValue({
          quiz: {
            id: backendTestIdentifiers.game(12),
            gameId: backendTestIdentifiers.game(42),
            game: {
              id: backendTestIdentifiers.game(42),
              projectId: backendTestIdentifiers.project(7),
              title: 'Sprint quiz',
              description: null,
              createdAt,
            },
            _count: { questions: 2 },
          },
        }),
      },
    } as unknown as PrismaService;
    const projectIdentifier = new ProjectIdentifier();
    const repository = new PrismaQuizManagementRepository(
      prisma,
      new GameIdentifier(),
      new GameTypeIdentifier(),
      projectIdentifier,
    );

    const quiz = await repository.createWithQuestions({
      projectId: backendTestIdentifiers.project(7),
      title: 'Sprint quiz',
      description: null,
      questions: [
        {
          questionText: 'First question?',
          type: QuizQuestionType.Multiple,
          timeLimit: 20,
          points: 100,
          answers: [new SelectableOption(null, 'A', 0, true)],
        },
        {
          questionText: 'Second question?',
          type: QuizQuestionType.TrueFalse,
          timeLimit: 15,
          points: 50,
          answers: [new SelectableOption(null, 'True', 0, true)],
        },
      ],
    });

    expect(prisma.game.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          quiz: {
            create: {
              questions: {
                create: [
                  expect.objectContaining({ position: 0, questionText: 'First question?' }),
                  expect.objectContaining({ position: 1, questionText: 'Second question?' }),
                ],
              },
            },
          },
        }),
      }),
    );
    expect(quiz.questionCount).toBe(2);
  });
});

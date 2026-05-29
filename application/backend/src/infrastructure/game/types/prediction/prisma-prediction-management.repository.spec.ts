import { describe, expect, it, vi } from 'vitest';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import { ProjectIdentifier } from '../../../../application/workspace/shared/services/identifiers/project-identifier';
import { SelectableOption } from '../../../../domain/game/types/shared/entities/selectable-option';
import type { PrismaService } from '../../../database/prisma-service';
import { PrismaPredictionManagementRepository } from './prisma-prediction-management.repository';

describe('PrismaPredictionManagementRepository', () => {
  it('creates a prediction with initial prompt positions from array order', async () => {
    const createdAt = new Date('2026-06-01T10:00:00.000Z');
    const prisma = {
      game: {
        create: vi.fn().mockResolvedValue({
          prediction: {
            id: 14,
            gameId: 44,
            game: {
              id: 44,
              projectId: 9,
              title: 'Sprint prediction',
              description: null,
              createdAt,
            },
            _count: { prompts: 2 },
          },
        }),
      },
    } as unknown as PrismaService;
    const projectIdentifier = new ProjectIdentifier();
    const repository = new PrismaPredictionManagementRepository(
      prisma,
      new GameIdentifier(),
      new GameTypeIdentifier(),
      projectIdentifier,
    );

    const prediction = await repository.createWithPrompts({
      projectId: projectIdentifier.parse(9),
      title: 'Sprint prediction',
      description: null,
      prompts: [
        {
          promptText: 'First prompt?',
          timeLimit: 20,
          points: 100,
          options: [new SelectableOption(null, 'Home', 0, true)],
        },
        {
          promptText: 'Second prompt?',
          timeLimit: 15,
          points: 50,
          options: [new SelectableOption(null, 'Away', 0, true)],
        },
      ],
    });

    expect(prisma.game.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          prediction: {
            create: {
              prompts: {
                create: [
                  expect.objectContaining({ position: 0, promptText: 'First prompt?' }),
                  expect.objectContaining({ position: 1, promptText: 'Second prompt?' }),
                ],
              },
            },
          },
        }),
      }),
    );
    expect(prediction.promptCount).toBe(2);
  });
});

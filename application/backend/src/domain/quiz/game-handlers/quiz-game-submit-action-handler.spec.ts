import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createGameStageFixture } from '../../../test-utils/fixtures/unit/game-stage.fixture';
import { createSubmitGameActionDtoFixture } from '../../../test-utils/fixtures/unit/submit-game-action-dto.fixture';
import { createGameBroadcastServiceMock } from '../../../test-utils/mock-factories/game-broadcast-service.mock-factory';
import { createGameSessionStateServiceMock } from '../../../test-utils/mock-factories/game-session-state-service.mock-factory';
import { createGuestRepositoryMock } from '../../../test-utils/mock-factories/guest-repository.mock-factory';
import { createRevealGameResultUseCaseMock } from '../../../test-utils/mock-factories/reveal-game-result-use-case.mock-factory';
import { createScoreRepositoryMock } from '../../../test-utils/mock-factories/score-repository.mock-factory';
import { GameAction, type GameActionId, type GameStageId } from '../../game/entities/game-stage';
import { GameType } from '../../game/enums/game-type.enum';
import type { ScoreRepository } from '../../game/ports/repositories/score.repository';
import { GameBroadcastEventType } from '../../game/ports/services/game-broadcast.service';
import { QuizScoreCalculatorService } from '../services/quiz-score-calculator-service';
import { QuizGameSubmitActionHandler } from './quiz-game-submit-action-handler';

describe('QuizGameSubmitActionHandler', () => {
  let handler: QuizGameSubmitActionHandler;
  let mockGameSessionStateService: ReturnType<typeof createGameSessionStateServiceMock>;
  let mockBroadcastService: ReturnType<typeof createGameBroadcastServiceMock>;
  let mockRevealGameResultUseCase: ReturnType<typeof createRevealGameResultUseCaseMock>;
  let mockScoreRepository: ScoreRepository;
  let mockGuestRepository: ReturnType<typeof createGuestRepositoryMock>;
  let scoreCalculatorService: QuizScoreCalculatorService;

  beforeEach(() => {
    mockGameSessionStateService = createGameSessionStateServiceMock();
    mockBroadcastService = createGameBroadcastServiceMock();
    mockRevealGameResultUseCase = createRevealGameResultUseCaseMock();
    mockScoreRepository = createScoreRepositoryMock();
    mockGuestRepository = createGuestRepositoryMock();
    scoreCalculatorService = new QuizScoreCalculatorService();

    handler = new QuizGameSubmitActionHandler(
      mockGameSessionStateService as never,
      mockBroadcastService as never,
      mockScoreRepository,
      mockGuestRepository as never,
      scoreCalculatorService,
      mockRevealGameResultUseCase as never,
    );
  });

  describe('Guest player action submission', () => {
    it('should persist scores to database for guest players', async () => {
      const mockPrompt = createGameStageFixture();

      const mockState = {
        sessionId: 1,
        currentStage: mockPrompt,
        hasPlayerActed: vi.fn().mockReturnValue(false),
        findPlayerByIdentity: vi.fn().mockReturnValue({
          guestId: 'guest-xyz',
          username: 'Guest Player',
        }),
        getOrCreateScore: vi.fn().mockReturnValue({ addPoints: vi.fn() }),
        recordAction: vi.fn(),
        haveAllNonHostPlayersActed: vi.fn().mockReturnValue(false),
        getCorrectActionIds: vi.fn().mockReturnValue([1]),
      };

      mockGuestRepository.findById.mockResolvedValue({
        id: 'guest-xyz',
        sessionId: 1,
        username: 'Guest Player',
        avatarSeed: 'guest-xyz',
        createdAt: new Date(),
      } as never);

      const result = await handler.submit({
        dto: createSubmitGameActionDtoFixture({ guestId: 'guest-xyz' }),
        pin: '123456',
        state: mockState as never,
        session: { id: 1 } as never,
        gameType: GameType.QUIZ,
        connectionId: 'socket-1',
      });

      expect(result.isCorrect).toBe(true);
      expect(result.points).toBeGreaterThan(0);
      expect(mockScoreRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 1,
          guestId: 'guest-xyz',
          context: expect.objectContaining({
            stageId: 1,
            isCorrect: true,
            guestUsername: 'Guest Player',
          }),
        }),
      );
      expect(mockBroadcastService.publish).toHaveBeenCalledWith({
        type: GameBroadcastEventType.ACTION_ACKNOWLEDGED,
        connectionId: 'socket-1',
      });
      expect(mockGameSessionStateService.update).toHaveBeenCalledWith('123456', mockState);
    });

    it('should persist scores to database for authenticated players', async () => {
      const mockPrompt = createGameStageFixture();

      const mockState = {
        sessionId: 1,
        currentStage: mockPrompt,
        hasPlayerActed: vi.fn().mockReturnValue(false),
        findPlayerByIdentity: vi.fn().mockReturnValue({
          userId: 42,
          username: 'Player',
        }),
        getOrCreateScore: vi.fn().mockReturnValue({ addPoints: vi.fn() }),
        recordAction: vi.fn(),
        haveAllNonHostPlayersActed: vi.fn().mockReturnValue(false),
        getCorrectActionIds: vi.fn().mockReturnValue([1]),
      };

      const result = await handler.submit({
        dto: createSubmitGameActionDtoFixture({ userId: 42, guestId: undefined }),
        pin: '123456',
        state: mockState as never,
        session: { id: 1 } as never,
        gameType: GameType.QUIZ,
      });

      expect(result.isCorrect).toBe(true);
      expect(result.points).toBeGreaterThan(0);
      expect(mockScoreRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 1,
          userId: 42,
          context: expect.objectContaining({
            stageId: 1,
            isCorrect: true,
          }),
        }),
      );
      expect(mockGameSessionStateService.update).toHaveBeenCalledWith('123456', mockState);
    });

    it('should calculate correct scores for both guest and authenticated players', async () => {
      const mockPrompt = createGameStageFixture({
        actions: [
          new GameAction(1 as GameActionId, 1 as GameStageId, 'Option A', 0, false),
          new GameAction(2 as GameActionId, 1 as GameStageId, 'Option B', 1, true),
          new GameAction(3 as GameActionId, 1 as GameStageId, 'Option C', 2, false),
          new GameAction(4 as GameActionId, 1 as GameStageId, 'Option D', 3, false),
        ],
      });

      const mockState = {
        sessionId: 1,
        currentStage: mockPrompt,
        hasPlayerActed: vi.fn().mockReturnValue(false),
        findPlayerByIdentity: vi.fn().mockReturnValue(undefined),
        getOrCreateScore: vi.fn().mockReturnValue({ addPoints: vi.fn() }),
        recordAction: vi.fn(),
        haveAllNonHostPlayersActed: vi.fn().mockReturnValue(false),
        getCorrectActionIds: vi.fn().mockReturnValue([2]),
      };

      const guestResult = await handler.submit({
        dto: createSubmitGameActionDtoFixture({ guestId: 'guest-xyz' }),
        pin: '123456',
        state: mockState as never,
        session: { id: 1 } as never,
        gameType: GameType.QUIZ,
      });

      const authResult = await handler.submit({
        dto: createSubmitGameActionDtoFixture({ userId: 42, guestId: undefined }),
        pin: '123456',
        state: mockState as never,
        session: { id: 1 } as never,
        gameType: GameType.QUIZ,
      });

      expect(guestResult.isCorrect).toBe(false);
      expect(authResult.isCorrect).toBe(false);
      expect(guestResult.points).toBe(0);
      expect(authResult.points).toBe(0);
    });
  });
});

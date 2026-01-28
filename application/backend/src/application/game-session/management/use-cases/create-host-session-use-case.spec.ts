import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../../../domain/game/enums/game-session-status.enum';
import { PinAlreadyInUseError } from '../../../../domain/game/errors/pin-already-in-use-error';
import { createGameFixture } from '../../../../test-utils/fixtures/unit/game.fixture';
import { createGameSessionFixture } from '../../../../test-utils/fixtures/unit/game-session.fixture';
import { createOrganizationMemberFixture } from '../../../../test-utils/fixtures/unit/organization-member.fixture';
import { createProjectFixture } from '../../../../test-utils/fixtures/unit/project.fixture';
import { createGameRepositoryMock } from '../../../../test-utils/mock-factories/game-repository.mock-factory';
import { createGameSessionRepositoryMock } from '../../../../test-utils/mock-factories/game-session-repository.mock-factory';
import { createOrganizationMemberRepositoryMock } from '../../../../test-utils/mock-factories/organization.mock-factory';
import { createProjectRepositoryMock } from '../../../../test-utils/mock-factories/project-repository.mock-factory';
import { CreateHostSessionUseCase } from './create-host-session-use-case';

describe('CreateHostSessionUseCase', () => {
  let useCase: CreateHostSessionUseCase;
  let mockGameSessionRepository: ReturnType<typeof createGameSessionRepositoryMock>;
  let mockGameRepository: ReturnType<typeof createGameRepositoryMock>;
  let mockMemberRepository: ReturnType<typeof createOrganizationMemberRepositoryMock>;
  let mockProjectRepository: ReturnType<typeof createProjectRepositoryMock>;

  beforeEach(() => {
    mockGameSessionRepository = createGameSessionRepositoryMock();
    mockMemberRepository = createOrganizationMemberRepositoryMock();
    mockGameRepository = createGameRepositoryMock();
    mockProjectRepository = createProjectRepositoryMock();

    useCase = new CreateHostSessionUseCase(
      mockGameSessionRepository,
      mockGameRepository,
      mockProjectRepository,
      mockMemberRepository,
    );
  });

  describe('execute', () => {
    it('should create a game session successfully when the game exists and no active sessions are running', async () => {
      const mockGame = createGameFixture();
      const mockSession = createGameSessionFixture();

      mockGameRepository.findById.mockResolvedValue(mockGame);
      mockProjectRepository.findById.mockResolvedValue(
        createProjectFixture({ id: mockGame.projectId, organizationId: 1 }),
      );
      mockMemberRepository.findByOrganizationAndUser.mockResolvedValue(
        createOrganizationMemberFixture(),
      );
      mockGameSessionRepository.findActiveByGameId.mockResolvedValue(null);
      mockGameSessionRepository.findActiveByHostId.mockResolvedValue([]);
      mockGameSessionRepository.create.mockResolvedValue(mockSession);

      const result = await useCase.execute({ gameId: mockGame.id, hostId: 1 });

      expect(result.session).toBeDefined();
      expect(result.pin).toBeDefined();
      expect(result.pin).toHaveLength(6);
      expect(mockGameRepository.findById).toHaveBeenCalledWith(mockGame.id);
      expect(mockGameSessionRepository.findActiveByGameId).toHaveBeenCalledWith(mockGame.id);
      expect(mockGameSessionRepository.findActiveByHostId).toHaveBeenCalledWith(1);
      expect(mockGameSessionRepository.create).toHaveBeenCalled();
    });

    it('should throw when game does not exist', async () => {
      mockGameRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute({ gameId: 999, hostId: 100 })).rejects.toThrow(
        GameErrorCode.GAME_NOT_FOUND,
      );
    });

    it('should throw when host has other active sessions', async () => {
      const mockGame = createGameFixture();
      const activeSession = createGameSessionFixture({
        gameId: 2,
        status: GameSessionStatus.ACTIVE,
      });

      mockGameRepository.findById.mockResolvedValue(mockGame);
      mockProjectRepository.findById.mockResolvedValue(
        createProjectFixture({ id: mockGame.projectId, organizationId: 1 }),
      );
      mockMemberRepository.findByOrganizationAndUser.mockResolvedValue(
        createOrganizationMemberFixture(),
      );
      mockGameSessionRepository.findActiveByGameId.mockResolvedValue(null);
      mockGameSessionRepository.findActiveByHostId.mockResolvedValue([activeSession]);

      await expect(useCase.execute({ gameId: mockGame.id, hostId: 1 })).rejects.toThrow(
        GameErrorCode.ACTIVE_SESSION_EXISTS,
      );

      expect(mockGameSessionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw when the game already has an active session', async () => {
      const mockGame = createGameFixture();
      const quizSession = createGameSessionFixture({
        status: GameSessionStatus.ACTIVE,
        hostId: 2,
      });

      mockGameRepository.findById.mockResolvedValue(mockGame);
      mockProjectRepository.findById.mockResolvedValue(
        createProjectFixture({ id: mockGame.projectId, organizationId: 1 }),
      );
      mockMemberRepository.findByOrganizationAndUser.mockResolvedValue(
        createOrganizationMemberFixture(),
      );
      mockGameSessionRepository.findActiveByGameId.mockResolvedValue(quizSession);

      await expect(useCase.execute({ gameId: mockGame.id, hostId: 1 })).rejects.toThrow(
        GameErrorCode.GAME_ALREADY_HAS_ACTIVE_SESSION,
      );

      expect(mockGameSessionRepository.findActiveByHostId).not.toHaveBeenCalled();
      expect(mockGameSessionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw when host has paused sessions', async () => {
      const mockGame = createGameFixture();
      const pausedSession = createGameSessionFixture({
        gameId: 2,
        status: GameSessionStatus.PAUSED,
      });

      mockGameRepository.findById.mockResolvedValue(mockGame);
      mockProjectRepository.findById.mockResolvedValue(
        createProjectFixture({ id: mockGame.projectId, organizationId: 1 }),
      );
      mockMemberRepository.findByOrganizationAndUser.mockResolvedValue(
        createOrganizationMemberFixture(),
      );
      mockGameSessionRepository.findActiveByGameId.mockResolvedValue(null);
      mockGameSessionRepository.findActiveByHostId.mockResolvedValue([pausedSession]);

      await expect(useCase.execute({ gameId: mockGame.id, hostId: 1 })).rejects.toThrow(
        GameErrorCode.ACTIVE_SESSION_EXISTS,
      );

      expect(mockGameSessionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw when the host already has an active session for the game', async () => {
      const mockGame = createGameFixture();
      const existingSession = createGameSessionFixture({
        status: GameSessionStatus.ACTIVE,
      });

      mockGameRepository.findById.mockResolvedValue(mockGame);
      mockProjectRepository.findById.mockResolvedValue(
        createProjectFixture({ id: mockGame.projectId, organizationId: 1 }),
      );
      mockMemberRepository.findByOrganizationAndUser.mockResolvedValue(
        createOrganizationMemberFixture(),
      );
      mockGameSessionRepository.findActiveByGameId.mockResolvedValue(existingSession);

      await expect(useCase.execute({ gameId: mockGame.id, hostId: 1 })).rejects.toThrow(
        GameErrorCode.ACTIVE_SESSION_EXISTS,
      );

      expect(mockGameSessionRepository.findActiveByHostId).not.toHaveBeenCalled();
      expect(mockGameSessionRepository.create).not.toHaveBeenCalled();
    });

    it('should allow creating new session when previous session is ended', async () => {
      const mockGame = createGameFixture();
      const mockSession = createGameSessionFixture();

      mockGameRepository.findById.mockResolvedValue(mockGame);
      mockProjectRepository.findById.mockResolvedValue(
        createProjectFixture({ id: mockGame.projectId, organizationId: 1 }),
      );
      mockMemberRepository.findByOrganizationAndUser.mockResolvedValue(
        createOrganizationMemberFixture(),
      );
      mockGameSessionRepository.findActiveByGameId.mockResolvedValue(null);
      mockGameSessionRepository.findActiveByHostId.mockResolvedValue([]);
      mockGameSessionRepository.create.mockResolvedValue(mockSession);

      const result = await useCase.execute({ gameId: mockGame.id, hostId: 1 });

      expect(result.session).toBeDefined();
      expect(mockGameSessionRepository.create).toHaveBeenCalled();
    });

    it('should retry when generated PIN is already in use', async () => {
      const mockGame = createGameFixture();
      const mockSession = createGameSessionFixture();

      mockGameRepository.findById.mockResolvedValue(mockGame);
      mockProjectRepository.findById.mockResolvedValue(
        createProjectFixture({ id: mockGame.projectId, organizationId: 1 }),
      );
      mockMemberRepository.findByOrganizationAndUser.mockResolvedValue(
        createOrganizationMemberFixture(),
      );
      mockGameSessionRepository.findActiveByGameId.mockResolvedValue(null);
      mockGameSessionRepository.findActiveByHostId.mockResolvedValue([]);
      mockGameSessionRepository.create
        .mockRejectedValueOnce(new PinAlreadyInUseError())
        .mockResolvedValueOnce(mockSession);

      const result = await useCase.execute({ gameId: mockGame.id, hostId: 1 });

      expect(result.session).toBeDefined();
      expect(result.pin).toHaveLength(6);
      expect(mockGameSessionRepository.create).toHaveBeenCalledTimes(2);
    });
  });
});

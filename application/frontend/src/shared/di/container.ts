import { AuthHttpRepository } from "../../domains/auth/infrastructure/auth-http.repository";
import { QuizHttpRepository } from "../../domains/quiz/infrastructure/quiz-http.repository";
import { GameHttpRepository } from "../../domains/game/infrastructure/game-http.repository";
import { GameSocketAdapter } from "../../domains/game/infrastructure/game-socket.adapter";
import { LocalStorageAdapter } from "../infrastructure/local-storage.adapter";

// Auth Use Cases
import { LoginUseCase } from "../../application/auth/use-cases/login.use-case";
import { RegisterUseCase } from "../../application/auth/use-cases/register.use-case";
import { LogoutUseCase } from "../../application/auth/use-cases/logout.use-case";
import { RestoreSessionUseCase } from "../../application/auth/use-cases/restore-session.use-case";
import { GetProfileUseCase } from "../../application/auth/use-cases/get-profile.use-case";
import { UpdateProfileUseCase } from "../../application/auth/use-cases/update-profile.use-case";
import { RegenerateAvatarUseCase } from "../../application/auth/use-cases/regenerate-avatar.use-case";

// Quiz Use Cases
import { GetQuizzesUseCase } from "../../application/quiz/use-cases/get-quizzes.use-case";
import { GetQuestionsUseCase } from "../../application/quiz/use-cases/get-questions.use-case";
import { CreateQuizUseCase } from "../../application/quiz/use-cases/create-quiz.use-case";
import { AddQuestionUseCase } from "../../application/quiz/use-cases/add-question.use-case";

// Game Use Cases
import { LaunchQuizUseCase } from "../../application/game/use-cases/launch-quiz.use-case";
import { JoinGameUseCase } from "../../application/game/use-cases/join-game.use-case";
import { SubmitAnswerUseCase } from "../../application/game/use-cases/submit-answer.use-case";

/**
 * Dependency Injection Container
 * Manages all application dependencies
 * Following Dependency Injection Pattern and Inversion of Control
 */
export class DependencyContainer {
  // Infrastructure
  private readonly storage = new LocalStorageAdapter();
  private readonly authRepository = new AuthHttpRepository();
  private readonly quizRepository = new QuizHttpRepository();
  private readonly gameRepository = new GameHttpRepository();
  private readonly gameSocket = new GameSocketAdapter();

  // Auth Use Cases
  readonly loginUseCase = new LoginUseCase(this.authRepository, this.storage);
  readonly registerUseCase = new RegisterUseCase(this.authRepository);
  readonly logoutUseCase = new LogoutUseCase(this.storage);
  readonly restoreSessionUseCase = new RestoreSessionUseCase(this.storage);
  readonly getProfileUseCase = new GetProfileUseCase(
    this.authRepository,
    this.storage,
  );
  readonly updateProfileUseCase = new UpdateProfileUseCase(
    this.authRepository,
    this.storage,
  );
  readonly regenerateAvatarUseCase = new RegenerateAvatarUseCase(
    this.authRepository,
    this.storage,
  );

  // Quiz Use Cases
  readonly getQuizzesUseCase = new GetQuizzesUseCase(this.quizRepository);
  readonly getQuestionsUseCase = new GetQuestionsUseCase(this.quizRepository);
  readonly createQuizUseCase = new CreateQuizUseCase(this.quizRepository);
  readonly addQuestionUseCase = new AddQuestionUseCase(this.quizRepository);

  // Game Use Cases
  readonly launchQuizUseCase = new LaunchQuizUseCase(
    this.gameRepository,
    this.gameSocket,
  );
  readonly joinGameUseCase = new JoinGameUseCase(this.gameSocket);
  readonly submitAnswerUseCase = new SubmitAnswerUseCase(this.gameSocket);

  // Game Socket (exposed for hooks)
  readonly getGameSocket = () => this.gameSocket;
}

// Singleton instance
export const container = new DependencyContainer();

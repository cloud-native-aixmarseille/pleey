import { AuthHttpRepository } from "../../infrastructure/auth/auth-http.repository";
import { GameSocketAdapter } from "../../infrastructure/game/game-socket.adapter";
import { GameHttpRepository } from "../../infrastructure/game/game-http.repository";
import { OrganizationHttpRepository } from "../../infrastructure/organization/organization-http.repository";
import { QuizHttpRepository } from "../../infrastructure/quiz/quiz-http.repository";
import { LocalStorageAdapter } from "../../infrastructure/shared/storage/local-storage.adapter";

import { GetProfileUseCase } from "../../application/auth/use-cases/get-profile.use-case";
import { LoginUseCase } from "../../application/auth/use-cases/login.use-case";
import { LogoutUseCase } from "../../application/auth/use-cases/logout.use-case";
import { RegenerateAvatarUseCase } from "../../application/auth/use-cases/regenerate-avatar.use-case";
import { RegisterUseCase } from "../../application/auth/use-cases/register.use-case";
import { RestoreSessionUseCase } from "../../application/auth/use-cases/restore-session.use-case";
import { UpdateProfileUseCase } from "../../application/auth/use-cases/update-profile.use-case";
import { SubmitAnswerUseCase } from "../../application/game/use-cases/submit-answer.use-case";
import { JoinGameUseCase } from "../../application/game/use-cases/join-game.use-case";
import { LaunchQuizUseCase } from "../../application/game/use-cases/launch-quiz.use-case";
import { AddQuestionUseCase } from "../../application/quiz/use-cases/add-question.use-case";
import { CreateQuizUseCase } from "../../application/quiz/use-cases/create-quiz.use-case";
import { GetQuestionsUseCase } from "../../application/quiz/use-cases/get-questions.use-case";
import { GetQuizzesUseCase } from "../../application/quiz/use-cases/get-quizzes.use-case";
import { GameService } from "../../domains/game/game.service";

export class DependencyContainer {
  private readonly storage = new LocalStorageAdapter();
  readonly authRepository = new AuthHttpRepository();
  readonly organizationRepository = new OrganizationHttpRepository();
  readonly quizRepository = new QuizHttpRepository();
  readonly gameRepository = new GameHttpRepository();
  private readonly gameSocket = new GameSocketAdapter();

  readonly gameService = new GameService(this.gameRepository, this.gameSocket);

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

  readonly getQuizzesUseCase = new GetQuizzesUseCase(this.quizRepository);
  readonly getQuestionsUseCase = new GetQuestionsUseCase(this.quizRepository);
  readonly createQuizUseCase = new CreateQuizUseCase(this.quizRepository);
  readonly addQuestionUseCase = new AddQuestionUseCase(this.quizRepository);

  readonly launchQuizUseCase = new LaunchQuizUseCase(
    this.gameRepository,
    this.gameSocket,
  );
  readonly joinGameUseCase = new JoinGameUseCase(this.gameSocket);
  readonly submitAnswerUseCase = new SubmitAnswerUseCase(this.gameSocket);

  readonly getGameSocket = () => this.gameSocket;
}

export const container = new DependencyContainer();

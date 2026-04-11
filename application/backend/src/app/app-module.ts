import * as path from 'node:path';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { AcceptLanguageResolver, I18nJsonLoader, I18nModule, QueryResolver } from 'nestjs-i18n';
import type { UserId } from '../domain/identity/entities/user';
import { GameErrorHttpStatusService } from '../presentation/game/shared/error-handling/game-error-http-status.service';
import { GameErrorTranslationService } from '../presentation/game/shared/error-handling/game-error-translation.service';
import { PredictionErrorHttpStatusService } from '../presentation/game/types/prediction/shared/error-handling/prediction-error-http-status.service';
import { PredictionErrorTranslationService } from '../presentation/game/types/prediction/shared/error-handling/prediction-error-translation.service';
import { QuizErrorHttpStatusService } from '../presentation/game/types/quiz/shared/error-handling/quiz-error-http-status.service';
import { QuizErrorTranslationService } from '../presentation/game/types/quiz/shared/error-handling/quiz-error-translation.service';
import { IdentityErrorHttpStatusService } from '../presentation/identity/shared/error-handling/identity-error-http-status.service';
import { IdentityErrorTranslationService } from '../presentation/identity/shared/error-handling/identity-error-translation.service';
import { OrganizationErrorHttpStatusService } from '../presentation/organization/shared/error-handling/organization-error-http-status.service';
import { OrganizationErrorTranslationService } from '../presentation/organization/shared/error-handling/organization-error-translation.service';
import { ProjectErrorHttpStatusService } from '../presentation/project/shared/error-handling/project-error-http-status.service';
import { ProjectErrorTranslationService } from '../presentation/project/shared/error-handling/project-error-translation.service';
import { ErrorCodeHttpStatusService } from '../presentation/shared/error-handling/error-code-http-status.service';
import { ERROR_CODE_HTTP_STATUS_RESOLVERS } from '../presentation/shared/error-handling/error-code-http-status-resolvers.token';
import { ERROR_CODE_TRANSLATORS } from '../presentation/shared/error-handling/error-code-translators.token';
import { ErrorTranslationService } from '../presentation/shared/error-handling/error-translation-service';
import { AppConfigModule } from './config/app-config.module';
import { AppConfiguration } from './config/app-configuration';
import { AppEnvironment } from './config/app-environment';
import { GameModule } from './modules/game/game-module';
import { PredictionModule } from './modules/game/types/prediction-module';
import { QuizModule } from './modules/game/types/quiz-module';
import { HealthModule } from './modules/health/health-module';
import { IdentityModule } from './modules/identity/identity-module';
import { OrganizationModule } from './modules/organization/organization-module';

const appConfiguration = new AppConfiguration(new AppEnvironment());
const isProdBuild = appConfiguration.getServerConfig().isProduction;
const i18nDirectory = isProdBuild
  ? path.join(__dirname, '../i18n/')
  : path.join(process.cwd(), 'src/i18n/');
const jwtSecret = appConfiguration.getJwtSecret();
const jwtService = new JwtService();

type GraphqlWsUser = {
  id: UserId;
  username: string;
};

function parseAuthorizationHeader(connectionParams?: Record<string, unknown>): string | null {
  const authorizationValue = connectionParams?.authorization;

  if (typeof authorizationValue !== 'string') {
    return null;
  }

  const [scheme, token] = authorizationValue.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}

@Module({
  imports: [
    AppConfigModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: path.join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: !isProdBuild,
      subscriptions: {
        'graphql-ws': {
          onConnect: (context) => {
            const connectionParams =
              context.connectionParams && typeof context.connectionParams === 'object'
                ? (context.connectionParams as Record<string, unknown>)
                : undefined;

            const token = parseAuthorizationHeader(connectionParams);

            if (!token) {
              return true;
            }

            const payload = jwtService.verify<GraphqlWsUser>(token, {
              secret: jwtSecret,
            });

            const extra = context.extra;
            if (extra && typeof extra === 'object') {
              (extra as Record<string, unknown>).user = {
                id: payload.id,
                username: payload.username,
              };
            }

            return true;
          },
        },
      },
      context: ({ req, extra }: { req?: unknown; extra?: Record<string, unknown> }) => ({
        req,
        user: extra?.user ?? null,
      }),
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: i18nDirectory,
        watch: !isProdBuild,
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
    }),
    HealthModule,
    IdentityModule,
    OrganizationModule,
    QuizModule,
    GameModule,
    PredictionModule,
  ],
  controllers: [],
  providers: [
    IdentityErrorHttpStatusService,
    IdentityErrorTranslationService,
    GameErrorHttpStatusService,
    GameErrorTranslationService,
    OrganizationErrorHttpStatusService,
    OrganizationErrorTranslationService,
    PredictionErrorHttpStatusService,
    PredictionErrorTranslationService,
    ProjectErrorHttpStatusService,
    ProjectErrorTranslationService,
    QuizErrorHttpStatusService,
    QuizErrorTranslationService,
    {
      provide: ERROR_CODE_TRANSLATORS,
      useFactory: (
        identityErrorTranslationService: IdentityErrorTranslationService,
        gameErrorTranslationService: GameErrorTranslationService,
        organizationErrorTranslationService: OrganizationErrorTranslationService,
        predictionErrorTranslationService: PredictionErrorTranslationService,
        projectErrorTranslationService: ProjectErrorTranslationService,
        quizErrorTranslationService: QuizErrorTranslationService,
      ) => [
        identityErrorTranslationService,
        quizErrorTranslationService,
        gameErrorTranslationService,
        organizationErrorTranslationService,
        predictionErrorTranslationService,
        projectErrorTranslationService,
      ],
      inject: [
        IdentityErrorTranslationService,
        GameErrorTranslationService,
        OrganizationErrorTranslationService,
        PredictionErrorTranslationService,
        ProjectErrorTranslationService,
        QuizErrorTranslationService,
      ],
    },
    {
      provide: ERROR_CODE_HTTP_STATUS_RESOLVERS,
      useFactory: (
        identityErrorHttpStatusService: IdentityErrorHttpStatusService,
        gameErrorHttpStatusService: GameErrorHttpStatusService,
        organizationErrorHttpStatusService: OrganizationErrorHttpStatusService,
        predictionErrorHttpStatusService: PredictionErrorHttpStatusService,
        projectErrorHttpStatusService: ProjectErrorHttpStatusService,
        quizErrorHttpStatusService: QuizErrorHttpStatusService,
      ) => [
        identityErrorHttpStatusService,
        quizErrorHttpStatusService,
        gameErrorHttpStatusService,
        organizationErrorHttpStatusService,
        predictionErrorHttpStatusService,
        projectErrorHttpStatusService,
      ],
      inject: [
        IdentityErrorHttpStatusService,
        GameErrorHttpStatusService,
        OrganizationErrorHttpStatusService,
        PredictionErrorHttpStatusService,
        ProjectErrorHttpStatusService,
        QuizErrorHttpStatusService,
      ],
    },
    ErrorCodeHttpStatusService,
    ErrorTranslationService,
  ],
})
export class AppModule {}

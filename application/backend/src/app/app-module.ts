import * as path from 'node:path';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Inject, MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { GraphQLUpload, graphqlUploadExpress } from 'graphql-upload-minimal';
import { AcceptLanguageResolver, I18nJsonLoader, I18nModule, QueryResolver } from 'nestjs-i18n';
import { JwtSessionAuthenticator } from '../infrastructure/identity/services/jwt-session-authenticator';
import { GameErrorHttpStatusService } from '../presentation/game/shared/error-handling/game-error-http-status.service';
import { GameErrorTranslationService } from '../presentation/game/shared/error-handling/game-error-translation.service';
import { PredictionErrorHttpStatusService } from '../presentation/game/types/prediction/shared/error-handling/prediction-error-http-status.service';
import { PredictionErrorTranslationService } from '../presentation/game/types/prediction/shared/error-handling/prediction-error-translation.service';
import { QuizErrorHttpStatusService } from '../presentation/game/types/quiz/shared/error-handling/quiz-error-http-status.service';
import { QuizErrorTranslationService } from '../presentation/game/types/quiz/shared/error-handling/quiz-error-translation.service';
import { PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES_TOKEN } from '../presentation/game/types/shared/graphql/playable-content-upload.constants';
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
import { APP_SERVER_CONFIG, type AppServerConfig } from './config/app-server-config.token';
import { GameModule } from './modules/game/game-module';
import { PredictionModule } from './modules/game/types/prediction-module';
import { QuizModule } from './modules/game/types/quiz-module';
import { HealthModule } from './modules/health/health-module';
import { IdentityModule } from './modules/identity/identity-module';
import { OrganizationModule } from './modules/organization/organization-module';

function parseAuthorizationHeader(connectionParams?: Record<string, unknown>): string | null {
  const authorizationValue = connectionParams?.authorization;

  if (authorizationValue === undefined) return null;
  if (typeof authorizationValue !== 'string') throw new Error('Unauthorized');

  const [scheme, token, extra] = authorizationValue.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token || extra !== undefined) {
    throw new Error('Unauthorized');
  }

  return token;
}

function createI18nDirectory(serverConfig: AppServerConfig): string {
  return serverConfig.isProduction ? path.join(__dirname, '../i18n/') : path.join(process.cwd(), 'src/i18n/');
}

@Module({
  imports: [
    AppConfigModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [AppConfigModule, IdentityModule],
      useFactory: (serverConfig: AppServerConfig, sessions: JwtSessionAuthenticator) => {
        return {
          autoSchemaFile: serverConfig.isProduction ? true : path.join(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
          graphiql: !serverConfig.isProduction,
          resolvers: {
            Upload: GraphQLUpload,
          },
          subscriptions: {
            'graphql-ws': {
              onConnect: async (context) => {
                const connectionParams =
                  context.connectionParams && typeof context.connectionParams === 'object'
                    ? (context.connectionParams as Record<string, unknown>)
                    : undefined;

                const token = parseAuthorizationHeader(connectionParams);

                if (!token) {
                  return true;
                }

                const payload = await sessions.authenticate(token);
                const extra = context.extra;
                if (extra && typeof extra === 'object') {
                  (extra as Record<string, unknown>).user = payload;
                  (extra as Record<string, unknown>).authorization = `Bearer ${token}`;
                }

                return true;
              },
            },
          },
          context: ({ req, extra }: { req?: unknown; extra?: Record<string, unknown> }) => ({
            req: req ?? { headers: { authorization: extra?.authorization } },
            user: extra?.user ?? null,
          }),
        };
      },
      inject: [APP_SERVER_CONFIG, JwtSessionAuthenticator],
    }),
    I18nModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (serverConfig: AppServerConfig) => ({
        fallbackLanguage: 'en',
        loader: I18nJsonLoader,
        loaderOptions: {
          path: createI18nDirectory(serverConfig),
          watch: serverConfig.isDevelopment,
        },
        resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
      }),
      inject: [APP_SERVER_CONFIG],
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
export class AppModule implements NestModule {
  constructor(
    @Inject(PLAYABLE_CONTENT_IMPORT_MAX_FILE_SIZE_BYTES_TOKEN)
    private readonly playableContentImportMaxFileSizeBytes: number,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        graphqlUploadExpress({
          maxFileSize: this.playableContentImportMaxFileSizeBytes,
          maxFiles: 1,
        }),
      )
      .forRoutes('graphql');
  }
}

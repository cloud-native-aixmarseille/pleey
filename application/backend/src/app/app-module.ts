import * as path from 'node:path';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { AcceptLanguageResolver, I18nJsonLoader, I18nModule, QueryResolver } from 'nestjs-i18n';
import { ErrorTranslationService } from '../presentation/shared/error-handling/error-translation-service';
import { AppConfigModule } from './config/app-config.module';
import { AppConfiguration } from './config/app-configuration';
import { AppEnvironment } from './config/app-environment';
import { AuthModule } from './modules/auth/auth-module';
import { GameModule } from './modules/game/game-module';
import { HealthModule } from './modules/health/health-module';
import { OrganizationModule } from './modules/organization/organization-module';
import { PredictionModule } from './modules/prediction/prediction-module';
import { QuizModule } from './modules/quiz/quiz-module';

const appConfiguration = new AppConfiguration(new AppEnvironment());
const isProdBuild = appConfiguration.getServerConfig().isProduction;
const i18nDirectory = isProdBuild
  ? path.join(__dirname, '../i18n/')
  : path.join(process.cwd(), 'src/i18n/');
const jwtSecret = appConfiguration.getJwtSecret();
const jwtService = new JwtService();

type GraphqlWsUser = {
  id: number;
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
    AuthModule,
    OrganizationModule,
    QuizModule,
    GameModule,
    PredictionModule,
  ],
  controllers: [],
  providers: [ErrorTranslationService],
})
export class AppModule {}

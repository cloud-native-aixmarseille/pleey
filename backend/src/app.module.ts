import { Module } from '@nestjs/common';
import {
  AcceptLanguageResolver,
  I18nJsonLoader,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import * as path from 'node:path';
import { AuthModule } from './infrastructure/auth';
import { GameModule } from './infrastructure/game';
import { QuizModule } from './infrastructure/quiz/quiz.module';
import { HealthModule } from './infrastructure/health';
import { OrganizationModule } from './infrastructure/organization';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: path.join(__dirname, '../i18n/'),
        watch: process.env.NODE_ENV === 'development',
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    HealthModule,
    AuthModule,
    OrganizationModule,
    QuizModule,
    GameModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

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

const isProdBuild = process.env.NODE_ENV === 'production';
const i18nDirectory = isProdBuild
  ? path.join(__dirname, '../i18n/')
  : path.join(process.cwd(), 'src/i18n/');

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: i18nDirectory,
        watch: !isProdBuild,
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

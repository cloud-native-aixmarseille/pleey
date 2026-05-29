import { inject, injectable } from 'inversify';
import {
  type TranslationPort,
  TranslationPortToken,
} from '../../../../shared/contracts/translation.port';
import type {
  PlayableContentImportExampleFile,
  PlayableContentImportExampleFormat,
} from '../../shared/contracts/playable-content-import.gateway';
import { PlayableContentImportExampleFormat as ImportExampleFormat } from '../../shared/contracts/playable-content-import.gateway';

@injectable()
export class QuizQuestionImportExampleFactory {
  constructor(
    @inject(TranslationPortToken)
    private readonly translationPort: TranslationPort,
  ) {}

  listFormats(): readonly PlayableContentImportExampleFormat[] {
    return [
      ImportExampleFormat.JSON,
      ImportExampleFormat.CSV,
      ImportExampleFormat.MARKDOWN,
      ImportExampleFormat.PLAINTEXT,
    ];
  }

  create(format: PlayableContentImportExampleFormat): PlayableContentImportExampleFile {
    switch (format) {
      case ImportExampleFormat.JSON:
        return {
          content: JSON.stringify(
            {
              questions: [
                {
                  questionText: this.translationPort.t(
                    'dashboard.games.import.examples.quiz.questionSky',
                  ),
                  type: 'multiple',
                  timeLimit: 20,
                  points: 1000,
                  answers: [
                    {
                      text: this.translationPort.t('dashboard.games.import.examples.options.blue'),
                      isCorrect: true,
                    },
                    {
                      text: this.translationPort.t('dashboard.games.import.examples.options.green'),
                      isCorrect: false,
                    },
                    {
                      text: this.translationPort.t('dashboard.games.import.examples.options.red'),
                      isCorrect: false,
                    },
                  ],
                },
                {
                  questionText: this.translationPort.t(
                    'dashboard.games.import.examples.quiz.questionEarthRound',
                  ),
                  type: 'truefalse',
                  timeLimit: 10,
                  points: 500,
                  answers: [
                    {
                      text: this.translationPort.t('dashboard.games.import.examples.options.true'),
                      isCorrect: true,
                    },
                    {
                      text: this.translationPort.t('dashboard.games.import.examples.options.false'),
                      isCorrect: false,
                    },
                  ],
                },
              ],
            },
            null,
            2,
          ),
          fileName: 'quiz-import-example.json',
          mimeType: 'application/json',
        };
      case ImportExampleFormat.CSV:
        return {
          content: [
            'question,type,correct,timeLimit,points,option1,option2,option3,option4',
            `${this.translationPort.t('dashboard.games.import.examples.quiz.questionSky')},multiple,1,20,1000,${this.translationPort.t('dashboard.games.import.examples.options.blue')},${this.translationPort.t('dashboard.games.import.examples.options.green')},${this.translationPort.t('dashboard.games.import.examples.options.red')},`,
            `${this.translationPort.t('dashboard.games.import.examples.quiz.questionEarthRound')},truefalse,true,10,500,${this.translationPort.t('dashboard.games.import.examples.options.true')},${this.translationPort.t('dashboard.games.import.examples.options.false')},,`,
          ].join('\n'),
          fileName: 'quiz-import-example.csv',
          mimeType: 'text/csv',
        };
      case ImportExampleFormat.MARKDOWN:
        return {
          content: [
            `# ${this.translationPort.t('dashboard.games.import.examples.quiz.title')}`,
            '',
            `## ${this.translationPort.t('dashboard.games.import.examples.quiz.questionSky')}`,
            'Time: 20',
            'Points: 1000',
            `- [x] ${this.translationPort.t('dashboard.games.import.examples.options.blue')}`,
            `- [ ] ${this.translationPort.t('dashboard.games.import.examples.options.green')}`,
            `- [ ] ${this.translationPort.t('dashboard.games.import.examples.options.red')}`,
            '',
            `## ${this.translationPort.t('dashboard.games.import.examples.quiz.questionEarthRound')}`,
            'Type: truefalse',
            'Time: 10',
            'Points: 500',
            `- [x] ${this.translationPort.t('dashboard.games.import.examples.options.true')}`,
            `- [ ] ${this.translationPort.t('dashboard.games.import.examples.options.false')}`,
          ].join('\n'),
          fileName: 'quiz-import-example.md',
          mimeType: 'text/markdown',
        };
      case ImportExampleFormat.PLAINTEXT:
        return {
          content: [
            `Question: ${this.translationPort.t('dashboard.games.import.examples.quiz.questionSky')}`,
            'Time: 20',
            'Points: 1000',
            `- [x] ${this.translationPort.t('dashboard.games.import.examples.options.blue')}`,
            `- [ ] ${this.translationPort.t('dashboard.games.import.examples.options.green')}`,
            `- [ ] ${this.translationPort.t('dashboard.games.import.examples.options.red')}`,
            '',
            `Question: ${this.translationPort.t('dashboard.games.import.examples.quiz.questionEarthRound')}`,
            'Type: truefalse',
            'Time: 10',
            'Points: 500',
            `- [x] ${this.translationPort.t('dashboard.games.import.examples.options.true')}`,
            `- [ ] ${this.translationPort.t('dashboard.games.import.examples.options.false')}`,
          ].join('\n'),
          fileName: 'quiz-import-example.txt',
          mimeType: 'text/plain',
        };
    }
  }
}

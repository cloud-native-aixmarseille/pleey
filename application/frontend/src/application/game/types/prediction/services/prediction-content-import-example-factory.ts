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
export class PredictionContentImportExampleFactory {
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
              prompts: [
                {
                  promptText: this.translationPort.t(
                    'dashboard.games.import.examples.prediction.promptFirstScore',
                  ),
                  timeLimit: 25,
                  points: 500,
                  options: [
                    {
                      text: this.translationPort.t('dashboard.games.import.examples.options.home'),
                      isCorrect: true,
                    },
                    {
                      text: this.translationPort.t('dashboard.games.import.examples.options.away'),
                      isCorrect: false,
                    },
                    {
                      text: this.translationPort.t(
                        'dashboard.games.import.examples.options.noGoal',
                      ),
                      isCorrect: false,
                    },
                  ],
                },
                {
                  promptText: this.translationPort.t(
                    'dashboard.games.import.examples.prediction.promptLaunchOnTime',
                  ),
                  type: 'truefalse',
                  timeLimit: 15,
                  points: 300,
                  options: [
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
          fileName: 'prediction-import-example.json',
          mimeType: 'application/json',
        };
      case ImportExampleFormat.CSV:
        return {
          content: [
            'prompt,correct,timeLimit,points,option1,option2,option3,option4',
            `${this.translationPort.t('dashboard.games.import.examples.prediction.promptFirstScore')},1,25,500,${this.translationPort.t('dashboard.games.import.examples.options.home')},${this.translationPort.t('dashboard.games.import.examples.options.away')},${this.translationPort.t('dashboard.games.import.examples.options.noGoal')},`,
            `${this.translationPort.t('dashboard.games.import.examples.prediction.promptLaunchOnTime')},true,15,300,${this.translationPort.t('dashboard.games.import.examples.options.true')},${this.translationPort.t('dashboard.games.import.examples.options.false')},,`,
          ].join('\n'),
          fileName: 'prediction-import-example.csv',
          mimeType: 'text/csv',
        };
      case ImportExampleFormat.MARKDOWN:
        return {
          content: [
            `# ${this.translationPort.t('dashboard.games.import.examples.prediction.title')}`,
            '',
            `## ${this.translationPort.t('dashboard.games.import.examples.prediction.promptFirstScore')}`,
            'Time: 25',
            'Points: 500',
            `- [x] ${this.translationPort.t('dashboard.games.import.examples.options.home')}`,
            `- [ ] ${this.translationPort.t('dashboard.games.import.examples.options.away')}`,
            `- [ ] ${this.translationPort.t('dashboard.games.import.examples.options.noGoal')}`,
            '',
            `## ${this.translationPort.t('dashboard.games.import.examples.prediction.promptLaunchOnTime')}`,
            'Type: truefalse',
            'Time: 15',
            'Points: 300',
            `- [x] ${this.translationPort.t('dashboard.games.import.examples.options.true')}`,
            `- [ ] ${this.translationPort.t('dashboard.games.import.examples.options.false')}`,
          ].join('\n'),
          fileName: 'prediction-import-example.md',
          mimeType: 'text/markdown',
        };
      case ImportExampleFormat.PLAINTEXT:
        return {
          content: [
            `Prompt: ${this.translationPort.t('dashboard.games.import.examples.prediction.promptFirstScore')}`,
            'Time: 25',
            'Points: 500',
            `- [x] ${this.translationPort.t('dashboard.games.import.examples.options.home')}`,
            `- [ ] ${this.translationPort.t('dashboard.games.import.examples.options.away')}`,
            `- [ ] ${this.translationPort.t('dashboard.games.import.examples.options.noGoal')}`,
            '',
            `Prompt: ${this.translationPort.t('dashboard.games.import.examples.prediction.promptLaunchOnTime')}`,
            'Type: truefalse',
            'Time: 15',
            'Points: 300',
            `- [x] ${this.translationPort.t('dashboard.games.import.examples.options.true')}`,
            `- [ ] ${this.translationPort.t('dashboard.games.import.examples.options.false')}`,
          ].join('\n'),
          fileName: 'prediction-import-example.txt',
          mimeType: 'text/plain',
        };
    }
  }
}

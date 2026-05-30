import { injectable } from 'inversify';
import type {
  PlayableContentImportExampleFile,
  PlayableContentImportExampleFormat,
} from '../../shared/contracts/playable-content-import.gateway';

@injectable()
export class QuizQuestionImportExampleFactory {
  listFormats(): readonly PlayableContentImportExampleFormat[] {
    return ['json', 'csv', 'markdown', 'plaintext'];
  }

  create(format: PlayableContentImportExampleFormat): PlayableContentImportExampleFile {
    switch (format) {
      case 'json':
        return {
          content: JSON.stringify(
            {
              questions: [
                {
                  questionText: 'What color is the sky on a clear day?',
                  type: 'multiple',
                  timeLimit: 20,
                  points: 1000,
                  answers: [
                    { text: 'Blue', isCorrect: true },
                    { text: 'Green', isCorrect: false },
                    { text: 'Red', isCorrect: false },
                  ],
                },
                {
                  questionText: 'The Earth is round.',
                  type: 'truefalse',
                  timeLimit: 10,
                  points: 500,
                  answers: [
                    { text: 'True', isCorrect: true },
                    { text: 'False', isCorrect: false },
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
      case 'csv':
        return {
          content: [
            'question,type,correct,timeLimit,points,option1,option2,option3,option4',
            'What color is the sky on a clear day?,multiple,1,20,1000,Blue,Green,Red,',
            'The Earth is round.,truefalse,true,10,500,True,False,,',
          ].join('\n'),
          fileName: 'quiz-import-example.csv',
          mimeType: 'text/csv',
        };
      case 'markdown':
        return {
          content: [
            '# Quiz import example',
            '',
            '## What color is the sky on a clear day?',
            'Time: 20',
            'Points: 1000',
            '- [x] Blue',
            '- [ ] Green',
            '- [ ] Red',
            '',
            '## The Earth is round.',
            'Type: truefalse',
            'Time: 10',
            'Points: 500',
            '- [x] True',
            '- [ ] False',
          ].join('\n'),
          fileName: 'quiz-import-example.md',
          mimeType: 'text/markdown',
        };
      case 'plaintext':
        return {
          content: [
            'Question: What color is the sky on a clear day?',
            'Time: 20',
            'Points: 1000',
            '- [x] Blue',
            '- [ ] Green',
            '- [ ] Red',
            '',
            'Question: The Earth is round.',
            'Type: truefalse',
            'Time: 10',
            'Points: 500',
            '- [x] True',
            '- [ ] False',
          ].join('\n'),
          fileName: 'quiz-import-example.txt',
          mimeType: 'text/plain',
        };
    }
  }
}

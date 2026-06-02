import { describe, expect, it } from 'vitest';
import { CsvPlayableContentImportFormatParser } from './csv-playable-content-import-format-parser';
import { PlayableContentImportParserErrorCode } from './import-parser.error';
import { PlayableContentImportSource } from './import-source';
import { JsonPlayableContentImportFormatParser } from './json-playable-content-import-format-parser';
import { MarkdownPlayableContentImportFormatParser } from './markdown-playable-content-import-format-parser';
import { PlaintextPlayableContentImportFormatParser } from './plaintext-playable-content-import-format-parser';
import { PlayableContentImportParser } from './playable-content-import-parser';
import { PlayableContentImportParserContainer } from './playable-content-import-parser-container';

class TestPlayableContentImportSource extends PlayableContentImportSource {
  readAllCalls = 0;
  readLinesCalls = 0;

  constructor(
    readonly fileName: string,
    private readonly content: string,
  ) {
    super();
  }

  async readAll(): Promise<string> {
    this.readAllCalls += 1;

    return this.content;
  }

  async *readLines(): AsyncIterable<string> {
    this.readLinesCalls += 1;

    for (const line of this.content.split(/\r?\n/u)) {
      yield line;
    }
  }
}

describe('PlayableContentImportParser', () => {
  const parser = new PlayableContentImportParser(
    new PlayableContentImportParserContainer(
      new CsvPlayableContentImportFormatParser(),
      new JsonPlayableContentImportFormatParser(),
      new MarkdownPlayableContentImportFormatParser(),
      new PlaintextPlayableContentImportFormatParser(),
    ),
  );

  it.each([
    [
      'quiz-import.json',
      JSON.stringify({
        questions: [
          {
            questionText: 'What color is the sky?',
            type: 'multiple',
            timeLimit: 20,
            points: 1000,
            answers: [
              { text: 'Blue', isCorrect: true },
              { text: 'Green', isCorrect: false },
            ],
          },
        ],
      }),
      { readAllCalls: 1, readLinesCalls: 0 },
    ],
    [
      'prediction-import.csv',
      [
        'prompt,correct,timeLimit,points,option1,option2,option3',
        'Who wins?,1,25,500,Home,Away,Draw',
      ].join('\n'),
      { readAllCalls: 0, readLinesCalls: 1 },
    ],
    [
      'quiz-import.md',
      [
        '# Import example',
        '',
        '## The Earth is round.',
        'Type: truefalse',
        'Time: 10',
        'Points: 300',
        '- [x] True',
        '- [ ] False',
      ].join('\n'),
      { readAllCalls: 0, readLinesCalls: 1 },
    ],
    [
      'prediction-import.txt',
      [
        'Prompt: Which team scores first?',
        'Time: 30',
        'Points: 250',
        '- [x] Home',
        '- [ ] Away',
      ].join('\n'),
      { readAllCalls: 0, readLinesCalls: 1 },
    ],
  ])('parses supported import formats from %s', async (fileName, content, expectedConsumption) => {
    const source = new TestPlayableContentImportSource(fileName, content);
    const result = await parser.parse(source);

    expect(result).toHaveLength(1);
    expect(result[0]?.text.length).toBeGreaterThan(0);
    expect(result[0]?.options.length).toBeGreaterThanOrEqual(2);
    expect(source.readAllCalls).toBe(expectedConsumption.readAllCalls);
    expect(source.readLinesCalls).toBe(expectedConsumption.readLinesCalls);
  });

  it('falls back to buffered format detection for extensionless imports', async () => {
    const source = new TestPlayableContentImportSource(
      'prediction-import',
      [
        'Prompt: Which team scores first?',
        'Time: 30',
        'Points: 250',
        '- [x] Home',
        '- [ ] Away',
      ].join('\n'),
    );

    const result = await parser.parse(source);

    expect(result).toHaveLength(1);
    expect(source.readAllCalls).toBe(1);
    expect(source.readLinesCalls).toBe(0);
  });

  it('rejects unsupported file extensions', async () => {
    await expect(
      parser.parse(new TestPlayableContentImportSource('quiz-import.docx', 'Question: Example')),
    ).rejects.toThrow(PlayableContentImportParserErrorCode.UNSUPPORTED_FORMAT);
  });
});

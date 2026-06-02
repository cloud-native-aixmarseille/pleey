import { Injectable } from '@nestjs/common';
import { CsvPlayableContentImportFormatParser } from './csv-playable-content-import-format-parser';
import type { PlayableContentImportFormatParser } from './import-format-parser';
import { PlayableContentImportParserErrorCode } from './import-parser.error';
import type { RawImportItem } from './import-parser.types';
import { PlayableContentImportSource } from './import-source';
import { JsonPlayableContentImportFormatParser } from './json-playable-content-import-format-parser';
import { MarkdownPlayableContentImportFormatParser } from './markdown-playable-content-import-format-parser';
import { PlaintextPlayableContentImportFormatParser } from './plaintext-playable-content-import-format-parser';

function createBufferedPlayableContentImportSource(
  fileName: string,
  content: string,
): PlayableContentImportSource {
  return {
    fileName,
    async readAll(): Promise<string> {
      return content;
    },
    async *readLines(): AsyncIterable<string> {
      for (const line of content.split(/\r?\n/u)) {
        yield line;
      }
    },
  };
}

@Injectable()
export class PlayableContentImportParserContainer {
  private readonly parsers: readonly PlayableContentImportFormatParser[];

  constructor(
    csvParser: CsvPlayableContentImportFormatParser,
    jsonParser: JsonPlayableContentImportFormatParser,
    markdownParser: MarkdownPlayableContentImportFormatParser,
    plaintextParser: PlaintextPlayableContentImportFormatParser,
  ) {
    this.parsers = [csvParser, jsonParser, markdownParser, plaintextParser];
  }

  async parse(source: PlayableContentImportSource): Promise<readonly RawImportItem[]> {
    const normalizedFileName = source.fileName.toLowerCase();
    const hasFileExtension = normalizedFileName.includes('.');
    const parseSource = hasFileExtension
      ? source
      : createBufferedPlayableContentImportSource(source.fileName, await source.readAll());
    const parser = await this.resolveParser(parseSource);

    if (!parser) {
      throw new Error(PlayableContentImportParserErrorCode.UNSUPPORTED_FORMAT);
    }

    return parser.parse(parseSource);
  }

  private async resolveParser(
    source: PlayableContentImportSource,
  ): Promise<PlayableContentImportFormatParser | null> {
    for (const parser of this.parsers) {
      if (await parser.canParse(source)) {
        return parser;
      }
    }

    return null;
  }
}

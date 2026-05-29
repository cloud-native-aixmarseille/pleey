import { CsvPlayableContentImportFormatParser } from './csv-import-parser';
import { PlayableContentImportParser } from './import-parser';
import { JsonPlayableContentImportFormatParser } from './json-import-parser';
import { MarkdownPlayableContentImportFormatParser } from './markdown-import-parser';
import { PlaintextPlayableContentImportFormatParser } from './plaintext-import-parser';
import { PlayableContentImportParserContainer } from './playable-content-import-parser-container';

export const playableContentImportProviders = [
  CsvPlayableContentImportFormatParser,
  JsonPlayableContentImportFormatParser,
  MarkdownPlayableContentImportFormatParser,
  PlaintextPlayableContentImportFormatParser,
  PlayableContentImportParserContainer,
  PlayableContentImportParser,
] as const;

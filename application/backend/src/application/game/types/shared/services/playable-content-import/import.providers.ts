import { CsvPlayableContentImportFormatParser } from './csv-playable-content-import-format-parser';
import { JsonPlayableContentImportFormatParser } from './json-playable-content-import-format-parser';
import { MarkdownPlayableContentImportFormatParser } from './markdown-playable-content-import-format-parser';
import { PlaintextPlayableContentImportFormatParser } from './plaintext-playable-content-import-format-parser';
import { PlayableContentImportParser } from './playable-content-import-parser';
import { PlayableContentImportParserContainer } from './playable-content-import-parser-container';

export const playableContentImportProviders = [
  CsvPlayableContentImportFormatParser,
  JsonPlayableContentImportFormatParser,
  MarkdownPlayableContentImportFormatParser,
  PlaintextPlayableContentImportFormatParser,
  PlayableContentImportParserContainer,
  PlayableContentImportParser,
] as const;

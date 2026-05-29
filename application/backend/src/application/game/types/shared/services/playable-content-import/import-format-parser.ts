import type { PlayableImportFormat, RawImportItem } from './import-parser.types';
import type { PlayableContentImportSource } from './import-source';

export interface PlayableContentImportFormatParser {
  readonly format: PlayableImportFormat;
  canParse(source: PlayableContentImportSource): Promise<boolean>;
  parse(source: PlayableContentImportSource): Promise<readonly RawImportItem[]>;
}

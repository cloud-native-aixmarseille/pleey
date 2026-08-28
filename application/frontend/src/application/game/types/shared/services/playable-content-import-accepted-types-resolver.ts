import { injectable } from 'inversify';
import { PlayableContentImportExampleFormat } from '../ports/playable-content-import-example-provider.port';

const playableContentImportAcceptedTypesByFormat: Readonly<
  Record<PlayableContentImportExampleFormat, readonly string[]>
> = {
  [PlayableContentImportExampleFormat.CSV]: ['.csv', 'text/csv'],
  [PlayableContentImportExampleFormat.JSON]: ['.json', 'application/json'],
  [PlayableContentImportExampleFormat.MARKDOWN]: ['.md', '.markdown', 'text/markdown'],
  [PlayableContentImportExampleFormat.PLAINTEXT]: ['.txt', 'text/plain'],
};

@injectable()
export class PlayableContentImportAcceptedTypesResolver {
  resolve(formats: readonly PlayableContentImportExampleFormat[]): string {
    return Array.from(
      new Set(formats.flatMap((format) => playableContentImportAcceptedTypesByFormat[format] ?? [])),
    ).join(',');
  }
}

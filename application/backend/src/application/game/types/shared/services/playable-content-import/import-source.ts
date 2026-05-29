export abstract class PlayableContentImportSource {
  abstract readonly fileName: string;

  abstract readAll(): Promise<string>;

  abstract readLines(): AsyncIterable<string>;
}

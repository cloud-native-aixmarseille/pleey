export interface ErrorCodeTranslationPort {
  canTranslate(code: string): boolean;
  translate(code: string): Promise<string>;
}

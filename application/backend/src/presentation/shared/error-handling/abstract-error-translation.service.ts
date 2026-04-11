import { Inject } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import type { ErrorCodeTranslationPort } from './error-code-translation.port';

export abstract class AbstractErrorTranslationService<TErrorCode extends string>
  implements ErrorCodeTranslationPort
{
  private readonly errorCodes: ReadonlySet<TErrorCode>;

  protected constructor(
    @Inject(I18nService) protected readonly i18n: I18nService,
    errorCodes: readonly TErrorCode[],
    private readonly translationKeys: Readonly<Record<TErrorCode, string>>,
  ) {
    this.errorCodes = new Set(errorCodes);
  }

  canTranslate(code: string): boolean {
    return this.errorCodes.has(code as TErrorCode);
  }

  translate(code: string): Promise<string> {
    return this.i18n.translate(this.translationKeys[code as TErrorCode]);
  }
}

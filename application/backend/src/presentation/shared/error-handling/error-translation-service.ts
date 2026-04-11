import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import type { ErrorCodeTranslationPort } from './error-code-translation.port';
import { ERROR_CODE_TRANSLATORS } from './error-code-translators.token';

@Injectable()
export class ErrorTranslationService {
  constructor(
    @Inject(I18nService) private readonly i18n: I18nService,
    @Inject(ERROR_CODE_TRANSLATORS)
    private readonly translators: readonly ErrorCodeTranslationPort[],
  ) {}

  async translateErrorCode(code: string): Promise<string> {
    for (const translator of this.translators) {
      if (translator.canTranslate(code)) {
        return translator.translate(code);
      }
    }

    return this.translateUnknownError(code);
  }

  async translateUnknownError(code: string | null = null): Promise<string> {
    const resolvedCode = code ?? 'UNKNOWN_ERROR';
    return this.i18n.translate('common.errors.unknownError', {
      args: { code: resolvedCode },
    });
  }
}

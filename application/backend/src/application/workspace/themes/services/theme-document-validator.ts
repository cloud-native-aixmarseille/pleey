import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import type { ThemeDocument } from '../../../../domain/theme/entities/theme-document';
import { ThemeError, ThemeErrorCode } from '../../../../domain/theme/errors/theme-error';
import { ThemeDocumentNormalizer } from '../../../../domain/theme/services/theme-document-normalizer';

const envelope = z.object({
  schemaVersion: z.literal(1),
  baseThemeId: z.string().max(40),
  name: z.string().trim().min(1).max(80),
  overrides: z.record(z.string(), z.unknown()).optional(),
});
@Injectable()
export class ThemeDocumentValidator {
  constructor(@Inject(ThemeDocumentNormalizer) private readonly normalizer: ThemeDocumentNormalizer) {}
  parse(value: unknown): ThemeDocument {
    const parsed = envelope.safeParse(value);
    if (!parsed.success || JSON.stringify(parsed.data).length > 16384)
      throw new ThemeError(ThemeErrorCode.INVALID_DOCUMENT, { reason: 'invalidEnvelope' });
    return this.normalizer.normalize(parsed.data);
  }
}

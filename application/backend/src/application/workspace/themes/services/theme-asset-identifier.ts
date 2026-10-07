import { Injectable } from '@nestjs/common';
import type { ThemeAssetId } from '../../../../domain/theme/entities/managed-theme';
import { UuidV7IdentifierParser } from '../../../shared/services/identifier-parser';
@Injectable()
export class ThemeAssetIdentifier extends UuidV7IdentifierParser<ThemeAssetId> {
  constructor() {
    super('ThemeAssetId');
  }
}

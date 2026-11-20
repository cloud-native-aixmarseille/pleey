import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import {
  ORGANIZATION_ERROR_DEFINITIONS,
  OrganizationErrorCode,
} from '../../../../domain/organization/enums/organization-error-code.enum';
import { AbstractErrorTranslationService } from '../../../shared/error-handling/abstract-error-translation.service';

const ORGANIZATION_ERROR_CODES = Object.values(OrganizationErrorCode) as OrganizationErrorCode[];

const ORGANIZATION_ERROR_TRANSLATION_KEYS: Record<OrganizationErrorCode, string> = Object.fromEntries(
  ORGANIZATION_ERROR_CODES.map((code) => [code, ORGANIZATION_ERROR_DEFINITIONS[code].messageKey]),
) as Record<OrganizationErrorCode, string>;

@Injectable()
export class OrganizationErrorTranslationService extends AbstractErrorTranslationService<OrganizationErrorCode> {
  constructor(@Inject(I18nService) i18n: I18nService) {
    super(i18n, ORGANIZATION_ERROR_CODES, ORGANIZATION_ERROR_TRANSLATION_KEYS);
  }
}

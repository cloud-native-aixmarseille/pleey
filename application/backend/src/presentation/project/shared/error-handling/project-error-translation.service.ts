import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PROJECT_ERROR_DEFINITIONS, ProjectErrorCode } from '../../../../domain/project/enums/project-error-code.enum';
import { AbstractErrorTranslationService } from '../../../shared/error-handling/abstract-error-translation.service';

const PROJECT_ERROR_CODES = Object.values(ProjectErrorCode) as ProjectErrorCode[];

const PROJECT_ERROR_TRANSLATION_KEYS: Record<ProjectErrorCode, string> = Object.fromEntries(
  PROJECT_ERROR_CODES.map((code) => [code, PROJECT_ERROR_DEFINITIONS[code].messageKey]),
) as Record<ProjectErrorCode, string>;

@Injectable()
export class ProjectErrorTranslationService extends AbstractErrorTranslationService<ProjectErrorCode> {
  constructor(@Inject(I18nService) i18n: I18nService) {
    super(i18n, PROJECT_ERROR_CODES, PROJECT_ERROR_TRANSLATION_KEYS);
  }
}

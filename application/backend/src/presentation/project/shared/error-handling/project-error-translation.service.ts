import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ProjectErrorCode } from '../../../../domain/project/enums/project-error-code.enum';
import { AbstractErrorTranslationService } from '../../../shared/error-handling/abstract-error-translation.service';

const PROJECT_ERROR_CODES = Object.values(ProjectErrorCode) as ProjectErrorCode[];

const PROJECT_ERROR_TRANSLATION_KEYS: Record<ProjectErrorCode, string> = {
  [ProjectErrorCode.CANNOT_DELETE_LAST_PROJECT]: 'project.errors.cannotDeleteLastProject',
  [ProjectErrorCode.PROJECT_MIGRATION_TARGET_INVALID]: 'project.errors.migrationTargetInvalid',
  [ProjectErrorCode.PROJECT_MIGRATION_TARGET_NOT_FOUND]: 'project.errors.migrationTargetNotFound',
  [ProjectErrorCode.PROJECT_MIGRATION_TARGET_REQUIRED]: 'project.errors.migrationTargetRequired',
  [ProjectErrorCode.PROJECT_NOT_FOUND]: 'project.errors.projectNotFound',
};

@Injectable()
export class ProjectErrorTranslationService extends AbstractErrorTranslationService<ProjectErrorCode> {
  constructor(@Inject(I18nService) i18n: I18nService) {
    super(i18n, PROJECT_ERROR_CODES, PROJECT_ERROR_TRANSLATION_KEYS);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { AbstractErrorTranslationService } from '../../../shared/error-handling/abstract-error-translation.service';

const ORGANIZATION_ERROR_CODES = Object.values(OrganizationErrorCode) as OrganizationErrorCode[];

const ORGANIZATION_ERROR_TRANSLATION_KEYS: Record<OrganizationErrorCode, string> = {
  [OrganizationErrorCode.ORGANIZATION_NOT_FOUND]: 'organization.errors.organizationNotFound',
  [OrganizationErrorCode.ORGANIZATION_NAME_ALREADY_EXISTS]:
    'organization.errors.organizationNameAlreadyExists',
  [OrganizationErrorCode.MEMBER_NOT_FOUND]: 'organization.errors.memberNotFound',
  [OrganizationErrorCode.MEMBER_ALREADY_EXISTS]: 'organization.errors.memberAlreadyExists',
  [OrganizationErrorCode.INSUFFICIENT_PERMISSIONS]: 'organization.errors.insufficientPermissions',
  [OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER]: 'organization.errors.cannotRemoveLastOwner',
  [OrganizationErrorCode.NOT_A_MEMBER]: 'organization.errors.notAMember',
};

@Injectable()
export class OrganizationErrorTranslationService extends AbstractErrorTranslationService<OrganizationErrorCode> {
  constructor(@Inject(I18nService) i18n: I18nService) {
    super(i18n, ORGANIZATION_ERROR_CODES, ORGANIZATION_ERROR_TRANSLATION_KEYS);
  }
}

import { hasNonBlankOrganizationName, normalizeOrganizationName } from '@pleey/domain/organization';
import type { PartySettings } from '@pleey/domain/party';
import type { ThemeId } from '@pleey/domain/theme';
import { injectable } from 'inversify';
import { OrganizationValidationErrorCode } from '../errors/organization-validation-error-code';
import type { CreateOrganizationCommand } from '../ports/organization-repository';

@injectable()
export class OrganizationFormService {
  validateName(name: string): OrganizationValidationErrorCode | null {
    return hasNonBlankOrganizationName(name) ? null : OrganizationValidationErrorCode.NAME_REQUIRED;
  }

  createCommand(
    name: string,
    description: string,
    defaultPartySettings: PartySettings,
    defaultThemeId: ThemeId | null,
  ): CreateOrganizationCommand {
    return {
      name: normalizeOrganizationName(name),
      description: description.trim() || null,
      defaultPartySettings,
      defaultThemeId,
    };
  }
}

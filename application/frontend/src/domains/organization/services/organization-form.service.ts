import { injectable } from 'inversify';
import type { PartySettings } from '../../game/party/shared/entities/party-settings';
import type { ThemeId } from '../../theme/entities/theme-id';
import { OrganizationValidationErrorCode } from '../errors/organization-validation-error-code';
import type { CreateOrganizationCommand } from '../ports/organization-repository';

@injectable()
export class OrganizationFormService {
  validateName(name: string): OrganizationValidationErrorCode | null {
    return name.trim().length > 0 ? null : OrganizationValidationErrorCode.NAME_REQUIRED;
  }

  createCommand(
    name: string,
    description: string,
    defaultPartySettings: PartySettings,
    defaultThemeId: ThemeId | null,
  ): CreateOrganizationCommand {
    return {
      name: name.trim(),
      description: description.trim() || null,
      defaultPartySettings,
      defaultThemeId,
    };
  }
}

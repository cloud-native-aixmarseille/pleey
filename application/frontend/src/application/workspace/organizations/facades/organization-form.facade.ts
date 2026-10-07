import { inject, injectable } from 'inversify';
import type { PartySettings } from '../../../../domains/game/party/shared/entities/party-settings';
import type { OrganizationValidationErrorCode } from '../../../../domains/organization/errors/organization-validation-error-code';
import type { CreateOrganizationCommand } from '../../../../domains/organization/ports/organization-repository';
import { OrganizationFormService } from '../../../../domains/organization/services/organization-form.service';
import type { ThemeId } from '../../../../domains/theme/entities/theme-id';

@injectable()
export class OrganizationFormFacade {
  constructor(
    @inject(OrganizationFormService)
    private readonly service: OrganizationFormService,
  ) {}

  validateName(name: string): OrganizationValidationErrorCode | null {
    return this.service.validateName(name);
  }

  createCommand(
    name: string,
    description: string,
    defaultPartySettings: PartySettings,
    defaultThemeId: ThemeId | null,
  ): CreateOrganizationCommand {
    return this.service.createCommand(name, description, defaultPartySettings, defaultThemeId);
  }
}

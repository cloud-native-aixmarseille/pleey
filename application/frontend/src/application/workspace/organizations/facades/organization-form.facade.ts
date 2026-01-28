import { inject, injectable } from 'inversify';
import type { OrganizationValidationErrorCode } from '../../../../domains/organization/errors/organization-validation-error-code';
import { OrganizationFormService } from '../../../../domains/organization/services/organization-form.service';
import type { CreateOrganizationCommand } from '../../../workspace/organizations/contracts/create-organization-command';

@injectable()
export class OrganizationFormFacade {
  constructor(
    @inject(OrganizationFormService)
    private readonly service: OrganizationFormService,
  ) {}

  validateName(name: string): OrganizationValidationErrorCode | null {
    return this.service.validateName(name);
  }

  createCommand(name: string, description: string): CreateOrganizationCommand {
    return this.service.createCommand(name, description);
  }
}

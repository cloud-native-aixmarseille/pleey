import { injectable } from 'inversify';
import { OrganizationValidationErrorCode } from '../errors/organization-validation-error-code';
import type { CreateOrganizationCommand } from '../ports/organization-repository';

@injectable()
export class OrganizationFormService {
  validateName(name: string): OrganizationValidationErrorCode | null {
    return name.trim().length > 0 ? null : OrganizationValidationErrorCode.NAME_REQUIRED;
  }

  createCommand(name: string, description: string): CreateOrganizationCommand {
    return {
      name: name.trim(),
      description: description.trim() || null,
    };
  }
}

import type { PartySettings } from '@pleey/domain/party';
import type { ThemeId } from '@pleey/domain/theme';
import { inject, injectable } from 'inversify';
import type { ProjectValidationErrorCode } from '../../../../domains/project/errors/project-validation-error-code';
import type { ProjectFormInput } from '../../../../domains/project/services/project-form.service';
import { ProjectFormService } from '../../../../domains/project/services/project-form.service';

@injectable()
export class ProjectFormFacade {
  constructor(
    @inject(ProjectFormService)
    private readonly service: ProjectFormService,
  ) {}

  validateName(name: string): ProjectValidationErrorCode | null {
    return this.service.validateName(name);
  }

  createInput(
    name: string,
    description: string,
    defaultPartySettings: PartySettings,
    defaultThemeId: ThemeId | null,
  ): ProjectFormInput {
    return this.service.createInput(name, description, defaultPartySettings, defaultThemeId);
  }
}

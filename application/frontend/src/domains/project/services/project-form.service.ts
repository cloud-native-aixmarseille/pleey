import { injectable } from 'inversify';
import type { PartySettings } from '../../game/party/shared/entities/party-settings';
import { ProjectValidationErrorCode } from '../errors/project-validation-error-code';

export interface ProjectFormInput {
  readonly name: string;
  readonly description: string | null;
  readonly defaultPartySettings: PartySettings | null;
}

@injectable()
export class ProjectFormService {
  validateName(name: string): ProjectValidationErrorCode | null {
    return name.trim().length > 0 ? null : ProjectValidationErrorCode.NAME_REQUIRED;
  }

  createInput(name: string, description: string, partySettings: PartySettings): ProjectFormInput {
    return {
      name: name.trim(),
      description: description.trim() || null,
      defaultPartySettings: partySettings,
    };
  }
}

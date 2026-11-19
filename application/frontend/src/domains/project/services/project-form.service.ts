import type { PartySettings } from '@pleey/domain/party';
import { hasNonBlankProjectName, normalizeProjectName } from '@pleey/domain/project';
import type { ThemeId } from '@pleey/domain/theme';
import { injectable } from 'inversify';
import { ProjectValidationErrorCode } from '../errors/project-validation-error-code';

export interface ProjectFormInput {
  readonly name: string;
  readonly description: string | null;
  readonly defaultPartySettings: PartySettings | null;
  readonly defaultThemeId: ThemeId | null;
}

@injectable()
export class ProjectFormService {
  validateName(name: string): ProjectValidationErrorCode | null {
    return hasNonBlankProjectName(name) ? null : ProjectValidationErrorCode.NAME_REQUIRED;
  }

  createInput(
    name: string,
    description: string,
    defaultPartySettings: PartySettings,
    defaultThemeId: ThemeId | null,
  ): ProjectFormInput {
    return {
      name: normalizeProjectName(name),
      description: description.trim() || null,
      defaultPartySettings,
      defaultThemeId,
    };
  }
}

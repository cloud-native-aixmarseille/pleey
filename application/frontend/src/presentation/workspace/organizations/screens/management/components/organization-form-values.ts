import { DEFAULT_PARTY_SETTINGS, type PartySettings } from '@pleey/domain/party';
import type { ThemeId } from '@pleey/domain/theme';
import type { Organization } from '../../../../../../domains/organization/entities/organization';
import type {
  CreateOrganizationCommand,
  UpdateOrganizationCommand,
} from '../../../../../../domains/organization/ports/organization-repository';

export interface OrganizationFormValues {
  readonly name: string;
  readonly description: string;
  readonly defaultPartySettings: PartySettings;
  readonly defaultThemeId: ThemeId | null;
}

export function createOrganizationInitialValues(): OrganizationFormValues {
  return {
    name: '',
    description: '',
    defaultPartySettings: DEFAULT_PARTY_SETTINGS,
    defaultThemeId: null,
  };
}

export function editOrganizationInitialValues(organization: Organization): OrganizationFormValues {
  return {
    name: organization.name,
    description: organization.description ?? '',
    defaultPartySettings: organization.defaultPartySettings ?? DEFAULT_PARTY_SETTINGS,
    defaultThemeId: organization.defaultThemeId,
  };
}

export function toCreateOrganizationCommand(values: OrganizationFormValues): CreateOrganizationCommand {
  return {
    name: values.name,
    description: values.description,
    defaultPartySettings: values.defaultPartySettings,
    defaultThemeId: values.defaultThemeId,
  };
}

export function toUpdateOrganizationCommand(
  organizationId: UpdateOrganizationCommand['organizationId'],
  values: OrganizationFormValues,
): UpdateOrganizationCommand {
  return {
    organizationId,
    ...toCreateOrganizationCommand(values),
  };
}

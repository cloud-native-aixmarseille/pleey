import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OrganizationRole } from '../../../../../../domains/organization/entities/organization';
import { DEFAULT_PARTY_SETTINGS } from '../../../../../../domains/game/party/shared/entities/party-settings';
import { OrganizationFixtureFactory } from '../../../../../../test-utils/fixtures/organization-fixture-factory';
import { renderWithProviders } from '../../../../../../test-utils/render-with-providers';
import { EditOrganizationForm } from './edit-organization-form';

const organizationFixtureFactory = new OrganizationFixtureFactory();

vi.mock('../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('EditOrganizationForm', () => {
  it('hides the edit action when the selected user cannot manage the organization', () => {
    // Arrange + Act
    renderWithProviders(
      <EditOrganizationForm
        organization={organizationFixtureFactory.createOrganization({ role: OrganizationRole.MEMBER })}
        onSubmit={vi.fn()}
        onUpdated={vi.fn()}
      />,
    );

    // Assert
    expect(screen.queryByRole('button', { name: 'organization.management.edit.openButton' })).toBeNull();
  });

  it('submits updated organization values and notifies the caller', async () => {
    // Arrange
    const user = userEvent.setup();
    const organization = organizationFixtureFactory.createOrganization({
      name: 'Arcade Org',
      description: 'Main community hub',
      role: OrganizationRole.MANAGER,
    });
    const customPartySettings = { ...DEFAULT_PARTY_SETTINGS, allowOptionChangeAfterVoting: true, randomizeStageOrder: true };
    const updatedOrganization = organizationFixtureFactory.createOrganization({
      id: organization.id,
      name: 'Arcade Org 2',
      description: 'Updated hub',
      role: OrganizationRole.MANAGER,
      defaultPartySettings: customPartySettings,
    });
    const onSubmit = vi.fn().mockResolvedValue(updatedOrganization);
    const onUpdated = vi.fn();

    renderWithProviders(<EditOrganizationForm organization={organization} onSubmit={onSubmit} onUpdated={onUpdated} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'organization.management.edit.openButton' }));
    const dialog = await screen.findByRole('dialog');
    const nameInput = (await within(dialog).findByLabelText(
      /organization\.management\.create\.fields\.name\.label/,
    )) as HTMLInputElement;
    const descriptionInput = within(dialog).getByLabelText(
      /organization\.management\.create\.fields\.description\.label/,
    ) as HTMLTextAreaElement;

    await waitFor(() => {
      expect(nameInput.value).toBe('Arcade Org');
      expect(descriptionInput.value).toBe('Main community hub');
    });

    await user.clear(nameInput);
    await user.type(nameInput, 'Arcade Org 2');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Updated hub');
    await user.click(
      within(dialog).getByRole('checkbox', {
        name: 'game.party.settings.allowOptionChangeAfterVotingLabel',
      }),
    );
    await user.click(
      within(dialog).getByRole('checkbox', {
        name: 'game.party.settings.randomizeStageOrderLabel',
      }),
    );

    await user.click(within(dialog).getByRole('button', { name: 'organization.management.edit.submit' }));

    // Assert
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        organizationId: organization.id,
        name: 'Arcade Org 2',
        description: 'Updated hub',
        defaultPartySettings: customPartySettings,
      });
    });
    expect(onUpdated).toHaveBeenCalledWith(updatedOrganization);
  });
});

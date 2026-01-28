import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OrganizationRole } from '../../../../../../domains/organization/entities/organization';
import { renderWithProviders } from '../../../../../../test-utils/render-with-providers';
import { DashboardWorkspaceBar } from './dashboard-workspace-bar';

vi.mock('../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('DashboardWorkspaceBar', () => {
  it('renders organization and project selects', () => {
    renderWithProviders(
      <DashboardWorkspaceBar
        organizations={[]}
        projects={[]}
        organizationId={null}
        projectId={null}
        selectedOrganizationName={null}
        selectedProjectName={null}
        isOrganizationsLoading={false}
        isWorkspaceLoading={false}
        onOrganizationChange={vi.fn()}
        onProjectChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('toolbar')).toBeInTheDocument();
    expect(screen.getByLabelText('dashboard.workspace.organizationLabel')).toBeInTheDocument();
    expect(screen.getByLabelText('dashboard.workspace.projectLabel')).toBeInTheDocument();
  });

  it('shows the ready label when both selections are made', () => {
    renderWithProviders(
      <DashboardWorkspaceBar
        organizations={[
          {
            id: 1,
            name: 'Org A',
            description: null,
            createdAt: '2026-03-18T10:00:00.000Z',
            updatedAt: '2026-03-19T10:00:00.000Z',
            role: OrganizationRole.OWNER,
          },
        ]}
        projects={[
          {
            id: 5,
            name: 'Project Y',
            description: null,
            organizationId: 1,
            createdAt: '2026-03-18T10:00:00.000Z',
          },
        ]}
        organizationId={1}
        projectId={5}
        selectedOrganizationName="Org A"
        selectedProjectName="Project Y"
        isOrganizationsLoading={false}
        isWorkspaceLoading={false}
        onOrganizationChange={vi.fn()}
        onProjectChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText('dashboard.workspace.ready (organization=Org A, project=Project Y)'),
    ).toBeInTheDocument();
  });

  it('forwards selection changes', () => {
    const onOrganizationChange = vi.fn();
    const onProjectChange = vi.fn();

    renderWithProviders(
      <DashboardWorkspaceBar
        organizations={[
          {
            id: 1,
            name: 'Org A',
            description: null,
            createdAt: '2026-03-18T10:00:00.000Z',
            updatedAt: '2026-03-19T10:00:00.000Z',
            role: OrganizationRole.OWNER,
          },
          {
            id: 2,
            name: 'Org B',
            description: null,
            createdAt: '2026-03-18T10:00:00.000Z',
            updatedAt: '2026-03-19T10:00:00.000Z',
            role: OrganizationRole.MEMBER,
          },
        ]}
        projects={[
          {
            id: 5,
            name: 'Project Y',
            description: null,
            organizationId: 1,
            createdAt: '2026-03-18T10:00:00.000Z',
          },
        ]}
        organizationId={1}
        projectId={5}
        selectedOrganizationName="Org A"
        selectedProjectName="Project Y"
        isOrganizationsLoading={false}
        isWorkspaceLoading={false}
        onOrganizationChange={onOrganizationChange}
        onProjectChange={onProjectChange}
      />,
    );

    fireEvent.change(screen.getByLabelText('dashboard.workspace.organizationLabel'), {
      target: { value: '2' },
    });

    expect(onOrganizationChange).toHaveBeenCalledWith('2');
  });

  it('disables project select when no organization is chosen', () => {
    renderWithProviders(
      <DashboardWorkspaceBar
        organizations={[]}
        projects={[]}
        organizationId={null}
        projectId={null}
        selectedOrganizationName={null}
        selectedProjectName={null}
        isOrganizationsLoading={false}
        isWorkspaceLoading={false}
        onOrganizationChange={vi.fn()}
        onProjectChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('dashboard.workspace.projectLabel')).toBeDisabled();
  });
});

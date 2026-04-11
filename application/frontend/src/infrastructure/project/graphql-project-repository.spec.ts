import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import { ProjectIdentifier } from '../../application/workspace/shared/services/identifiers/project-identifier';
import { ProjectErrorCode } from '../../domains/project/errors/project-error-code';
import { GraphqlClientMockFactory } from '../../test-utils/mocks/graphql-client-mock-factory';
import { GraphqlProjectRepository } from './graphql-project.repository';

const organizationIdentifier = new OrganizationIdentifier();
const projectIdentifier = new ProjectIdentifier();

describe('GraphqlProjectRepository', () => {
  describe('getProjectsByOrganization()', () => {
    it('returns normalized projects for the workspace organization', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestResult: {
          organizationProjects: {
            projects: [
              {
                id: 17,
                name: 'Spring Event',
                description: null,
                organizationId: 3,
                createdAt: '2026-03-10T16:00:00.000Z',
              },
            ],
          },
        },
      });
      const repository = new GraphqlProjectRepository(
        client,
        projectIdentifier,
        organizationIdentifier,
      );

      // Act
      const projects = await repository.getProjectsByOrganization(organizationIdentifier.parse(3));

      // Assert
      expect(projects).toEqual([
        {
          id: projectIdentifier.parse(17),
          name: 'Spring Event',
          description: null,
          organizationId: organizationIdentifier.parse(3),
          createdAt: '2026-03-10T16:00:00.000Z',
        },
      ]);
    });

    it('maps transport failures to translated project error keys', async () => {
      // Arrange
      const { client } = new GraphqlClientMockFactory().create({
        requestError: new Error('project.errors.loadFailed'),
      });
      const repository = new GraphqlProjectRepository(
        client,
        projectIdentifier,
        organizationIdentifier,
      );

      // Act + Assert
      await expect(
        repository.getProjectsByOrganization(organizationIdentifier.parse(99)),
      ).rejects.toThrow(ProjectErrorCode.LOAD_FAILED);
    });
  });

  describe('createProject()', () => {
    it('creates a project through the GraphQL mutation', async () => {
      const { client } = new GraphqlClientMockFactory().create({
        requestResult: {
          createProject: {
            id: 22,
            name: 'Spring Event',
            description: 'Launch campaign',
            organizationId: 3,
            createdAt: '2026-03-10T16:00:00.000Z',
          },
        },
      });
      const repository = new GraphqlProjectRepository(
        client,
        projectIdentifier,
        organizationIdentifier,
      );

      const project = await repository.createProject({
        organizationId: organizationIdentifier.parse(3),
        name: 'Spring Event',
        description: 'Launch campaign',
      });

      expect(project).toEqual({
        id: projectIdentifier.parse(22),
        name: 'Spring Event',
        description: 'Launch campaign',
        organizationId: organizationIdentifier.parse(3),
        createdAt: '2026-03-10T16:00:00.000Z',
      });
    });

    it('maps create failures to translated project error keys', async () => {
      const { client } = new GraphqlClientMockFactory().create({
        requestError: new Error('project.errors.createFailed'),
      });
      const repository = new GraphqlProjectRepository(
        client,
        projectIdentifier,
        organizationIdentifier,
      );

      await expect(
        repository.createProject({
          organizationId: organizationIdentifier.parse(3),
          name: 'Spring Event',
          description: null,
        }),
      ).rejects.toThrow(ProjectErrorCode.CREATE_FAILED);
    });
  });

  describe('updateProject()', () => {
    it('updates a project through the GraphQL mutation', async () => {
      const { client } = new GraphqlClientMockFactory().create({
        requestResult: {
          updateProject: {
            id: 22,
            name: 'Spring Event 2',
            description: 'Expanded launch',
            organizationId: 3,
            createdAt: '2026-03-10T16:00:00.000Z',
          },
        },
      });
      const repository = new GraphqlProjectRepository(
        client,
        projectIdentifier,
        organizationIdentifier,
      );

      const project = await repository.updateProject({
        projectId: projectIdentifier.parse(22),
        name: 'Spring Event 2',
        description: 'Expanded launch',
      });

      expect(project).toEqual({
        id: projectIdentifier.parse(22),
        name: 'Spring Event 2',
        description: 'Expanded launch',
        organizationId: organizationIdentifier.parse(3),
        createdAt: '2026-03-10T16:00:00.000Z',
      });
    });

    it('maps update failures to translated project error keys', async () => {
      const { client } = new GraphqlClientMockFactory().create({
        requestError: new Error('project.errors.updateFailed'),
      });
      const repository = new GraphqlProjectRepository(
        client,
        projectIdentifier,
        organizationIdentifier,
      );

      await expect(
        repository.updateProject({
          projectId: projectIdentifier.parse(22),
          name: 'Spring Event 2',
          description: null,
        }),
      ).rejects.toThrow(ProjectErrorCode.UPDATE_FAILED);
    });
  });

  describe('deleteProject()', () => {
    it('deletes a project through the GraphQL mutation', async () => {
      const { client } = new GraphqlClientMockFactory().create({
        requestResult: {
          deleteProject: true,
        },
      });
      const repository = new GraphqlProjectRepository(
        client,
        projectIdentifier,
        organizationIdentifier,
      );

      await expect(
        repository.deleteProject({
          projectId: projectIdentifier.parse(22),
          migrationProjectId: projectIdentifier.parse(31),
        }),
      ).resolves.toBeUndefined();
    });

    it('maps delete failures to translated project error keys', async () => {
      const { client } = new GraphqlClientMockFactory().create({
        requestError: new Error('project.errors.deleteFailed'),
      });
      const repository = new GraphqlProjectRepository(
        client,
        projectIdentifier,
        organizationIdentifier,
      );

      await expect(
        repository.deleteProject({
          projectId: projectIdentifier.parse(22),
          migrationProjectId: null,
        }),
      ).rejects.toThrow(ProjectErrorCode.DELETE_FAILED);
    });
  });
});

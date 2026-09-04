import { describe, expect, it, vi } from 'vitest';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import { ProjectResolver } from './project-resolver';

describe('ProjectResolver', () => {
  it('maps allowJoiningAfterStart when creating a project', async () => {
    // Arrange
    const createProjectUseCase = {
      execute: vi.fn().mockResolvedValue({
        id: backendTestIdentifiers.project(9),
        organizationId: backendTestIdentifiers.organization(7),
        name: 'Party Project',
        description: null,
        defaultPartySettings: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    };
    const organizationIdentifier = {
      parse: vi.fn((value: string) => value),
    };
    const resolver = new ProjectResolver(
      createProjectUseCase as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      organizationIdentifier as never,
      { parse: vi.fn((value: string) => value) } as never,
    );

    // Act
    await resolver.createProject(
      backendTestIdentifiers.organization(7),
      {
        name: 'Party Project',
        defaultPartySettings: {
          allowJoiningAfterStart: true,
          allowOptionChangeAfterVoting: false,
          randomizeOptionOrder: true,
          randomizeStageOrder: false,
        },
      },
      { user: { id: backendTestIdentifiers.user(10) } },
    );

    // Assert
    expect(organizationIdentifier.parse).toHaveBeenCalledWith(backendTestIdentifiers.organization(7));
    expect(createProjectUseCase.execute).toHaveBeenCalledWith(
      backendTestIdentifiers.organization(7),
      {
        name: 'Party Project',
        defaultPartySettings: {
          allowJoiningAfterStart: true,
          allowOptionChangeAfterVoting: false,
          randomizeOptionOrder: true,
          randomizeStageOrder: false,
        },
      },
      backendTestIdentifiers.user(10),
    );
  });
});

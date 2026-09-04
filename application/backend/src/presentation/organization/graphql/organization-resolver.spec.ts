import { describe, expect, it, vi } from 'vitest';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import { OrganizationResolver } from './organization-resolver';

describe('OrganizationResolver', () => {
  it('maps allowJoiningAfterStart when creating an organization', async () => {
    // Arrange
    const createOrganizationUseCase = {
      execute: vi.fn().mockResolvedValue({
        id: backendTestIdentifiers.organization(7),
        name: 'Pleey',
        slug: 'pleey',
        ownerId: backendTestIdentifiers.user(10),
        defaultPartySettings: null,
      }),
    };
    const resolver = new OrganizationResolver(
      createOrganizationUseCase as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { parse: vi.fn((value: string) => value) } as never,
      { parse: vi.fn((value: string) => value) } as never,
    );

    // Act
    await resolver.createOrganization(
      {
        name: 'Pleey',
        defaultPartySettings: {
          allowJoiningAfterStart: true,
          allowOptionChangeAfterVoting: true,
          randomizeOptionOrder: false,
          randomizeStageOrder: true,
        },
      },
      { user: { id: backendTestIdentifiers.user(10) } },
    );

    // Assert
    expect(createOrganizationUseCase.execute).toHaveBeenCalledWith(
      {
        name: 'Pleey',
        defaultPartySettings: {
          allowJoiningAfterStart: true,
          allowOptionChangeAfterVoting: true,
          randomizeOptionOrder: false,
          randomizeStageOrder: true,
        },
      },
      backendTestIdentifiers.user(10),
    );
  });
});

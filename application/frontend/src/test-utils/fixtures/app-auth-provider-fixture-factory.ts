import { vi } from 'vitest';
import { AppAuthProviderFactory } from '../../app/bootstrap/modules/identity/app-auth-provider-factory';
import type { AuthSessionTransportHandlers } from '../../application/identity/ports/auth-session-transport.port';
import { AuthPayloadInspector } from '../../domains/identity/services/auth-payload-inspector';
import { GraphqlClient } from '../../infrastructure/graphql/client/graphql-client';
import { GraphqlAuthRepository } from '../../infrastructure/identity/graphql-auth.repository';
import { PersistedAuthSessionAdapter } from '../../infrastructure/identity/persisted-auth-session.adapter';
import { LocalStorageAdapter } from '../../infrastructure/storage/local-storage.adapter';
import { AuthFixtureFactory } from './auth-fixture-factory';

export class AppAuthProviderFixtureFactory {
  createConnected() {
    const fixture = this.create();
    const inspector = new AuthPayloadInspector();
    const client = new GraphqlClient(inspector);
    const sessions = new PersistedAuthSessionAdapter(new LocalStorageAdapter(), client);
    const repository = new GraphqlAuthRepository(client, inspector);
    fixture.authSession.restore.mockImplementation(() => sessions.restore());
    fixture.authSession.updateUser.mockImplementation((user) => sessions.updateUser(user));
    fixture.authSession.registerHandlers.mockImplementation((handlers) => sessions.registerHandlers(handlers));
    fixture.currentUser.execute.mockImplementation(() => repository.currentUser());
    return { ...fixture, sessions };
  }

  create() {
    const fixtures = new AuthFixtureFactory();
    const currentUser = { execute: vi.fn().mockResolvedValue(fixtures.createUser()) };
    const authSession = {
      watch: vi.fn<(listener: () => void) => () => void>().mockReturnValue(() => {}),
      restore: vi.fn().mockReturnValue(fixtures.createAuthSession()),
      commit: vi.fn(),
      updateUser: vi.fn(),
      clear: vi.fn(),
      suspend: vi.fn(),
      registerHandlers: vi.fn<(handlers: AuthSessionTransportHandlers) => void>(),
    };
    const login = { execute: vi.fn().mockResolvedValue(fixtures.createAuthSession()) };
    const logout = { execute: vi.fn().mockResolvedValue(undefined) };
    const workspace = { clear: vi.fn() };
    const factory = new AppAuthProviderFactory(
      currentUser as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      authSession as never,
      login as never,
      { execute: vi.fn() } as never,
      logout as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      workspace as never,
    );
    return { factory, currentUser, authSession, login, logout, workspace };
  }
}

import { describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '../../domain/identity/errors';
import { backendTestIdentifiers } from '../../test-utils/branded-identifiers';
import { SocketAuthenticationFixtureFactory } from '../../test-utils/fixtures/unit/socket-authentication-fixture-factory';

describe('ConfiguredIoAdapter', () => {
  it('clears recovered identity when the reconnect has no cookie session', async () => {
    // Arrange
    const fixture = new SocketAuthenticationFixtureFactory().create();
    Object.assign(fixture.socket.data, {
      authenticatedSessionExpiresAt: new Date(),
      authenticatedSessionId: 'old-session',
      authenticatedUserId: backendTestIdentifiers.user(1),
    });

    // Act + Assert
    try {
      await fixture.connect();
      expect(fixture.socket.data).toEqual({});
      expect(fixture.next).toHaveBeenCalledWith();
    } finally {
      fixture.dispose();
    }
  });

  it('admits public observation without an account cookie', async () => {
    // Arrange
    const fixture = new SocketAuthenticationFixtureFactory().create();

    // Act + Assert
    try {
      await fixture.connect();
      expect(fixture.next).toHaveBeenCalledWith();
      expect(fixture.sessions.getSession).toHaveBeenCalledOnce();
      expect(fixture.socket.data).toEqual({});
    } finally {
      fixture.dispose();
    }
  });

  it.each(['Bearer expired', 'Basic token', '', 42])(
    'rejects legacy socket authorization %s',
    async (authorization) => {
      // Arrange
      const fixture = new SocketAuthenticationFixtureFactory().create({ authorization });

      // Act + Assert
      try {
        await fixture.connect();
        expect(fixture.next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
        expect(fixture.sessions.getSession).not.toHaveBeenCalled();
      } finally {
        fixture.dispose();
      }
    },
  );

  it('binds a valid Better Auth cookie to the socket', async () => {
    // Arrange
    const fixture = new SocketAuthenticationFixtureFactory().create({ hasSession: true });

    // Act + Assert
    try {
      await fixture.connect();

      expect(fixture.socket.data).toMatchObject({
        authenticatedSessionExpiresAt: new Date('2033-05-18T03:33:20.000Z'),
        authenticatedSessionId: 'better-auth-session',
        authenticatedUserId: backendTestIdentifiers.user(1),
      });
      expect(fixture.next).toHaveBeenCalledWith();
    } finally {
      fixture.dispose();
    }
  });

  it('rejects packets and disconnects after committed session revocation', async () => {
    // Arrange
    const fixture = new SocketAuthenticationFixtureFactory().create({ hasSession: true });
    const nextPacket = vi.fn();

    // Act + Assert
    try {
      await fixture.connect();
      fixture.sessions.isSessionRevoked.mockResolvedValueOnce(true);
      await fixture.socket.use.mock.calls[0][0](['host-control'], nextPacket);

      expect(fixture.socket.data).toEqual({});
      expect(nextPacket).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(fixture.socket.disconnect).toHaveBeenCalledWith(true);
    } finally {
      fixture.dispose();
    }
  });
});

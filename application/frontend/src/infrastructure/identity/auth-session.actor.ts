import type { AuthSession } from '@pleey/contracts/identity';
import { injectable } from 'inversify';
import { type ActorRefFrom, createActor, fromPromise, setup, waitFor } from 'xstate';
import { AUTH_ERROR_DEFINITIONS, AuthErrorCode } from '../../domains/identity/errors/auth-error-code';
import { createDomainError } from '../../domains/shared/errors/domain-error';

interface AuthSessionActorServices {
  check(): Promise<AuthSession | null>;
  createAnonymous(): Promise<AuthSession>;
}

interface Context {
  readonly session: AuthSession | null;
}

type Event = { readonly type: 'CHECK' } | { readonly type: 'CREATE_ANONYMOUS' } | { readonly type: 'SIGN_OUT' };

const machine = (services: AuthSessionActorServices) =>
  setup({
    types: {
      context: {} as Context,
      events: {} as Event,
    },
    actors: {
      checkSession: fromPromise(services.check),
      createAnonymousSession: fromPromise(services.createAnonymous),
    },
  }).createMachine({
    context: { session: null },
    initial: 'idle',
    states: {
      idle: {
        on: {
          CHECK: 'checking',
          CREATE_ANONYMOUS: 'creatingAnonymous',
          SIGN_OUT: 'signedOut',
        },
      },
      checking: {
        invoke: {
          src: 'checkSession',
          onDone: [
            {
              guard: ({ event }) => event.output !== null,
              target: 'authenticated',
              actions: ({ context, event }) => Object.assign(context, { session: event.output }),
            },
            { target: 'noSession', actions: ({ context }) => Object.assign(context, { session: null }) },
          ],
          onError: { target: 'unavailable', actions: ({ context }) => Object.assign(context, { session: null }) },
        },
      },
      creatingAnonymous: {
        invoke: {
          src: 'createAnonymousSession',
          onDone: {
            target: 'authenticated',
            actions: ({ context, event }) => Object.assign(context, { session: event.output }),
          },
          onError: { target: 'unavailable', actions: ({ context }) => Object.assign(context, { session: null }) },
        },
      },
      authenticated: {
        on: {
          CHECK: 'checking',
          CREATE_ANONYMOUS: 'checking',
          SIGN_OUT: 'signedOut',
        },
      },
      noSession: {
        on: {
          CHECK: 'checking',
          CREATE_ANONYMOUS: 'creatingAnonymous',
          SIGN_OUT: 'signedOut',
        },
      },
      signedOut: {
        entry: ({ context }) => Object.assign(context, { session: null }),
        on: {
          CHECK: 'checking',
          CREATE_ANONYMOUS: 'creatingAnonymous',
        },
      },
      unavailable: {
        on: {
          CHECK: 'checking',
          CREATE_ANONYMOUS: 'creatingAnonymous',
          SIGN_OUT: 'signedOut',
        },
      },
    },
  });

@injectable()
export class AuthSessionActor {
  private actor: ActorRefFrom<ReturnType<typeof machine>> | null = null;

  configure(services: AuthSessionActorServices): void {
    this.actor ??= createActor(machine(services)).start();
  }

  async check(): Promise<AuthSession | null> {
    return this.waitForTerminalResult({ type: 'CHECK' });
  }

  async createAnonymous(): Promise<AuthSession> {
    const session = await this.waitForTerminalResult({ type: 'CREATE_ANONYMOUS' });
    if (!session)
      throw createDomainError(AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC], {
        operation: 'anonymousSessionCreation',
      });
    return session;
  }

  signOut(): void {
    this.actor?.send({ type: 'SIGN_OUT' });
  }

  private async waitForTerminalResult(event: Event): Promise<AuthSession | null> {
    const actor = this.configuredActor();
    const snapshot = actor.getSnapshot();
    if (snapshot.matches('checking') || snapshot.matches('creatingAnonymous')) {
      throw createDomainError(AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC], {
        operation: 'sessionTransition',
      });
    }
    actor.send(event);
    const terminal = await waitFor(
      actor,
      (state) =>
        state.matches('authenticated') ||
        state.matches('noSession') ||
        state.matches('signedOut') ||
        state.matches('unavailable'),
    );
    if (terminal.matches('unavailable'))
      throw createDomainError(AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC], {
        operation: 'sessionAvailability',
      });
    return terminal.context.session;
  }

  private configuredActor(): ActorRefFrom<ReturnType<typeof machine>> {
    if (!this.actor)
      throw createDomainError(AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC], {
        operation: 'sessionActorConfiguration',
      });
    return this.actor;
  }
}

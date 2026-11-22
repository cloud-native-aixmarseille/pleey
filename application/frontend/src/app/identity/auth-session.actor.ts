import { createMachine } from 'xstate';

export const authSessionMachine = createMachine({
  id: 'authSession',
  initial: 'CHECKING',
  states: {
    CHECKING: {
      on: {
        ANONYMOUS_CONFIRMED: 'AUTHENTICATED_ANONYMOUS',
        REGISTERED_CONFIRMED: 'AUTHENTICATED_REGISTERED',
        START_ANONYMOUS: 'CREATING_ANONYMOUS',
        EXPIRED: 'EXPIRED',
        UNAVAILABLE: 'UNAVAILABLE',
      },
    },
    CREATING_ANONYMOUS: {
      on: {
        CONFIRMED: 'AUTHENTICATED_ANONYMOUS',
        EXPIRED: 'EXPIRED',
        UNAVAILABLE: 'UNAVAILABLE',
      },
    },
    AUTHENTICATED_ANONYMOUS: {
      on: {
        REFRESH: 'REFRESHING',
        SIGN_OUT: 'SIGNING_OUT',
        EXPIRED: 'EXPIRED',
      },
    },
    AUTHENTICATED_REGISTERED: {
      on: {
        REFRESH: 'REFRESHING',
        SIGN_OUT: 'SIGNING_OUT',
        EXPIRED: 'EXPIRED',
      },
    },
    REFRESHING: {
      on: {
        ANONYMOUS_CONFIRMED: 'AUTHENTICATED_ANONYMOUS',
        REGISTERED_CONFIRMED: 'AUTHENTICATED_REGISTERED',
        EXPIRED: 'EXPIRED',
        UNAVAILABLE: 'UNAVAILABLE',
      },
    },
    SIGNING_OUT: {
      on: {
        CONFIRMED: 'CHECKING',
        UNAVAILABLE: 'UNAVAILABLE',
      },
    },
    EXPIRED: {},
    UNAVAILABLE: {},
  },
});

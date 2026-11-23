import { inject, injectable } from 'inversify';
import { createElement, type PropsWithChildren, type ReactNode, useEffect, useRef, useState } from 'react';
import { GetCurrentUserUseCase } from '../../../../application/identity/use-cases/get-current-user-use-case';
import { RegenerateAvatarUseCase } from '../../../../application/identity/use-cases/regenerate-avatar-use-case';
import { UpdateProfileUseCase } from '../../../../application/identity/use-cases/update-profile-use-case';
import {
  WORKSPACE_SELECTION_PORT,
  type WorkspaceSelectionPort,
} from '../../../../application/workspace/ports/workspace-selection.port';
import type { User } from '../../../../domains/identity/entities/user';
import { AUTH_ERROR_DEFINITIONS, AuthErrorCode } from '../../../../domains/identity/errors/auth-error-code';
import type { UpdateProfileInput } from '../../../../domains/identity/ports/auth-repository';
import { createDomainError } from '../../../../domains/shared/errors/domain-error';
import { betterAuthClient } from '../../../../infrastructure/identity/better-auth-client';
import { PersistedAuthSessionAdapter } from '../../../../infrastructure/identity/persisted-auth-session.adapter';
import { type AuthContextValue, AuthProvider } from '../../../../presentation/identity/contexts/auth-context';
import { AppProviderOrder, BaseAppProviderFactory } from '../../app-provider-factory';

interface AppAuthProviderDependencies {
  readonly getCurrentUser: GetCurrentUserUseCase;
  readonly authSessionService: PersistedAuthSessionAdapter;
  readonly updateProfileUseCase: UpdateProfileUseCase;
  readonly regenerateAvatarUseCase: RegenerateAvatarUseCase;
  readonly workspaceSelectionService: WorkspaceSelectionPort;
}

interface AppAuthProviderProps extends PropsWithChildren {
  readonly dependencies: AppAuthProviderDependencies;
}

type LoginUserCommand = { readonly email: string; readonly password: string };
type RegisterUserCommand = LoginUserCommand & {
  readonly username: string;
  readonly captchaToken: string;
};

function AppAuthProvider({ children, dependencies }: AppAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);

  const revision = useRef(0);
  const signingOut = useRef(false);

  useEffect(() => {
    let active = true;
    async function restore() {
      if (signingOut.current) return;
      const restorationRevision = ++revision.current;
      setHasRestoredSession(false);
      try {
        const restored = await dependencies.authSessionService.restore();
        if (!active || restorationRevision !== revision.current || signingOut.current) return;
        if (!restored) {
          dependencies.workspaceSelectionService.clear();
          setUser(null);
          return;
        }
        const validatedUser = await dependencies.getCurrentUser.execute();
        if (active && restorationRevision === revision.current && !signingOut.current) {
          const confirmedUser = { ...validatedUser, isAnonymous: restored.isAnonymous };
          dependencies.authSessionService.updateUser(confirmedUser);
          setUser(confirmedUser);
        }
      } catch {
        if (active && restorationRevision === revision.current && !signingOut.current) {
          dependencies.workspaceSelectionService.clear();
          dependencies.authSessionService.suspend();
          setUser(null);
        }
      } finally {
        if (active && restorationRevision === revision.current) setHasRestoredSession(true);
      }
    }
    void restore();
    const unwatch = dependencies.authSessionService.watch(() => {
      void restore();
    });
    return () => {
      unwatch();
      active = false;
    };
  }, [dependencies]);

  async function signIn(input: LoginUserCommand): Promise<void> {
    const loginRevision = ++revision.current;
    signingOut.current = false;
    const existingSession = await dependencies.authSessionService.restore();
    if (existingSession) {
      await betterAuthClient.signOut();
      dependencies.authSessionService.clear();
    }
    dependencies.authSessionService.suspend();
    setHasRestoredSession(true);
    setUser(null);
    const login = await betterAuthClient.signIn.email({
      email: input.email,
      password: input.password,
    });
    if (login.error)
      throw createDomainError(AUTH_ERROR_DEFINITIONS[AuthErrorCode.INVALID_CREDENTIALS], {
        operation: 'signIn',
      });
    const session = await dependencies.authSessionService.restore();
    if (!session) throw new Error('SESSION_CONFIRMATION_FAILED');
    if (loginRevision !== revision.current) return;
    dependencies.workspaceSelectionService.clear();
    dependencies.authSessionService.commit(session);
    setUser(session.user);
  }

  async function ensureAnonymousSession(): Promise<User> {
    const anonymous = await dependencies.authSessionService.ensureAnonymous();
    const validatedUser = await dependencies.getCurrentUser.execute();
    const confirmedUser = { ...validatedUser, isAnonymous: anonymous.isAnonymous };
    revision.current++;
    dependencies.workspaceSelectionService.clear();
    dependencies.authSessionService.updateUser(confirmedUser);
    setHasRestoredSession(true);
    setUser(confirmedUser);
    return confirmedUser;
  }

  async function register(input: RegisterUserCommand): Promise<void> {
    const registration = await betterAuthClient.$fetch('/sign-up/email', {
      body: {
        captchaToken: input.captchaToken,
        email: input.email,
        password: input.password,
        name: input.username,
      },
      method: 'POST',
    });
    if (registration.error)
      throw createDomainError(AUTH_ERROR_DEFINITIONS[AuthErrorCode.REGISTRATION_FAILED], {
        operation: 'register',
      });
    const session = await dependencies.authSessionService.restore();
    if (!session) throw new Error('SESSION_CONFIRMATION_FAILED');
    revision.current++;
    dependencies.workspaceSelectionService.clear();
    setUser(session.user);
  }

  async function signOut(): Promise<void> {
    const logoutRevision = ++revision.current;
    signingOut.current = true;
    setHasRestoredSession(true);
    setUser(null);
    try {
      await betterAuthClient.signOut();
    } finally {
      if (logoutRevision === revision.current) {
        dependencies.authSessionService.clear();
        dependencies.workspaceSelectionService.clear();
        setUser(null);
      }
      if (logoutRevision === revision.current) signingOut.current = false;
    }
  }

  async function updateProfile(input: UpdateProfileInput): Promise<void> {
    const updateRevision = revision.current;
    const updatedUser = await dependencies.updateProfileUseCase.execute(input);
    if (updateRevision !== revision.current) return;
    const confirmedUser = { ...updatedUser, isAnonymous: user?.isAnonymous };
    dependencies.authSessionService.updateUser(confirmedUser);
    setUser(confirmedUser);
  }

  async function regenerateAvatar(): Promise<void> {
    const updateRevision = revision.current;
    const updatedUser = await dependencies.regenerateAvatarUseCase.execute();
    if (updateRevision !== revision.current) return;
    const confirmedUser = { ...updatedUser, isAnonymous: user?.isAnonymous };
    dependencies.authSessionService.updateUser(confirmedUser);
    setUser(confirmedUser);
  }

  const value: AuthContextValue = {
    ensureAnonymousSession,
    requestPasswordReset: async (email, locale, captchaToken) => {
      void locale;
      await betterAuthClient.$fetch('/request-password-reset', {
        body: {
          captchaToken,
          email,
          redirectTo: `${globalThis.location.origin}/auth/reset-password`,
        },
        method: 'POST',
      });
    },
    resetPassword: async (token, password) => {
      await betterAuthClient.resetPassword({ newPassword: password, token });
      // Any account session may have been revoked; validate on the next sign-in.
      revision.current++;
      setHasRestoredSession(true);
      dependencies.authSessionService.clear();
      dependencies.workspaceSelectionService.clear();
      setUser(null);
    },
    user,
    hasRestoredSession,
    signIn,
    register,
    signOut,
    updateProfile,
    regenerateAvatar,
  };

  return createElement(AuthProvider, { value }, children);
}

@injectable()
export class AppAuthProviderFactory extends BaseAppProviderFactory {
  readonly order = AppProviderOrder.AUTH;

  constructor(
    @inject(GetCurrentUserUseCase) private readonly getCurrentUser: GetCurrentUserUseCase,
    @inject(PersistedAuthSessionAdapter)
    private readonly authSessionService: PersistedAuthSessionAdapter,
    @inject(UpdateProfileUseCase)
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    @inject(RegenerateAvatarUseCase)
    private readonly regenerateAvatarUseCase: RegenerateAvatarUseCase,
    @inject(WORKSPACE_SELECTION_PORT)
    private readonly workspaceSelectionService: WorkspaceSelectionPort,
  ) {
    super();
  }

  protected create(children: ReactNode): ReactNode {
    const dependencies: AppAuthProviderDependencies = {
      getCurrentUser: this.getCurrentUser,
      authSessionService: this.authSessionService,
      updateProfileUseCase: this.updateProfileUseCase,
      regenerateAvatarUseCase: this.regenerateAvatarUseCase,
      workspaceSelectionService: this.workspaceSelectionService,
    };

    return createElement(AppAuthProvider, { dependencies }, children);
  }
}

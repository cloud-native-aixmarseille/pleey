import { inject, injectable } from 'inversify';
import { createElement, type PropsWithChildren, type ReactNode, useEffect, useRef, useState } from 'react';
import { GetCurrentUserUseCase } from '../../../../application/identity/use-cases/get-current-user-use-case';
import {
  type LoginUserCommand,
  LoginUserUseCase,
} from '../../../../application/identity/use-cases/login-user-use-case';
import { LogoutUserUseCase } from '../../../../application/identity/use-cases/logout-user-use-case';
import { RegenerateAvatarUseCase } from '../../../../application/identity/use-cases/regenerate-avatar-use-case';
import {
  type RegisterUserCommand,
  RegisterUserUseCase,
} from '../../../../application/identity/use-cases/register-user-use-case';
import { RequestPasswordResetUseCase } from '../../../../application/identity/use-cases/request-password-reset-use-case';
import { ResetPasswordUseCase } from '../../../../application/identity/use-cases/reset-password-use-case';
import { UpdateProfileUseCase } from '../../../../application/identity/use-cases/update-profile-use-case';
import {
  WORKSPACE_SELECTION_PORT,
  type WorkspaceSelectionPort,
} from '../../../../application/workspace/ports/workspace-selection.port';
import type { User } from '../../../../domains/identity/entities/user';
import type { UpdateProfileInput } from '../../../../domains/identity/ports/auth-repository';
import { isSameAccessTokenSession } from '../../../../infrastructure/identity/access-token-claims';
import { PersistedAuthSessionAdapter } from '../../../../infrastructure/identity/persisted-auth-session.adapter';
import { betterAuthClient } from '../../../../infrastructure/identity/better-auth-client';
import { type AuthContextValue, AuthProvider } from '../../../../presentation/identity/contexts/auth-context';
import { AppProviderOrder, BaseAppProviderFactory } from '../../app-provider-factory';

interface AppAuthProviderDependencies {
  readonly getCurrentUser: GetCurrentUserUseCase;
  readonly requestPasswordReset: RequestPasswordResetUseCase;
  readonly resetPassword: ResetPasswordUseCase;
  readonly authSessionService: PersistedAuthSessionAdapter;
  readonly loginUseCase: LoginUserUseCase;
  readonly registerUseCase: RegisterUserUseCase;
  readonly logoutUseCase: LogoutUserUseCase;
  readonly updateProfileUseCase: UpdateProfileUseCase;
  readonly regenerateAvatarUseCase: RegenerateAvatarUseCase;
  readonly workspaceSelectionService: WorkspaceSelectionPort;
}

interface AppAuthProviderProps extends PropsWithChildren {
  readonly dependencies: AppAuthProviderDependencies;
}

function AppAuthProvider({ children, dependencies }: AppAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);

  const revision = useRef(0);
  const signingOut = useRef<{ readonly accessToken: string | null } | null>(null);
  const validatedAccessToken = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    dependencies.authSessionService.registerHandlers({
      onSessionRefreshed: (session) => {
        if (active && !signingOut.current) {
          validatedAccessToken.current = session.accessToken;
          setUser(session.user);
        }
      },
      onSessionInvalidated: () => {
        revision.current++;
        validatedAccessToken.current = null;
        setHasRestoredSession(true);
        setUser(null);
        dependencies.workspaceSelectionService.clear();
      },
    });

    async function restore() {
      let restorationRevision = revision.current;
      let preservesSession = false;
      try {
        const restored = await dependencies.authSessionService.restore();
        if (
          signingOut.current &&
          (!restored || isSameAccessTokenSession(signingOut.current.accessToken, restored.accessToken))
        )
          return;
        signingOut.current = null;
        restorationRevision = ++revision.current;
        preservesSession = isSameAccessTokenSession(validatedAccessToken.current, restored?.accessToken ?? null);
        if (!preservesSession) {
          if (!restored || validatedAccessToken.current) dependencies.workspaceSelectionService.clear();
          validatedAccessToken.current = null;
          setHasRestoredSession(false);
          setUser(null);
        }
        if (restored) {
          const validatedUser = await dependencies.getCurrentUser.execute();
          if (active && restorationRevision === revision.current) {
            validatedAccessToken.current = restored.accessToken;
            dependencies.authSessionService.updateUser(validatedUser);
            setUser(validatedUser);
          }
        }
      } catch {
        if (active && restorationRevision === revision.current && !preservesSession && !signingOut.current) {
          // Transport authentication failures clear credentials through the invalidation handler.
          // Keep persisted credentials for a later retry, while guest requests remain unauthenticated.
          dependencies.authSessionService.suspend();
          validatedAccessToken.current = null;
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
      dependencies.authSessionService.registerHandlers({});
    };
  }, [dependencies]);

  async function signIn(input: LoginUserCommand): Promise<void> {
    const loginRevision = ++revision.current;
    signingOut.current = null;
    validatedAccessToken.current = null;
    dependencies.authSessionService.suspend();
    setHasRestoredSession(true);
    setUser(null);
    const login = await betterAuthClient.signIn.email({
      email: input.email,
      password: input.password,
    });
    if (login.error) throw new Error(login.error.message || 'SIGN_IN_FAILED');
    const session = await dependencies.authSessionService.restore();
    if (!session) throw new Error('SESSION_CONFIRMATION_FAILED');
    if (loginRevision !== revision.current) return;
    dependencies.workspaceSelectionService.clear();
    dependencies.authSessionService.commit(session);
    validatedAccessToken.current = session.accessToken;
    setUser(session.user);
  }

  async function register(input: RegisterUserCommand): Promise<void> {
    const registration = await betterAuthClient.signUp.email({
      email: input.email,
      password: input.password,
      name: input.username,
    });
    if (registration.error) throw new Error(registration.error.message || 'REGISTRATION_FAILED');
    const session = await dependencies.authSessionService.restore();
    if (!session) throw new Error('SESSION_CONFIRMATION_FAILED');
    revision.current++;
    dependencies.workspaceSelectionService.clear();
    setUser(session.user);
  }

  async function signOut(): Promise<void> {
    const logoutRevision = ++revision.current;
    const logout = { accessToken: validatedAccessToken.current };
    signingOut.current = logout;
    validatedAccessToken.current = null;
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
      if (signingOut.current === logout) signingOut.current = null;
    }
  }

  async function updateProfile(input: UpdateProfileInput): Promise<void> {
    const updateRevision = revision.current;
    const updatedUser = await dependencies.updateProfileUseCase.execute(input);
    if (updateRevision !== revision.current) return;
    dependencies.authSessionService.updateUser(updatedUser);
    setUser(updatedUser);
  }

  async function regenerateAvatar(): Promise<void> {
    const updateRevision = revision.current;
    const updatedUser = await dependencies.regenerateAvatarUseCase.execute();
    if (updateRevision !== revision.current) return;
    dependencies.authSessionService.updateUser(updatedUser);
    setUser(updatedUser);
  }

  const value: AuthContextValue = {
    requestPasswordReset: async (email, locale, captchaToken) => {
      void locale;
      void captchaToken;
      await betterAuthClient.requestPasswordReset({
        email,
        redirectTo: `${globalThis.location.origin}/auth/reset-password`,
      });
    },
    resetPassword: async (token, password) => {
      await betterAuthClient.resetPassword({ newPassword: password, token });
      // Any account session may have been revoked; validate on the next sign-in.
      revision.current++;
      validatedAccessToken.current = null;
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
    @inject(RequestPasswordResetUseCase) private readonly requestPasswordReset: RequestPasswordResetUseCase,
    @inject(ResetPasswordUseCase) private readonly resetPassword: ResetPasswordUseCase,
    @inject(PersistedAuthSessionAdapter)
    private readonly authSessionService: PersistedAuthSessionAdapter,
    @inject(LoginUserUseCase)
    private readonly loginUseCase: LoginUserUseCase,
    @inject(RegisterUserUseCase)
    private readonly registerUseCase: RegisterUserUseCase,
    @inject(LogoutUserUseCase)
    private readonly logoutUseCase: LogoutUserUseCase,
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
      requestPasswordReset: this.requestPasswordReset,
      resetPassword: this.resetPassword,
      authSessionService: this.authSessionService,
      loginUseCase: this.loginUseCase,
      registerUseCase: this.registerUseCase,
      logoutUseCase: this.logoutUseCase,
      updateProfileUseCase: this.updateProfileUseCase,
      regenerateAvatarUseCase: this.regenerateAvatarUseCase,
      workspaceSelectionService: this.workspaceSelectionService,
    };

    return createElement(AppAuthProvider, { dependencies }, children);
  }
}

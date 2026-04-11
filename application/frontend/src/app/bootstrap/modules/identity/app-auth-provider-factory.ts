import { inject, injectable } from 'inversify';
import { createElement, type PropsWithChildren, type ReactNode, useEffect, useState } from 'react';
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
import { UpdateProfileUseCase } from '../../../../application/identity/use-cases/update-profile-use-case';
import {
  WORKSPACE_SELECTION_PORT,
  type WorkspaceSelectionPort,
} from '../../../../application/workspace/contracts/workspace-selection.port';
import type { User } from '../../../../domains/identity/entities/user';
import type { UpdateProfileInput } from '../../../../domains/identity/ports/auth-repository';
import { PersistedAuthSessionAdapter } from '../../../../infrastructure/identity/persisted-auth-session.adapter';
import {
  type AuthContextValue,
  AuthProvider,
} from '../../../../presentation/identity/contexts/auth-context';
import { AppProviderOrder, BaseAppProviderFactory } from '../../app-provider-factory';

interface AppAuthProviderDependencies {
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

  useEffect(() => {
    dependencies.authSessionService.registerHandlers({
      onSessionRefreshed: (session: { readonly user: User }) => {
        setUser(session.user);
      },
      onSessionInvalidated: () => {
        setUser(null);
        dependencies.workspaceSelectionService.clear();
      },
    });

    const restored = dependencies.authSessionService.restore();
    setUser(restored?.user ?? null);
    setHasRestoredSession(true);
  }, [dependencies]);

  async function signIn(input: LoginUserCommand): Promise<void> {
    const session = await dependencies.loginUseCase.execute(input);
    dependencies.authSessionService.commit(session);
    setUser(session.user);
  }

  async function register(input: RegisterUserCommand): Promise<void> {
    await dependencies.registerUseCase.execute(input);
  }

  async function signOut(): Promise<void> {
    try {
      await dependencies.logoutUseCase.execute();
    } finally {
      dependencies.authSessionService.clear();
      dependencies.workspaceSelectionService.clear();
      setUser(null);
    }
  }

  async function updateProfile(input: UpdateProfileInput): Promise<void> {
    const updatedUser = await dependencies.updateProfileUseCase.execute(input);
    dependencies.authSessionService.updateUser(updatedUser);
    setUser(updatedUser);
  }

  async function regenerateAvatar(): Promise<void> {
    const updatedUser = await dependencies.regenerateAvatarUseCase.execute();
    dependencies.authSessionService.updateUser(updatedUser);
    setUser(updatedUser);
  }

  const value: AuthContextValue = {
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

import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import {
  type LoginUserCommand,
  LoginUserUseCase,
} from '../../application/identity/use-cases/login-user-use-case';
import { LogoutUserUseCase } from '../../application/identity/use-cases/logout-user-use-case';
import { RegenerateAvatarUseCase } from '../../application/identity/use-cases/regenerate-avatar-use-case';
import {
  type RegisterUserCommand,
  RegisterUserUseCase,
} from '../../application/identity/use-cases/register-user-use-case';
import { UpdateProfileUseCase } from '../../application/identity/use-cases/update-profile-use-case';
import type { WorkspaceSelectionPort } from '../../application/workspace/contracts/workspace-selection.port';
import type { User } from '../../domains/auth/entities/user';
import type { UpdateProfileInput } from '../../domains/auth/ports/auth-repository';
import {
  type AuthContextValue,
  AuthProvider,
} from '../../presentation/identity/contexts/auth-context';
import { runtimeContainer } from '../composition/runtime-container';
import { TOKENS } from '../composition/tokens';
import { AppAuthSessionRuntime } from './app-auth-session-runtime';

const authSessionService = runtimeContainer.get(AppAuthSessionRuntime);
const loginUseCase = runtimeContainer.get(LoginUserUseCase);
const registerUseCase = runtimeContainer.get(RegisterUserUseCase);
const logoutUseCase = runtimeContainer.get(LogoutUserUseCase);
const updateProfileUseCase = runtimeContainer.get(UpdateProfileUseCase);
const regenerateAvatarUseCase = runtimeContainer.get(RegenerateAvatarUseCase);
const workspaceSelectionService = runtimeContainer.get<WorkspaceSelectionPort>(
  TOKENS.workspaceSelectionPort,
);

export function AppAuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);

  useEffect(() => {
    authSessionService.registerHandlers({
      onSessionRefreshed: (session) => {
        setUser(session.user);
      },
      onSessionInvalidated: () => {
        setUser(null);
        workspaceSelectionService.clear();
      },
    });

    const restored = authSessionService.restore();
    setUser(restored?.user ?? null);
    setHasRestoredSession(true);
  }, []);

  async function signIn(input: LoginUserCommand): Promise<void> {
    const session = await loginUseCase.execute(input);
    authSessionService.commit(session);
    setUser(session.user);
  }

  async function register(input: RegisterUserCommand): Promise<void> {
    await registerUseCase.execute(input);
  }

  async function signOut(): Promise<void> {
    try {
      await logoutUseCase.execute();
    } finally {
      authSessionService.clear();
      workspaceSelectionService.clear();
      setUser(null);
    }
  }

  async function updateProfile(input: UpdateProfileInput): Promise<void> {
    const updatedUser = await updateProfileUseCase.execute(input);
    authSessionService.updateUser(updatedUser);
    setUser(updatedUser);
  }

  async function regenerateAvatar(): Promise<void> {
    const updatedUser = await regenerateAvatarUseCase.execute();
    authSessionService.updateUser(updatedUser);
    setUser(updatedUser);
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    hasRestoredSession,
    signIn,
    register,
    signOut,
    updateProfile,
    regenerateAvatar,
  };

  return <AuthProvider value={value}>{children}</AuthProvider>;
}

import { createContext, type PropsWithChildren, useContext } from 'react';
import type { User } from '../../../domains/identity/entities/user';
import type { UpdateProfileInput } from '../../../domains/identity/ports/auth-repository';
import { PresentationContextErrorCode } from '../../../domains/shared/errors/presentation-context-error-code';

interface SignInFormState {
  readonly email: string;
  readonly password: string;
}

interface RegisterFormState {
  readonly username: string;
  readonly email: string;
  readonly password: string;
}

export interface AuthContextValue {
  readonly user: User | null;
  readonly hasRestoredSession: boolean;
  signIn(input: SignInFormState): Promise<void>;
  register(input: RegisterFormState): Promise<void>;
  signOut(): Promise<void>;
  updateProfile(input: UpdateProfileInput): Promise<void>;
  regenerateAvatar(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps extends PropsWithChildren {
  readonly value: AuthContextValue;
}

export function AuthProvider({ children, value }: AuthProviderProps) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error(PresentationContextErrorCode.AUTH_PROVIDER_REQUIRED);
  }

  return value;
}

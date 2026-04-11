import { usePresentationForm } from '../../../shared/forms/use-presentation-form';
import { usePresentationNavigate } from '../../../shared/routing/router';
import { useAuth } from '../../contexts/auth-context';
import { useAuthFormSubmit } from '../../hooks/use-auth-form-submit';

const DEFAULT_SIGN_IN_REDIRECT = '/workspace/dashboard';

function resolvePostSignInRoute(): string {
  const searchParams = new URLSearchParams(window.location.search);
  const redirectTo = searchParams.get('redirectTo');

  if (!redirectTo || !redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
    return DEFAULT_SIGN_IN_REDIRECT;
  }

  const parsedRedirect = new URL(redirectTo, window.location.origin);

  if (parsedRedirect.pathname === '/identity/sign-in') {
    return DEFAULT_SIGN_IN_REDIRECT;
  }

  return `${parsedRedirect.pathname}${parsedRedirect.search}${parsedRedirect.hash}`;
}

export function useSignInScreenState() {
  const { hasRestoredSession, signIn, signOut, user } = useAuth();
  const navigate = usePresentationNavigate();
  const { errorMessage, clearError, handleError } = useAuthFormSubmit();

  const form = usePresentationForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      clearError();

      try {
        await signIn(value);
        navigate(resolvePostSignInRoute());
      } catch (error) {
        handleError(error);
      }
    },
  });

  return {
    errorMessage,
    form,
    handleNavigateDashboard: () => navigate('/workspace/dashboard'),
    handleSignOut: async () => signOut(),
    hasRestoredSession,
    user,
  };
}

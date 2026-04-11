import { FormSection } from '../../../shared/forms/form-section';
import { PresentationForm } from '../../../shared/forms/presentation-form';
import { SubmitButton } from '../../../shared/forms/submit-button';
import { TextFormField } from '../../../shared/forms/text-form-field';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { StatusBanner } from '../../../shared/ui/feedback/status-banner';
import { ContentStack } from '../../../shared/ui/layout/containers';
import { SupportingText } from '../../../shared/ui/layout/typography';
import { InlineTextLink } from '../../../shared/ui/navigation/links';
import { AuthFormCard } from '../shared/components/auth-form-card';
import { AuthLayout } from '../shared/components/auth-layout';
import { ActiveSessionPanel } from './active-session-panel';
import { useSignInScreenState } from './use-sign-in-screen-state';

export function SignInScreen() {
  const { t } = usePresentationTranslation();
  const { errorMessage, form, handleNavigateDashboard, handleSignOut, hasRestoredSession, user } =
    useSignInScreenState();

  return (
    <AuthLayout>
      <AuthFormCard
        eyebrow={t('auth.signIn.eyebrow')}
        title={t('auth.signIn.title')}
        subtitle={hasRestoredSession ? t('auth.signIn.subtitle') : t('auth.signIn.restoring')}
      >
        {user ? (
          <ActiveSessionPanel
            user={user}
            onNavigateDashboard={handleNavigateDashboard}
            onSignOut={handleSignOut}
          />
        ) : (
          <form.AppForm>
            <PresentationForm form={form}>
              <FormSection
                description={t('auth.signIn.formDescription')}
                legend={t('auth.signIn.formLegend')}
              >
                <ContentStack gap="sm">
                  <form.AppField
                    name="email"
                    validators={{
                      onBlur: ({ value }) =>
                        value.trim().length === 0
                          ? t('auth.form.validation.emailRequired')
                          : undefined,
                    }}
                  >
                    {() => (
                      <TextFormField
                        autoComplete="email"
                        label={t('auth.form.emailLabel')}
                        placeholder={t('auth.form.emailPlaceholder')}
                        required
                        type="email"
                      />
                    )}
                  </form.AppField>
                  <form.AppField
                    name="password"
                    validators={{
                      onBlur: ({ value }) =>
                        value.trim().length === 0
                          ? t('auth.form.validation.passwordRequired')
                          : undefined,
                    }}
                  >
                    {() => (
                      <TextFormField
                        autoComplete="current-password"
                        label={t('auth.form.passwordLabel')}
                        placeholder={t('auth.form.passwordPlaceholder')}
                        required
                        type="password"
                      />
                    )}
                  </form.AppField>
                  <SupportingText>
                    <InlineTextLink to="/identity/forgot-password">
                      {t('auth.signIn.forgotPasswordLink')}
                    </InlineTextLink>
                  </SupportingText>
                </ContentStack>
              </FormSection>

              <StatusBanner tone="error">{errorMessage}</StatusBanner>

              <SubmitButton
                disabled={!hasRestoredSession}
                intent="primary"
                label={t('auth.signIn.submitCta')}
                submittingLabel={t('auth.signIn.submittingCta')}
                width="wide"
              />

              <SupportingText>
                {t('auth.signIn.registerPrompt')}{' '}
                <InlineTextLink to="/identity/register">
                  {t('auth.signIn.registerLink')}
                </InlineTextLink>
              </SupportingText>
            </PresentationForm>
          </form.AppForm>
        )}
      </AuthFormCard>
    </AuthLayout>
  );
}

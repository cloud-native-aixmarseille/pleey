import { FormSection } from '../../../shared/forms/form-section';
import { PresentationForm } from '../../../shared/forms/presentation-form';
import { SubmitButton } from '../../../shared/forms/submit-button';
import { TextFormField } from '../../../shared/forms/text-form-field';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { StatusBanner } from '../../../shared/ui/feedback/status-banner';
import { ContentStack } from '../../../shared/ui/layout/containers';
import { InlineTextLink } from '../../../shared/ui/navigation/links';
import { AuthFormCard } from '../shared/components/auth-form-card';
import { AuthLayout } from '../shared/components/auth-layout';
import { useResetPasswordScreenState } from './use-reset-password-screen-state';

export function ResetPasswordScreen() {
  const { t } = usePresentationTranslation();
  const { form, isSubmitted, hasToken, errorMessage } = useResetPasswordScreenState();

  return (
    <AuthLayout>
      <AuthFormCard eyebrow={t('auth.forgotPassword.eyebrow')} title={t('auth.resetPassword.title')}>
        <ContentStack>
          {isSubmitted ? (
            <>
              <StatusBanner tone="success">{t('auth.resetPassword.success')}</StatusBanner>
              <InlineTextLink to="/identity/sign-in">{t('auth.forgotPassword.backToSignIn')}</InlineTextLink>
            </>
          ) : (
            <>
              {!hasToken ? (
                <StatusBanner tone="error">{t('auth.resetPassword.invalidLink')}</StatusBanner>
              ) : (
                <form.AppForm>
                  <PresentationForm form={form}>
                    {errorMessage && <StatusBanner tone="error">{errorMessage}</StatusBanner>}
                    <FormSection legend={t('auth.resetPassword.newPassword')}>
                      <form.AppField name="password">
                        {() => (
                          <TextFormField
                            autoComplete="new-password"
                            type="password"
                            placeholder={t('auth.form.passwordPlaceholder')}
                            label={t('auth.resetPassword.newPassword')}
                            description={t('auth.resetPassword.passwordPolicy')}
                          />
                        )}
                      </form.AppField>
                      <form.AppField name="confirmPassword">
                        {() => (
                          <TextFormField
                            autoComplete="new-password"
                            type="password"
                            placeholder={t('auth.form.passwordPlaceholder')}
                            label={t('auth.resetPassword.confirmPassword')}
                          />
                        )}
                      </form.AppField>
                    </FormSection>
                    <SubmitButton
                      label={t('auth.resetPassword.submit')}
                      submittingLabel={t('auth.resetPassword.submitting')}
                    />
                  </PresentationForm>
                </form.AppForm>
              )}
              <InlineTextLink to="/identity/forgot-password">{t('auth.resetPassword.requestLink')}</InlineTextLink>
            </>
          )}
        </ContentStack>
      </AuthFormCard>
    </AuthLayout>
  );
}

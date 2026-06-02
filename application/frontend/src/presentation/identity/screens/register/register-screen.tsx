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
import { useRegisterScreenState } from './use-register-screen-state';

export function RegisterScreen() {
  const { t } = usePresentationTranslation();
  const { errorMessage, form, isRegistered } = useRegisterScreenState();

  return (
    <AuthLayout>
      <AuthFormCard
        eyebrow={t('auth.register.eyebrow')}
        title={isRegistered ? t('auth.register.success.title') : t('auth.register.title')}
        subtitle={isRegistered ? undefined : t('auth.register.subtitle')}
      >
        {isRegistered ? (
          <ContentStack>
            <StatusBanner tone="success">{t('auth.register.success.message')}</StatusBanner>
            <InlineTextLink to="/identity/sign-in">{t('auth.register.success.cta')}</InlineTextLink>
          </ContentStack>
        ) : (
          <form.AppForm>
            <PresentationForm form={form}>
              <FormSection
                description={t('auth.register.formDescription')}
                legend={t('auth.register.formLegend')}
              >
                <ContentStack gap="sm">
                  <form.AppField
                    name="username"
                    validators={{
                      onBlur: ({ value }) =>
                        value.trim().length === 0
                          ? t('auth.form.validation.usernameRequired')
                          : undefined,
                    }}
                  >
                    {() => (
                      <TextFormField
                        autoComplete="username"
                        label={t('auth.form.usernameLabel')}
                        placeholder={t('auth.form.usernamePlaceholder')}
                        required
                      />
                    )}
                  </form.AppField>
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
                        autoComplete="new-password"
                        label={t('auth.form.passwordLabel')}
                        placeholder={t('auth.form.passwordPlaceholder')}
                        required
                        type="password"
                      />
                    )}
                  </form.AppField>
                </ContentStack>
              </FormSection>

              <StatusBanner tone="error">{errorMessage}</StatusBanner>

              <SubmitButton
                intent="primary"
                label={t('auth.register.submitCta')}
                submittingLabel={t('auth.register.submittingCta')}
                width="wide"
              />

              <SupportingText>
                {t('auth.register.signInPrompt')}{' '}
                <InlineTextLink to="/identity/sign-in">
                  {t('auth.register.signInLink')}
                </InlineTextLink>
              </SupportingText>
            </PresentationForm>
          </form.AppForm>
        )}
      </AuthFormCard>
    </AuthLayout>
  );
}

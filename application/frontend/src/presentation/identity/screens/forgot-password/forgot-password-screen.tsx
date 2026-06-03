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
import { useForgotPasswordScreenState } from './use-forgot-password-screen-state';

export function ForgotPasswordScreen() {
  const { t } = usePresentationTranslation();
  const { form, isSubmitted } = useForgotPasswordScreenState();

  return (
    <AuthLayout>
      <AuthFormCard
        eyebrow={t('auth.forgotPassword.eyebrow')}
        title={
          isSubmitted ? t('auth.forgotPassword.success.title') : t('auth.forgotPassword.title')
        }
        subtitle={isSubmitted ? undefined : t('auth.forgotPassword.subtitle')}
      >
        {isSubmitted ? (
          <ContentStack>
            <StatusBanner tone="success">{t('auth.forgotPassword.success.message')}</StatusBanner>
            <InlineTextLink to="/identity/sign-in">
              {t('auth.forgotPassword.success.cta')}
            </InlineTextLink>
          </ContentStack>
        ) : (
          <form.AppForm>
            <PresentationForm form={form}>
              <FormSection legend={t('auth.forgotPassword.emailLabel')}>
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
                      label={t('auth.forgotPassword.emailLabel')}
                      placeholder={t('auth.forgotPassword.emailPlaceholder')}
                      type="email"
                    />
                  )}
                </form.AppField>
              </FormSection>

              <SubmitButton
                label={t('auth.forgotPassword.submitCta')}
                submittingLabel={t('auth.forgotPassword.submittingCta')}
              />

              <SupportingText>
                <InlineTextLink to="/identity/sign-in">
                  {t('auth.forgotPassword.backToSignIn')}
                </InlineTextLink>
              </SupportingText>
            </PresentationForm>
          </form.AppForm>
        )}
      </AuthFormCard>
    </AuthLayout>
  );
}

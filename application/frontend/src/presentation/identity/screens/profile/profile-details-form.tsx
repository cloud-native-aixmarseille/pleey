import type { PresentationFormApi } from '../../../../application/shared/contracts/form.port';
import { FormSection } from '../../../shared/forms/form-section';
import { PresentationForm } from '../../../shared/forms/presentation-form';
import { SubmitButton } from '../../../shared/forms/submit-button';
import { TextFormField } from '../../../shared/forms/text-form-field';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { StatusBanner } from '../../../shared/ui/feedback/status-banner';
import { ContentStack } from '../../../shared/ui/layout/containers';
import type { ProfileFormValues } from './profile-form-values';

interface ProfileDetailsFormProps {
  readonly errorMessage: string | null;
  readonly form: PresentationFormApi<ProfileFormValues>;
  readonly successMessage: string | null;
}

export function ProfileDetailsForm({
  errorMessage,
  form,
  successMessage,
}: ProfileDetailsFormProps) {
  const { t } = usePresentationTranslation();

  return (
    <form.AppForm>
      <PresentationForm form={form}>
        <FormSection
          description={t('auth.profile.detailsSection.description')}
          legend={t('auth.profile.detailsSection.legend')}
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
                  value.trim().length === 0 ? t('auth.form.validation.emailRequired') : undefined,
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
          </ContentStack>
        </FormSection>

        <StatusBanner tone="error">{errorMessage}</StatusBanner>
        <StatusBanner tone="success">{successMessage}</StatusBanner>

        <SubmitButton
          intent="primary"
          label={t('auth.profile.submitCta')}
          submittingLabel={t('auth.profile.submittingCta')}
          width="wide"
        />
      </PresentationForm>
    </form.AppForm>
  );
}

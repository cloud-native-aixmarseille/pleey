import type { PresentationFormApi } from '../../../../application/shared/ports/form.port';
import { useFormContext } from '../../../shared/forms/form-context';
import { PresentationForm } from '../../../shared/forms/presentation-form';
import { TextFormField } from '../../../shared/forms/text-form-field';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../shared/ui/actions/button';
import { StatusBanner } from '../../../shared/ui/feedback/status-banner';
import { FormFields } from '../../../shared/ui/forms/frames';
import { AppIcon } from '../../../shared/ui/icons/app-icon';
import { ActionRow, ContentStack, ResponsiveGrid, SplitWrapRow } from '../../../shared/ui/layout/containers';
import { Heading, SupportingText } from '../../../shared/ui/layout/typography';
import type { ProfileFormValues } from './profile-form-values';

interface ProfileDetailsFormProps {
  readonly errorMessage: string | null;
  readonly form: PresentationFormApi<ProfileFormValues>;
  readonly onDiscard: () => void;
  readonly successMessage: string | null;
}

function ProfileFields({ form }: { readonly form: PresentationFormApi<ProfileFormValues> }) {
  const { t } = usePresentationTranslation();
  const context = useFormContext();
  return (
    <context.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <FormFields disabled={isSubmitting}>
          <ResponsiveGrid columns={{ base: 1, sm: 2 }}>
            <form.AppField
              name="username"
              validators={{
                onBlur: ({ value }) =>
                  value.trim().length === 0 ? t('auth.form.validation.usernameRequired') : undefined,
              }}
            >
              {() => (
                <TextFormField
                  autoComplete="username"
                  description={t('auth.profile.detailsSection.usernameHelp')}
                  label={t('auth.form.usernameLabel')}
                  placeholder={t('auth.form.usernamePlaceholder')}
                />
              )}
            </form.AppField>
            <form.AppField
              name="email"
              validators={{
                onBlur: ({ value }) =>
                  value.trim().length === 0
                    ? t('auth.form.validation.emailRequired')
                    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                      ? t('auth.profile.detailsSection.invalidEmail')
                      : undefined,
              }}
            >
              {() => (
                <TextFormField
                  autoComplete="email"
                  description={t('auth.profile.detailsSection.emailHelp')}
                  label={t('auth.form.emailLabel')}
                  placeholder={t('auth.form.emailPlaceholder')}
                  type="email"
                />
              )}
            </form.AppField>
          </ResponsiveGrid>
        </FormFields>
      )}
    </context.Subscribe>
  );
}

export function ProfileDetailsForm({ errorMessage, form, onDiscard, successMessage }: ProfileDetailsFormProps) {
  const { t } = usePresentationTranslation();
  return (
    <ContentStack gap="lg">
      <ContentStack gap="xs">
        <Heading id="profile-details-heading" level={2}>
          {t('auth.profile.detailsSection.legend')}
        </Heading>
        <SupportingText>{t('auth.profile.detailsSection.description')}</SupportingText>
      </ContentStack>
      <form.AppForm>
        <PresentationForm aria-labelledby="profile-details-heading" form={form}>
          <ProfileFields form={form} />
          <StatusBanner tone="error">{errorMessage}</StatusBanner>
          <ProfileFormActions onDiscard={onDiscard} successMessage={successMessage} />
        </PresentationForm>
      </form.AppForm>
    </ContentStack>
  );
}

interface ProfileFormActionsProps {
  readonly onDiscard: () => void;
  readonly successMessage: string | null;
}

function ProfileFormActions({ onDiscard, successMessage }: ProfileFormActionsProps) {
  const form = useFormContext();
  const { t } = usePresentationTranslation();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <form.Subscribe selector={(state) => state.isDefaultValue}>
          {(isDefaultValue) => (
            <>
              {isDefaultValue && <StatusBanner tone="success">{successMessage}</StatusBanner>}
              <SplitWrapRow>
                <SupportingText>
                  {t(isDefaultValue ? 'auth.profile.savedHint' : 'auth.profile.unsavedHint')}
                </SupportingText>
                <ActionRow justify="end">
                  <Button disabled={isDefaultValue || isSubmitting} intent="ghost" onClick={onDiscard}>
                    {t('auth.profile.discardCta')}
                  </Button>
                  <Button
                    disabled={isDefaultValue || isSubmitting}
                    loading={isSubmitting}
                    leftSection={<AppIcon name="save" size={17} />}
                    type="submit"
                  >
                    {t(isSubmitting ? 'auth.profile.submittingCta' : 'auth.profile.submitCta')}
                  </Button>
                </ActionRow>
              </SplitWrapRow>
            </>
          )}
        </form.Subscribe>
      )}
    </form.Subscribe>
  );
}

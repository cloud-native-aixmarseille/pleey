import type { CaptchaAction } from '../../../../../application/identity/ports/captcha-widget.port';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { StatusBanner } from '../../../../shared/ui/feedback/status-banner';
import { ContentStack } from '../../../../shared/ui/layout/containers';
import { useCaptchaWidget } from '../../../contexts/captcha-context';
import type { useCaptcha } from '../../../hooks/use-captcha';

interface SecurityCheckProps {
  readonly action: CaptchaAction;
  readonly captcha: ReturnType<typeof useCaptcha>;
}

export function SecurityCheck({ action, captcha }: SecurityCheckProps) {
  const { t, currentLanguage } = usePresentationTranslation();
  const { Widget } = useCaptchaWidget();

  return (
    <ContentStack gap="xs">
      <Widget
        action={action}
        key={`${currentLanguage}-${captcha.revision}`}
        labels={{
          providerLabel: t('auth.captcha.providerLabel'),
          initial: t('auth.captcha.initial'),
          verifying: t('auth.captcha.verifying'),
          solved: t('auth.captcha.solved'),
          error: t('auth.captcha.error'),
          required: t('auth.captcha.required'),
          troubleshooting: t('auth.captcha.troubleshooting'),
          wasmDisabled: t('auth.captcha.wasmDisabled'),
          groupAriaLabel: t('auth.captcha.groupAriaLabel'),
          verifyAriaLabel: t('auth.captcha.verifyAriaLabel'),
          verifyingAriaLabel: t('auth.captcha.verifyingAriaLabel'),
          verifiedAriaLabel: t('auth.captcha.verifiedAriaLabel'),
          errorAriaLabel: t('auth.captcha.errorAriaLabel'),
        }}
        onError={captcha.reportError}
        onTokenChange={captcha.updateToken}
      />
      <StatusBanner tone="error">{captcha.hasError ? t('auth.captcha.unavailable') : null}</StatusBanner>
    </ContentStack>
  );
}

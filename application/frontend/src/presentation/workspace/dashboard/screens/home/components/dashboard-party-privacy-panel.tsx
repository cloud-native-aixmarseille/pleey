import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { CopyButton } from '../../../../../shared/ui/actions/copy-button';
import { Checkbox } from '../../../../../shared/ui/forms/checkbox';
import { FieldShell } from '../../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../../shared/ui/forms/input';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { ContentStack, WrapRow } from '../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../shared/ui/layout/panels';
import { Eyebrow } from '../../../../../shared/ui/layout/typography';

interface DashboardPartyPrivacyPanelProps {
  readonly isPrivateParty: boolean;
  readonly password: string;
  readonly showPassword: boolean;
  readonly onPrivacyChange: (isPrivateParty: boolean) => void;
  readonly onPasswordChange: (password: string) => void;
  readonly onGeneratePassword: () => void;
  readonly onTogglePassword: () => void;
}

export function DashboardPartyPrivacyPanel({
  isPrivateParty,
  password,
  showPassword,
  onPrivacyChange,
  onPasswordChange,
  onGeneratePassword,
  onTogglePassword,
}: DashboardPartyPrivacyPanelProps) {
  const { t } = usePresentationTranslation();
  const hasPassword = password.trim().length > 0;

  return (
    <InsetPanel padding="md">
      <ContentStack gap="md">
        <Eyebrow>{t('dashboard.games.createParty.privacyHeading')}</Eyebrow>

        <Checkbox
          id="create-party-private"
          label={t('dashboard.games.createParty.privateToggleLabel')}
          description={t('dashboard.games.createParty.privateToggleDescription')}
          checked={isPrivateParty}
          onChange={(event) => onPrivacyChange(event.currentTarget.checked)}
        />

        {isPrivateParty ? (
          <ContentStack gap="sm">
            <FieldShell
              description={t('dashboard.games.createParty.privatePasswordHint')}
              id="create-party-password"
              label={t('dashboard.games.createParty.privatePasswordLabel')}
            >
              <Input
                id="create-party-password"
                onChange={(event) => onPasswordChange(event.target.value)}
                placeholder={t('dashboard.games.createParty.privatePasswordPlaceholder')}
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
            </FieldShell>

            <WrapRow gap="xs">
              <Button
                intent="secondary"
                leftSection={<AppIcon name="feature" size={14} />}
                onClick={onGeneratePassword}
                size="sm"
                type="button"
              >
                {t('dashboard.games.createParty.generatePasswordCta')}
              </Button>
              <CopyButton disabled={!hasPassword} size="sm" textToCopy={password}>
                {t('dashboard.games.createParty.copyPasswordCta')}
              </CopyButton>
              <Button
                disabled={!hasPassword}
                intent="ghost"
                leftSection={<AppIcon name="eye" size={14} />}
                onClick={onTogglePassword}
                size="sm"
                type="button"
              >
                {showPassword
                  ? t('dashboard.games.createParty.hidePasswordCta')
                  : t('dashboard.games.createParty.showPasswordCta')}
              </Button>
            </WrapRow>
          </ContentStack>
        ) : null}
      </ContentStack>
    </InsetPanel>
  );
}

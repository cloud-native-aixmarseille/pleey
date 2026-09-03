import { useEffect, useState } from 'react';
import type { DashboardGameListItem } from '../../../../../../domains/game/management/entities/dashboard-game-list-item';
import type { PartySettings } from '../../../../../../domains/game/party/shared/entities/party-settings';
import type { GameTypeDescriptor } from '../../../../../../domains/game/types/shared/game-type-catalog';
import { usePartyDependencies } from '../../../../../../presentation/game/party/shared/contexts/party-dependencies-context';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { CopyButton } from '../../../../../shared/ui/actions/copy-button';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { Checkbox } from '../../../../../shared/ui/forms/checkbox';
import { FieldShell } from '../../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../../shared/ui/forms/input';
import { AppIcon, type AppIconName } from '../../../../../shared/ui/icons/app-icon';
import { ContentStack, SplitWrapRow, WrapRow } from '../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../shared/ui/layout/panels';
import { Eyebrow, SummaryText, SupportingText } from '../../../../../shared/ui/layout/typography';
import { FormDialog } from '../../../../../shared/ui/overlay/form-dialog';

interface DashboardCreatePartyForm {
  readonly allowJoiningAfterStart: boolean;
  readonly allowOptionChangeAfterVoting: boolean;
  readonly isPrivateParty: boolean;
  readonly privatePartyPassword: string;
  readonly randomizeOptionOrder: boolean;
  readonly randomizeStageOrder: boolean;
}

const DEFAULT_CREATE_PARTY_FORM: DashboardCreatePartyForm = {
  allowJoiningAfterStart: false,
  allowOptionChangeAfterVoting: false,
  isPrivateParty: false,
  privatePartyPassword: '',
  randomizeOptionOrder: false,
  randomizeStageOrder: false,
};

interface DashboardCreatePartyDialogProps {
  readonly defaultPartySettings: PartySettings;
  readonly descriptor?: GameTypeDescriptor;
  readonly game: DashboardGameListItem | null;
  readonly isCreatingParty: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (
    game: DashboardGameListItem,
    options?: { privatePartyPassword?: string; settingsOverride?: Partial<PartySettings> },
  ) => void;
}

export function DashboardCreatePartyDialog({
  defaultPartySettings,
  descriptor,
  game,
  isCreatingParty,
  onClose,
  onSubmit,
}: DashboardCreatePartyDialogProps) {
  const { t } = usePresentationTranslation();
  const { privatePartyPasswordGeneratorPort } = usePartyDependencies();
  const [form, setForm] = useState<DashboardCreatePartyForm>(DEFAULT_CREATE_PARTY_FORM);
  const [showPrivatePartyPassword, setShowPrivatePartyPassword] = useState(false);

  useEffect(() => {
    if (!game) {
      setForm(DEFAULT_CREATE_PARTY_FORM);
      setShowPrivatePartyPassword(false);
      return;
    }

    setForm({
      ...DEFAULT_CREATE_PARTY_FORM,
      allowJoiningAfterStart: defaultPartySettings.allowJoiningAfterStart,
      allowOptionChangeAfterVoting: defaultPartySettings.allowOptionChangeAfterVoting,
      randomizeOptionOrder: defaultPartySettings.randomizeOptionOrder,
      randomizeStageOrder: defaultPartySettings.randomizeStageOrder,
    });
    setShowPrivatePartyPassword(false);
  }, [defaultPartySettings, game]);

  const hasCustomPartySettings =
    form.allowJoiningAfterStart !== defaultPartySettings.allowJoiningAfterStart ||
    form.allowOptionChangeAfterVoting !== defaultPartySettings.allowOptionChangeAfterVoting ||
    form.randomizeOptionOrder !== defaultPartySettings.randomizeOptionOrder ||
    form.randomizeStageOrder !== defaultPartySettings.randomizeStageOrder;
  const gameIconName: AppIconName = (descriptor?.iconKey as AppIconName | undefined) ?? 'game';

  const handleGeneratePrivatePartyPassword = () => {
    const generatedPassword = privatePartyPasswordGeneratorPort.generatePrivatePartyPassword();

    setForm((current) => ({
      ...current,
      isPrivateParty: true,
      privatePartyPassword: generatedPassword,
    }));
    setShowPrivatePartyPassword(true);
  };

  const handleSubmit = () => {
    if (!game) {
      return;
    }

    const normalizedPassword = form.privatePartyPassword.trim();
    const privatePartyPassword = form.isPrivateParty
      ? normalizedPassword.length > 0
        ? normalizedPassword
        : undefined
      : undefined;

    onSubmit(game, {
      privatePartyPassword,
      settingsOverride: hasCustomPartySettings
        ? {
            allowJoiningAfterStart: form.allowJoiningAfterStart,
            allowOptionChangeAfterVoting: form.allowOptionChangeAfterVoting,
            randomizeOptionOrder: form.randomizeOptionOrder,
            randomizeStageOrder: form.randomizeStageOrder,
          }
        : undefined,
    });
    onClose();
  };

  return (
    <FormDialog
      isOpen={game !== null}
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
      title={t('dashboard.games.createParty.title')}
      footer={
        <>
          <Button disabled={game === null || isCreatingParty} intent="primary" type="submit">
            {t('dashboard.games.actions.createParty')}
          </Button>
          <Button intent="ghost" onClick={onClose} type="button">
            {t('common.cancel')}
          </Button>
        </>
      }
    >
      <InsetPanel padding="md" tone="accent">
        <SplitWrapRow align="center" gap="sm">
          <WrapRow gap="sm" wrap="nowrap">
            <AppIcon name={gameIconName} size={22} />
            <ContentStack gap="xs">
              <SummaryText>{game?.title ?? ''}</SummaryText>
              <SupportingText size="sm">
                {t('dashboard.games.createParty.subtitle', {
                  game: game?.title ?? '',
                })}
              </SupportingText>
            </ContentStack>
          </WrapRow>
          <Badge tone={hasCustomPartySettings ? 'accent' : 'neutral'}>
            {hasCustomPartySettings
              ? t('dashboard.games.createParty.customModeBadge')
              : t('dashboard.games.createParty.defaultModeBadge')}
          </Badge>
        </SplitWrapRow>
      </InsetPanel>

      <InsetPanel padding="md">
        <ContentStack gap="md">
          <SplitWrapRow align="center" gap="sm">
            <ContentStack gap="xs">
              <Eyebrow>{t('dashboard.games.createParty.playModeHeading')}</Eyebrow>
              <SupportingText size="sm">{t('dashboard.games.createParty.playModeDescription')}</SupportingText>
            </ContentStack>
            {hasCustomPartySettings ? (
              <Badge icon={<AppIcon name="success" size={12} />} tone="success">
                {t('dashboard.games.createParty.settingsUpdatedBadge')}
              </Badge>
            ) : null}
          </SplitWrapRow>

          <ContentStack gap="sm">
            <Checkbox
              id="create-party-allow-joining-after-start"
              label={t('dashboard.games.createParty.allowJoiningAfterStartLabel')}
              description={t('dashboard.games.createParty.allowJoiningAfterStartDescription')}
              checked={form.allowJoiningAfterStart}
              onChange={(event) => {
                const checked = event.currentTarget.checked;

                setForm((current) => ({
                  ...current,
                  allowJoiningAfterStart: checked,
                }));
              }}
            />
            <Checkbox
              id="create-party-allow-option-change-after-voting"
              label={t('dashboard.games.createParty.allowOptionChangeAfterVotingLabel')}
              description={t('dashboard.games.createParty.allowOptionChangeAfterVotingDescription')}
              checked={form.allowOptionChangeAfterVoting}
              onChange={(event) => {
                const checked = event.currentTarget.checked;

                setForm((current) => ({
                  ...current,
                  allowOptionChangeAfterVoting: checked,
                }));
              }}
            />
            <Checkbox
              id="create-party-randomize-stage-order"
              label={t('dashboard.games.createParty.randomizeStageOrderLabel')}
              description={t('dashboard.games.createParty.randomizeStageOrderDescription')}
              checked={form.randomizeStageOrder}
              onChange={(event) => {
                const checked = event.currentTarget.checked;

                setForm((current) => ({
                  ...current,
                  randomizeStageOrder: checked,
                }));
              }}
            />
            <Checkbox
              id="create-party-randomize-option-order"
              label={t('dashboard.games.createParty.randomizeOptionOrderLabel')}
              description={t('dashboard.games.createParty.randomizeOptionOrderDescription')}
              checked={form.randomizeOptionOrder}
              onChange={(event) => {
                const checked = event.currentTarget.checked;

                setForm((current) => ({
                  ...current,
                  randomizeOptionOrder: checked,
                }));
              }}
            />
          </ContentStack>
        </ContentStack>
      </InsetPanel>

      <InsetPanel padding="md">
        <ContentStack gap="md">
          <Eyebrow>{t('dashboard.games.createParty.privacyHeading')}</Eyebrow>

          <Checkbox
            id="create-party-private"
            label={t('dashboard.games.createParty.privateToggleLabel')}
            description={t('dashboard.games.createParty.privateToggleDescription')}
            checked={form.isPrivateParty}
            onChange={(event) => {
              const isPrivateParty = event.currentTarget.checked;

              setForm((current) => ({
                ...current,
                isPrivateParty,
                privatePartyPassword: isPrivateParty ? current.privatePartyPassword : '',
              }));
            }}
          />

          {form.isPrivateParty ? (
            <ContentStack gap="sm">
              <FieldShell
                description={t('dashboard.games.createParty.privatePasswordHint')}
                id="create-party-password"
                label={t('dashboard.games.createParty.privatePasswordLabel')}
              >
                <Input
                  id="create-party-password"
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      privatePartyPassword: event.target.value,
                    }));
                  }}
                  placeholder={t('dashboard.games.createParty.privatePasswordPlaceholder')}
                  type={showPrivatePartyPassword ? 'text' : 'password'}
                  value={form.privatePartyPassword}
                />
              </FieldShell>

              <WrapRow gap="xs">
                <Button
                  intent="secondary"
                  leftSection={<AppIcon name="feature" size={14} />}
                  onClick={handleGeneratePrivatePartyPassword}
                  size="sm"
                  type="button"
                >
                  {t('dashboard.games.createParty.generatePasswordCta')}
                </Button>
                <CopyButton
                  disabled={form.privatePartyPassword.trim().length === 0}
                  size="sm"
                  textToCopy={form.privatePartyPassword}
                >
                  {t('dashboard.games.createParty.copyPasswordCta')}
                </CopyButton>
                <Button
                  disabled={form.privatePartyPassword.trim().length === 0}
                  intent="ghost"
                  leftSection={<AppIcon name="eye" size={14} />}
                  onClick={() => setShowPrivatePartyPassword((current) => !current)}
                  size="sm"
                  type="button"
                >
                  {showPrivatePartyPassword
                    ? t('dashboard.games.createParty.hidePasswordCta')
                    : t('dashboard.games.createParty.showPasswordCta')}
                </Button>
              </WrapRow>
            </ContentStack>
          ) : null}
        </ContentStack>
      </InsetPanel>
    </FormDialog>
  );
}

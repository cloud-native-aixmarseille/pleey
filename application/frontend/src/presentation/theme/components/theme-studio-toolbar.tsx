import type { ThemePermissions } from '../../../domains/theme/value-objects/theme-permissions';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { Button } from '../../shared/ui/actions/button';
import { IconTriggerButton } from '../../shared/ui/actions/icon-trigger-button';
import { Input } from '../../shared/ui/forms/input';
import { AppIcon } from '../../shared/ui/icons/app-icon';
import { ActionRow, ContentStack, FlexGrowItem, SplitWrapRow, StretchRow } from '../../shared/ui/layout/containers';
import { ElevatedPanel } from '../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../shared/ui/layout/typography';
import { useThemeFieldValidation } from './theme-validation-context';

export function ThemeStudioToolbar({
  name,
  onNameChange,
  onBack,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  disabled,
  saveDisabled,
  savePermission,
  savePermissionReason,
  status,
}: {
  readonly name: string;
  readonly onNameChange: (name: string) => void;
  readonly onBack: () => void;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly disabled: boolean;
  readonly saveDisabled: boolean;
  readonly savePermission?: ThemePermissions['create'];
  readonly savePermissionReason?: string;
  readonly status: string;
}) {
  const { t } = usePresentationTranslation();
  const validation = useThemeFieldValidation('name');
  return (
    <>
      <header>
        <ContentStack gap="md">
          <StretchRow>
            <IconTriggerButton onClick={onBack} disabled={disabled} aria-label={t('theme.management.backToLibrary')}>
              <AppIcon name="arrow-left" />
            </IconTriggerButton>
            <FlexGrowItem>
              <Heading level={1}>{t('theme.studio.title')}</Heading>
            </FlexGrowItem>
          </StretchRow>
          <Input
            label={t('theme.builder.name')}
            {...validation}
            value={name}
            maxLength={80}
            disabled={disabled}
            onChange={(event) => onNameChange(event.target.value)}
            compact
          />
        </ContentStack>
      </header>
      <div className="theme-studio-toolbar">
        <ElevatedPanel>
          <SplitWrapRow gap="sm">
            <div role="status">
              <SupportingText>{t(status)}</SupportingText>
            </div>
            <ActionRow gap="xs">
              <IconTriggerButton onClick={onUndo} disabled={disabled || !canUndo} aria-label={t('theme.studio.undo')}>
                <AppIcon name="undo" />
              </IconTriggerButton>
              <IconTriggerButton onClick={onRedo} disabled={disabled || !canRedo} aria-label={t('theme.studio.redo')}>
                <AppIcon name="redo" />
              </IconTriggerButton>
              <Button
                type="submit"
                size="sm"
                disabled={saveDisabled}
                permission={savePermission}
                permissionReason={savePermissionReason}
                leftSection={<AppIcon name="save" size={16} />}
              >
                {t('theme.builder.save')}
              </Button>
            </ActionRow>
          </SplitWrapRow>
        </ElevatedPanel>
      </div>
    </>
  );
}

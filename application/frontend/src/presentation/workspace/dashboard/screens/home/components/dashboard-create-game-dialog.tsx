import { GameType } from '../../../../../../domains/game/types/shared/game-type';
import type { GameTypeDescriptor } from '../../../../../../domains/game/types/shared/game-type-catalog';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { FieldShell } from '../../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../../shared/ui/forms/input';
import { Select } from '../../../../../shared/ui/forms/select';
import { Textarea } from '../../../../../shared/ui/forms/textarea';
import { SupportingText } from '../../../../../shared/ui/layout/typography';
import { FormDialog } from '../../../../../shared/ui/overlay/form-dialog';

interface DashboardCreateGameForm {
  readonly description: string;
  readonly title: string;
  readonly type: GameType | null;
}

interface DashboardCreateGameDialogProps {
  readonly errorMessage: string | null;
  readonly form: DashboardCreateGameForm;
  readonly gameTypes: readonly GameTypeDescriptor[];
  readonly isCreating: boolean;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onFormChange: (value: Partial<DashboardCreateGameForm>) => void;
  readonly onSubmit: () => void;
}

export function DashboardCreateGameDialog({
  errorMessage,
  form,
  gameTypes,
  isCreating,
  isOpen,
  onClose,
  onFormChange,
  onSubmit,
}: DashboardCreateGameDialogProps) {
  const { t } = usePresentationTranslation();
  const selectedGameType = gameTypes.find((gameType) => gameType.key === form.type);
  const gameTypeValue = form.type ?? '';

  return (
    <FormDialog
      banner={<StatusBanner tone="error">{errorMessage ? t(errorMessage) : null}</StatusBanner>}
      footer={
        <>
          <Button disabled={isCreating} intent="primary" type="submit">
            {isCreating ? t('common.loading') : t('dashboard.games.create.submit')}
          </Button>
          <Button intent="ghost" onClick={onClose} type="button">
            {t('common.cancel')}
          </Button>
        </>
      }
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      title={t('dashboard.games.create.title')}
    >
      <FieldShell id="create-game-type" label={t('dashboard.games.create.typeLabel')} required>
        <Select
          id="create-game-type"
          onChange={(event) =>
            onFormChange({
              type:
                event.target.value === GameType.Prediction
                  ? GameType.Prediction
                  : event.target.value === GameType.Quiz
                    ? GameType.Quiz
                    : null,
            })
          }
          value={gameTypeValue}
        >
          {gameTypes.map((gameType) => (
            <option key={gameType.key} value={gameType.key}>
              {t(gameType.titleKey)}
            </option>
          ))}
        </Select>
      </FieldShell>
      {selectedGameType ? <SupportingText>{t(selectedGameType.descriptionKey)}</SupportingText> : null}
      <FieldShell id="create-game-title" label={t('dashboard.games.create.titleLabel')} required>
        <Input
          id="create-game-title"
          onChange={(event) => onFormChange({ title: event.target.value })}
          value={form.title}
        />
      </FieldShell>
      <FieldShell id="create-game-description" label={t('dashboard.games.create.descriptionLabel')}>
        <Textarea
          id="create-game-description"
          onChange={(event) => onFormChange({ description: event.target.value })}
          rows={3}
          value={form.description}
        />
      </FieldShell>
    </FormDialog>
  );
}

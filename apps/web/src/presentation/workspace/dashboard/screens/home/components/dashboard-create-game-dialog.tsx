import type { GameTypeDescriptor } from '../../../../../../domains/game/types/shared/game-type-catalog';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { FormDialog } from '../../../../../shared/ui/overlay/form-dialog';
import { DashboardGameFormFields } from './dashboard-game-form-fields';
import type { DashboardGameFormValues } from './dashboard-game-form-values';

interface DashboardCreateGameDialogProps {
  readonly errorMessage: string | null;
  readonly form: DashboardGameFormValues;
  readonly gameTypes: readonly GameTypeDescriptor[];
  readonly isCreating: boolean;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onFormChange: (value: Partial<DashboardGameFormValues>) => void;
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
      <DashboardGameFormFields
        form={form}
        gameTypes={gameTypes}
        keyPrefix="dashboard.games.create"
        idPrefix="create-game"
        onFormChange={onFormChange}
      />
    </FormDialog>
  );
}

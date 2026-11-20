import type { GameTypeDescriptor } from '../../../../../../domains/game/types/shared/game-type-catalog';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { FieldShell } from '../../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../../shared/ui/forms/input';
import { Select } from '../../../../../shared/ui/forms/select';
import { Textarea } from '../../../../../shared/ui/forms/textarea';
import { SupportingText } from '../../../../../shared/ui/layout/typography';
import type { DashboardGameFormValues } from './dashboard-game-form-values';
import { resolveDashboardGameTypeFromInput } from './dashboard-game-form-values';

interface DashboardGameFormFieldsProps {
  readonly form: DashboardGameFormValues;
  readonly gameTypes: readonly GameTypeDescriptor[];
  readonly keyPrefix: 'dashboard.games.create' | 'dashboard.games.import';
  readonly idPrefix: 'create-game' | 'import-game';
  readonly onFormChange: (value: Partial<DashboardGameFormValues>) => void;
}

export function DashboardGameFormFields({
  form,
  gameTypes,
  keyPrefix,
  idPrefix,
  onFormChange,
}: DashboardGameFormFieldsProps) {
  const { t } = usePresentationTranslation();
  const selectedGameType = gameTypes.find((gameType) => gameType.key === form.type);
  const gameTypeValue = form.type ?? '';

  return (
    <>
      <FieldShell id={`${idPrefix}-type`} label={t(`${keyPrefix}.typeLabel`)} required>
        <Select
          id={`${idPrefix}-type`}
          onChange={(event) =>
            onFormChange({
              type: resolveDashboardGameTypeFromInput(event.target.value),
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

      <FieldShell id={`${idPrefix}-title`} label={t(`${keyPrefix}.titleLabel`)} required>
        <Input
          id={`${idPrefix}-title`}
          onChange={(event) => onFormChange({ title: event.target.value })}
          value={form.title}
        />
      </FieldShell>

      <FieldShell id={`${idPrefix}-description`} label={t(`${keyPrefix}.descriptionLabel`)}>
        <Textarea
          id={`${idPrefix}-description`}
          onChange={(event) => onFormChange({ description: event.target.value })}
          rows={3}
          value={form.description}
        />
      </FieldShell>
    </>
  );
}

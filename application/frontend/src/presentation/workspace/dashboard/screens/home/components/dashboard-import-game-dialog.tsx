import type { PlayableContentImportExampleProvider } from '../../../../../../application/game/types/shared/contracts/playable-content-import.gateway';
import { PlayableContentImportExampleFormat as ImportExampleFormat } from '../../../../../../application/game/types/shared/contracts/playable-content-import.gateway';
import { GameType } from '../../../../../../domains/game/types/shared/game-type';
import type { GameTypeDescriptor } from '../../../../../../domains/game/types/shared/game-type-catalog';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { FieldShell } from '../../../../../shared/ui/forms/field-shell';
import { FileUploadDropzone } from '../../../../../shared/ui/forms/file-upload-dropzone';
import { Input } from '../../../../../shared/ui/forms/input';
import { Select } from '../../../../../shared/ui/forms/select';
import { Textarea } from '../../../../../shared/ui/forms/textarea';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { ContentStack, WrapRow } from '../../../../../shared/ui/layout/containers';
import { SupportingText } from '../../../../../shared/ui/layout/typography';
import { FormDialog } from '../../../../../shared/ui/overlay/form-dialog';

interface DashboardImportGameForm {
  readonly description: string;
  readonly title: string;
  readonly type: GameType | null;
}

interface DashboardImportGameDialogProps {
  readonly errorMessage: string | null;
  readonly exampleProvider: PlayableContentImportExampleProvider | null;
  readonly acceptedFileTypes: string;
  readonly file: File | null;
  readonly form: DashboardImportGameForm;
  readonly gameTypes: readonly GameTypeDescriptor[];
  readonly isImporting: boolean;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onFileChange: (file: File | null) => void;
  readonly onFormChange: (value: Partial<DashboardImportGameForm>) => void;
  readonly onSubmit: () => void;
}

const exampleTemplateLabelKeys: Record<ImportExampleFormat, string> = {
  [ImportExampleFormat.CSV]: 'dashboard.games.import.templateCsv',
  [ImportExampleFormat.JSON]: 'dashboard.games.import.templateJson',
  [ImportExampleFormat.MARKDOWN]: 'dashboard.games.import.templateMarkdown',
  [ImportExampleFormat.PLAINTEXT]: 'dashboard.games.import.templatePlaintext',
};

export function DashboardImportGameDialog({
  errorMessage,
  exampleProvider,
  acceptedFileTypes,
  file,
  form,
  gameTypes,
  isImporting,
  isOpen,
  onClose,
  onFileChange,
  onFormChange,
  onSubmit,
}: DashboardImportGameDialogProps) {
  const { t } = usePresentationTranslation();
  const selectedGameType = gameTypes.find((gameType) => gameType.key === form.type);
  const gameTypeValue = form.type ?? '';
  const canSubmit = form.title.trim().length > 0 && file !== null;

  const handleDownloadExample = (format: ImportExampleFormat) => {
    if (!exampleProvider) {
      return;
    }

    const example = exampleProvider.create(format);
    const blob = new Blob([example.content], { type: example.mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = objectUrl;
    anchor.download = example.fileName;
    document.body.append(anchor);
    anchor.click();

    window.setTimeout(() => {
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    }, 0);
  };

  return (
    <FormDialog
      banner={<StatusBanner tone="error">{errorMessage ? t(errorMessage) : null}</StatusBanner>}
      footer={
        <>
          <Button disabled={isImporting || !canSubmit} intent="primary" type="submit">
            {isImporting ? t('dashboard.games.import.pending') : t('dashboard.games.import.submit')}
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
      title={t('dashboard.games.import.title')}
    >
      <SupportingText>{t('dashboard.games.import.description')}</SupportingText>

      <FieldShell id="import-game-type" label={t('dashboard.games.import.typeLabel')} required>
        <Select
          id="import-game-type"
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
      {selectedGameType ? (
        <SupportingText>{t(selectedGameType.descriptionKey)}</SupportingText>
      ) : null}

      <FieldShell id="import-game-title" label={t('dashboard.games.import.titleLabel')} required>
        <Input
          id="import-game-title"
          onChange={(event) => onFormChange({ title: event.target.value })}
          value={form.title}
        />
      </FieldShell>

      <FieldShell id="import-game-description" label={t('dashboard.games.import.descriptionLabel')}>
        <Textarea
          id="import-game-description"
          onChange={(event) => onFormChange({ description: event.target.value })}
          rows={3}
          value={form.description}
        />
      </FieldShell>

      <FileUploadDropzone
        acceptedFileTypes={acceptedFileTypes}
        activePrompt={t('dashboard.games.import.dropzoneActive')}
        clearFileLabel={t('dashboard.games.import.clearFile')}
        file={file}
        fieldHelpText={t('dashboard.games.import.fieldHelp')}
        inputAriaLabel={t('dashboard.games.import.chooseFile')}
        inputId="import-game-file"
        label={t('dashboard.games.import.fileLabel')}
        onFileSelect={onFileChange}
        prompt={t('dashboard.games.import.dropzonePrompt')}
        replaceFileLabel={t('dashboard.games.import.replaceFile')}
      />

      {exampleProvider ? (
        <ContentStack gap="xs">
          <SupportingText tone="soft">{t('dashboard.games.import.templatesLabel')}</SupportingText>
          <WrapRow gap="xs">
            {exampleProvider.listFormats().map((format) => (
              <Button
                intent="ghost"
                key={format}
                leftSection={<AppIcon name="arrow-down" size={14} />}
                onClick={() => handleDownloadExample(format)}
                size="sm"
                type="button"
              >
                {t(exampleTemplateLabelKeys[format])}
              </Button>
            ))}
          </WrapRow>
        </ContentStack>
      ) : null}
    </FormDialog>
  );
}

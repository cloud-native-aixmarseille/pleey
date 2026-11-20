import type { PlayableContentImportExampleProvider } from '../../../../../../application/game/types/shared/ports/playable-content-import-example-provider.port';
import { PlayableContentImportExampleFormat as ImportExampleFormat } from '../../../../../../application/game/types/shared/ports/playable-content-import-example-provider.port';
import type { GameTypeDescriptor } from '../../../../../../domains/game/types/shared/game-type-catalog';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { FileUploadDropzone } from '../../../../../shared/ui/forms/file-upload-dropzone';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { ContentStack, WrapRow } from '../../../../../shared/ui/layout/containers';
import { SupportingText } from '../../../../../shared/ui/layout/typography';
import { FormDialog } from '../../../../../shared/ui/overlay/form-dialog';
import { DashboardGameFormFields } from './dashboard-game-form-fields';
import type { DashboardGameFormValues } from './dashboard-game-form-values';

interface DashboardImportGameDialogProps {
  readonly errorMessage: string | null;
  readonly exampleProvider: PlayableContentImportExampleProvider | null;
  readonly acceptedFileTypes: string;
  readonly file: File | null;
  readonly form: DashboardGameFormValues;
  readonly gameTypes: readonly GameTypeDescriptor[];
  readonly isImporting: boolean;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onFileChange: (file: File | null) => void;
  readonly onFormChange: (value: Partial<DashboardGameFormValues>) => void;
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

      <DashboardGameFormFields
        form={form}
        gameTypes={gameTypes}
        keyPrefix="dashboard.games.import"
        idPrefix="import-game"
        onFormChange={onFormChange}
      />

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

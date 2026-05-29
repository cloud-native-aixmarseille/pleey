import { Box, Group, UnstyledButton } from '@mantine/core';
import { type CSSProperties, type DragEvent, useRef, useState } from 'react';
import type { PlayableContentImportExampleProvider } from '../../../../../../application/game/types/shared/contracts/playable-content-import.gateway';
import { PlayableContentImportExampleFormat as ImportExampleFormat } from '../../../../../../application/game/types/shared/contracts/playable-content-import.gateway';
import { GameType } from '../../../../../../domains/game/types/shared/game-type';
import type { GameTypeDescriptor } from '../../../../../../domains/game/types/shared/game-type-catalog';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { FieldShell } from '../../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../../shared/ui/forms/input';
import { Select } from '../../../../../shared/ui/forms/select';
import { Textarea } from '../../../../../shared/ui/forms/textarea';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { ContentStack, SplitWrapRow, WrapRow } from '../../../../../shared/ui/layout/containers';
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

const hiddenInputStyle: CSSProperties = { display: 'none' };

const dropzoneTransition = `border-color ${uiThemeTokens.motion.standard}, background ${uiThemeTokens.motion.standard}, box-shadow ${uiThemeTokens.motion.standard}`;

const dropzoneBaseStyle: CSSProperties = {
  background: uiThemeTokens.color.surface.recessed,
  border: `1.5px dashed ${uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.panel,
  transition: dropzoneTransition,
};

const dropzoneActiveStyle: CSSProperties = {
  background: uiThemeTokens.color.surface.accentMuted,
  border: `1.5px dashed ${uiThemeTokens.color.border.accent}`,
  boxShadow: uiThemeTokens.shadow.accentGlow,
};

const dropzoneButtonStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.sm,
  padding: `${uiThemeTokens.spacing.xl} ${uiThemeTokens.spacing.lg}`,
  textAlign: 'center',
  width: '100%',
};

const dropzoneSelectedStyle: CSSProperties = { padding: uiThemeTokens.spacing.md };

const promptIconRingStyle: CSSProperties = {
  alignItems: 'center',
  background: uiThemeTokens.color.surface.accentMuted,
  border: `1px solid ${uiThemeTokens.color.border.accent}`,
  borderRadius: uiThemeTokens.radius.pill,
  color: uiThemeTokens.color.text.primary,
  display: 'flex',
  height: '3.25rem',
  justifyContent: 'center',
  width: '3.25rem',
};

const fileIconTileStyle: CSSProperties = {
  alignItems: 'center',
  background: uiThemeTokens.color.surface.field,
  border: `1px solid ${uiThemeTokens.color.border.success}`,
  borderRadius: uiThemeTokens.radius.field,
  color: uiThemeTokens.color.text.primary,
  display: 'flex',
  flexShrink: 0,
  height: '2.75rem',
  justifyContent: 'center',
  width: '2.75rem',
};

const fileNameStyle: CSSProperties = {
  color: uiThemeTokens.color.text.primary,
  fontWeight: 700,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
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
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragDepthRef = useRef(0);
  const selectedGameType = gameTypes.find((gameType) => gameType.key === form.type);
  const gameTypeValue = form.type ?? '';
  const canSubmit = form.title.trim().length > 0 && file !== null;
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const selectFile = (nextFile: File | null) => {
    onFileChange(nextFile);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDragActive(true);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);

    if (dragDepthRef.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragActive(false);
    selectFile(event.dataTransfer.files?.[0] ?? null);
  };

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

  const dropzoneStyle: CSSProperties = {
    ...dropzoneBaseStyle,
    ...(isDragActive ? dropzoneActiveStyle : null),
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

      <input
        accept={acceptedFileTypes}
        aria-label={t('dashboard.games.import.fileLabel')}
        onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
        ref={fileInputRef}
        style={hiddenInputStyle}
        type="file"
      />

      <Box
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={dropzoneStyle}
      >
        {file ? (
          <Box style={dropzoneSelectedStyle}>
            <SplitWrapRow align="center" gap="sm">
              <Group gap="sm" wrap="nowrap">
                <Box style={fileIconTileStyle}>
                  <AppIcon name="success" size={22} />
                </Box>
                <ContentStack gap="xs">
                  <Box component="span" style={fileNameStyle}>
                    {file.name}
                  </Box>
                  <Group gap="xs">
                    <Badge tone="success">{formatFileFormat(file.name)}</Badge>
                    <Badge tone="neutral">{formatFileSize(file.size)}</Badge>
                  </Group>
                </ContentStack>
              </Group>
              <Group gap="xs" wrap="nowrap">
                <Button intent="ghost" onClick={openFilePicker} size="sm" type="button">
                  {t('dashboard.games.import.replaceFile')}
                </Button>
                <Button intent="ghost" onClick={() => selectFile(null)} size="sm" type="button">
                  {t('dashboard.games.import.clearFile')}
                </Button>
              </Group>
            </SplitWrapRow>
          </Box>
        ) : (
          <UnstyledButton
            aria-label={t('dashboard.games.import.chooseFile')}
            onClick={openFilePicker}
            style={dropzoneButtonStyle}
            type="button"
          >
            <Box style={promptIconRingStyle}>
              <AppIcon name="arrow-up" size={26} />
            </Box>
            <SupportingText size="md">
              {t(
                isDragActive
                  ? 'dashboard.games.import.dropzoneActive'
                  : 'dashboard.games.import.dropzonePrompt',
              )}
            </SupportingText>
            <SupportingText tone="soft">{t('dashboard.games.import.fieldHelp')}</SupportingText>
          </UnstyledButton>
        )}
      </Box>

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

function formatFileFormat(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  const extension = dotIndex >= 0 ? fileName.slice(dotIndex + 1) : '';

  return extension ? extension.toUpperCase() : 'FILE';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(kilobytes < 10 ? 1 : 0)} KB`;
  }

  const megabytes = kilobytes / 1024;

  return `${megabytes.toFixed(megabytes < 10 ? 1 : 0)} MB`;
}

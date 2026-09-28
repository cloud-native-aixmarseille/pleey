import { Box } from '@mantine/core';
import { useEffect, useState } from 'react';
import type { PlayableMedia } from '../../../../../domains/game/types/shared/management/playable-management';
import { Button } from '../../../../shared/ui/actions/button';
import { Badge } from '../../../../shared/ui/feedback/badge';
import { FileDropFieldset } from '../../../../shared/ui/forms/file-drop-fieldset';
import { FileFieldMessages } from '../../../../shared/ui/forms/file-field-messages';
import { formatFileFormat, formatFileSize, formatMimeTypeFormat } from '../../../../shared/ui/forms/file-metadata';
import { FilePickerButton } from '../../../../shared/ui/forms/file-picker-button';
import { AccentIconBadge } from '../../../../shared/ui/icons/accent-icon-badge';
import { AppIcon, type AppIconName } from '../../../../shared/ui/icons/app-icon';
import { ContentStack, FlexGrowItem, SplitWrapRow, StretchRow, WrapRow } from '../../../../shared/ui/layout/containers';
import { SummaryText } from '../../../../shared/ui/layout/typography';
import { MediaPreview } from '../../../../shared/ui/media/media-preview';
import { PlayableQuestionMedia } from './playable-question-media';

interface FileInputProps {
  readonly 'aria-describedby': string;
  readonly 'aria-invalid': boolean;
  readonly 'aria-label': string;
  readonly id?: string;
}

interface PlayableMediaFieldProps {
  readonly acceptedMimeTypes: string;
  readonly activePrompt: string;
  readonly discardLabel: string;
  readonly error?: string;
  readonly helpText: string;
  readonly inputId?: string;
  readonly media: PlayableMedia | null;
  readonly mediaFile: File | null;
  readonly onFileSelect: (file: File | null) => void;
  readonly onRemovePersisted: () => void;
  readonly pickerLabel: string;
  readonly previewLabel: string;
  readonly prompt: string;
  readonly questionText: string;
  readonly removeLabel: string;
  readonly replaceLabel: string;
  readonly savedLabel: string;
  readonly unsavedLabel: string;
}

function resolveMediaTypeIcon(mimeType: string): AppIconName {
  if (mimeType.startsWith('audio/')) {
    return 'audio';
  }

  if (mimeType.startsWith('video/')) {
    return 'video';
  }

  return 'image';
}

function SelectedFilePreview({ file, label }: { readonly file: File; readonly label: string }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!objectUrl || !file.type) {
    return null;
  }

  return <MediaPreview label={label} mimeType={file.type} src={objectUrl} testId="playable-item-media-preview" />;
}

export function PlayableMediaField({
  acceptedMimeTypes,
  activePrompt,
  discardLabel,
  error,
  helpText,
  inputId = 'playable-item-media',
  media,
  mediaFile,
  onFileSelect,
  onRemovePersisted,
  pickerLabel,
  previewLabel,
  prompt,
  questionText,
  removeLabel,
  replaceLabel,
  savedLabel,
  unsavedLabel,
}: PlayableMediaFieldProps) {
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const describedBy = error ? `${helpId} ${errorId}` : helpId;
  const inputProps: FileInputProps = {
    'aria-describedby': describedBy,
    'aria-invalid': Boolean(error),
    'aria-label': pickerLabel,
    id: inputId,
  };

  const previewAltText = questionText.trim() || previewLabel;

  const replaceButton = (
    <FilePickerButton accept={acceptedMimeTypes} inputProps={inputProps} onSelect={onFileSelect}>
      {({ onClick }) => (
        <Button
          aria-describedby={describedBy}
          intent="ghost"
          leftSection={<AppIcon name="arrow-up" size={14} />}
          onClick={onClick}
          size="sm"
          type="button"
        >
          {replaceLabel}
        </Button>
      )}
    </FilePickerButton>
  );

  return (
    <FileDropFieldset ariaLabel={pickerLabel} onFileDrop={onFileSelect}>
      {({ isDragActive }) => (
        <>
          {mediaFile !== null ? (
            <Box p="md">
              <ContentStack gap="sm">
                <SelectedFilePreview file={mediaFile} label={previewAltText} />
                <SplitWrapRow align="center" gap="sm">
                  <StretchRow gap="sm">
                    <AccentIconBadge size={44}>
                      <AppIcon name={resolveMediaTypeIcon(mediaFile.type)} size={22} />
                    </AccentIconBadge>
                    <FlexGrowItem>
                      <ContentStack gap="xs">
                        <SummaryText>{mediaFile.name}</SummaryText>
                        <WrapRow gap="xs">
                          <Badge tone={error ? 'error' : 'neutral'}>{formatFileFormat(mediaFile.name)}</Badge>
                          <Badge tone="neutral">{formatFileSize(mediaFile.size)}</Badge>
                          {error ? null : (
                            <Badge icon={<AppIcon name="pending" size={12} />} tone="warning">
                              {unsavedLabel}
                            </Badge>
                          )}
                        </WrapRow>
                      </ContentStack>
                    </FlexGrowItem>
                  </StretchRow>
                  <WrapRow gap="xs" wrap="nowrap">
                    {replaceButton}
                    <Button
                      intent="ghost"
                      leftSection={<AppIcon name="trash" size={14} />}
                      onClick={() => onFileSelect(null)}
                      size="sm"
                      type="button"
                    >
                      {discardLabel}
                    </Button>
                  </WrapRow>
                </SplitWrapRow>
              </ContentStack>
            </Box>
          ) : media !== null ? (
            <Box p="md">
              <ContentStack gap="sm">
                <PlayableQuestionMedia
                  media={media}
                  questionText={previewAltText}
                  testId="playable-item-media-preview"
                />
                <SplitWrapRow align="center" gap="sm">
                  <StretchRow gap="sm">
                    <AccentIconBadge size={44}>
                      <AppIcon name={resolveMediaTypeIcon(media.mimeType)} size={22} />
                    </AccentIconBadge>
                    <WrapRow gap="xs">
                      <Badge icon={<AppIcon name="success" size={12} />} tone="success">
                        {savedLabel}
                      </Badge>
                      <Badge tone="neutral">{formatMimeTypeFormat(media.mimeType)}</Badge>
                    </WrapRow>
                  </StretchRow>
                  <WrapRow gap="xs" wrap="nowrap">
                    {replaceButton}
                    <Button
                      intent="ghost"
                      leftSection={<AppIcon name="trash" size={14} />}
                      onClick={onRemovePersisted}
                      size="sm"
                      type="button"
                    >
                      {removeLabel}
                    </Button>
                  </WrapRow>
                </SplitWrapRow>
              </ContentStack>
            </Box>
          ) : (
            <Box p="lg">
              <ContentStack align="center" gap="sm">
                <AccentIconBadge size={52}>
                  <AppIcon name="image" size={26} />
                </AccentIconBadge>
                <SummaryText>{isDragActive ? activePrompt : prompt}</SummaryText>
                <FilePickerButton accept={acceptedMimeTypes} inputProps={inputProps} onSelect={onFileSelect}>
                  {({ onClick }) => (
                    <Button
                      aria-describedby={describedBy}
                      intent="secondary"
                      leftSection={<AppIcon name="arrow-up" size={14} />}
                      onClick={onClick}
                      size="sm"
                      type="button"
                    >
                      {pickerLabel}
                    </Button>
                  )}
                </FilePickerButton>
              </ContentStack>
            </Box>
          )}
          <Box p="md" pt={0}>
            <FileFieldMessages error={error} errorId={errorId} helpId={helpId} helpText={helpText} />
          </Box>
        </>
      )}
    </FileDropFieldset>
  );
}

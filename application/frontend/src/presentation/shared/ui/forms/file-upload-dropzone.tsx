import { Box, Center, Text } from '@mantine/core';
import { type DragEvent, useRef, useState } from 'react';
import { Button } from '../actions/button';
import { PromptSurfaceButton } from '../actions/prompt-surface-button';
import { Badge } from '../feedback/badge';
import { uiThemeTokens } from '../foundation/ui-theme';
import { AccentIconBadge } from '../icons/accent-icon-badge';
import { AppIcon } from '../icons/app-icon';
import {
  ContentStack,
  FlexGrowItem,
  SplitWrapRow,
  StretchRow,
  WrapRow,
} from '../layout/containers';
import { SupportingText } from '../layout/typography';
import { FilePickerButton } from './file-picker-button';

interface FileUploadDropzoneProps {
  readonly acceptedFileTypes: string;
  readonly activePrompt: string;
  readonly clearFileLabel: string;
  readonly file: File | null;
  readonly fieldHelpText: string;
  readonly inputId?: string;
  readonly inputAriaLabel: string;
  readonly label?: string;
  readonly onFileSelect: (file: File | null) => void;
  readonly prompt: string;
  readonly replaceFileLabel: string;
}

const dropzoneTransition = `border-color ${uiThemeTokens.motion.standard}, background ${uiThemeTokens.motion.standard}, box-shadow ${uiThemeTokens.motion.standard}`;

const dropzoneBaseStyle = {
  background: `linear-gradient(180deg, ${uiThemeTokens.color.surface.accentMuted} 0%, ${uiThemeTokens.color.surface.recessed} 100%)`,
  border: `2px dashed ${uiThemeTokens.color.border.accent}`,
  borderRadius: uiThemeTokens.radius.panel,
  boxShadow: uiThemeTokens.shadow.subtle,
  margin: 0,
  minWidth: 0,
  padding: 0,
  position: 'relative',
  transition: dropzoneTransition,
} as const;

const dropzoneActiveStyle = {
  background: `linear-gradient(180deg, color-mix(in srgb, ${uiThemeTokens.color.brand.primary} 10%, ${uiThemeTokens.color.surface.accentMuted}) 0%, ${uiThemeTokens.color.surface.accentMuted} 100%)`,
  border: `2px dashed ${uiThemeTokens.color.border.accent}`,
  boxShadow: uiThemeTokens.shadow.accentGlow,
} as const;

export function FileUploadDropzone({
  acceptedFileTypes,
  activePrompt,
  clearFileLabel,
  file,
  fieldHelpText,
  inputId,
  inputAriaLabel,
  label,
  onFileSelect,
  prompt,
  replaceFileLabel,
}: FileUploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const dragDepthRef = useRef(0);

  const handleDragEnter = (event: DragEvent<HTMLFieldSetElement>) => {
    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDragActive(true);
  };

  const handleDragOver = (event: DragEvent<HTMLFieldSetElement>) => {
    event.preventDefault();
  };

  const handleDragLeave = (event: DragEvent<HTMLFieldSetElement>) => {
    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);

    if (dragDepthRef.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLFieldSetElement>) => {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragActive(false);
    onFileSelect(event.dataTransfer.files?.[0] ?? null);
  };

  const dropzoneStyle = {
    ...dropzoneBaseStyle,
    ...(isDragActive ? dropzoneActiveStyle : null),
  };

  const dropzoneLabel = label ? (
    <Text
      c={uiThemeTokens.color.text.secondary}
      component={inputId ? 'label' : 'p'}
      ff={uiThemeTokens.typography.bodyFamily}
      fw={700}
      htmlFor={inputId}
      lts="0.06em"
      size="sm"
      style={{
        background: uiThemeTokens.color.surface.field,
        border: `1px solid ${uiThemeTokens.color.border.accent}`,
        borderRadius: uiThemeTokens.radius.pill,
        boxShadow: uiThemeTokens.shadow.subtle,
        left: uiThemeTokens.spacing.md,
        padding: `${uiThemeTokens.spacing.xs} ${uiThemeTokens.spacing.sm}`,
        position: 'absolute',
        top: uiThemeTokens.spacing.md,
        textTransform: 'uppercase',
        zIndex: 1,
      }}
    >
      {label}
    </Text>
  ) : null;

  const promptHeadline = isDragActive ? activePrompt : prompt;

  return (
    <Box
      aria-label={inputAriaLabel}
      component="fieldset"
      m={0}
      miw={0}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      p={0}
      style={dropzoneStyle}
    >
      {dropzoneLabel}
      {file ? (
        <Box p="md" pt="3.5rem">
          <ContentStack gap="sm">
            <SplitWrapRow align="center" gap="sm">
              <StretchRow gap="sm">
                <Box
                  style={{
                    background: uiThemeTokens.color.surface.field,
                    border: `1px solid ${uiThemeTokens.color.border.success}`,
                    borderRadius: uiThemeTokens.radius.field,
                    color: uiThemeTokens.color.text.primary,
                    height: '2.75rem',
                    minWidth: '2.75rem',
                    width: '2.75rem',
                  }}
                >
                  <Center h="100%">
                    <AppIcon name="success" size={22} />
                  </Center>
                </Box>
                <FlexGrowItem>
                  <ContentStack gap="xs">
                    <Text c={uiThemeTokens.color.text.primary} fw={700} truncate="end">
                      {file.name}
                    </Text>
                    <WrapRow gap="xs">
                      <Badge tone="success">{formatFileFormat(file.name)}</Badge>
                      <Badge tone="neutral">{formatFileSize(file.size)}</Badge>
                    </WrapRow>
                  </ContentStack>
                </FlexGrowItem>
              </StretchRow>
              <WrapRow gap="xs" wrap="nowrap">
                <FilePickerButton
                  accept={acceptedFileTypes}
                  inputProps={{ 'aria-label': inputAriaLabel, id: inputId }}
                  onSelect={onFileSelect}
                >
                  {({ onClick }) => (
                    <Button intent="ghost" onClick={onClick} size="sm" type="button">
                      {replaceFileLabel}
                    </Button>
                  )}
                </FilePickerButton>
                <Button intent="ghost" onClick={() => onFileSelect(null)} size="sm" type="button">
                  {clearFileLabel}
                </Button>
              </WrapRow>
            </SplitWrapRow>
          </ContentStack>
        </Box>
      ) : (
        <FilePickerButton
          accept={acceptedFileTypes}
          inputProps={{ 'aria-label': inputAriaLabel, id: inputId }}
          onSelect={onFileSelect}
        >
          {({ onClick }) => (
            <PromptSurfaceButton
              aria-label={inputAriaLabel}
              onClick={onClick}
              rootStyle={{ paddingTop: '4.5rem' }}
            >
              <ContentStack align="center" gap="sm">
                <AccentIconBadge size={52}>
                  <AppIcon name="arrow-up" size={26} />
                </AccentIconBadge>
                <Text c={uiThemeTokens.color.text.primary} fw={700} lh={1.25} ta="center">
                  {promptHeadline}
                </Text>
                {!isDragActive ? (
                  <Badge icon={<AppIcon name="plus" size={12} />} tone="info">
                    {inputAriaLabel}
                  </Badge>
                ) : null}
                <SupportingText tone="soft">{fieldHelpText}</SupportingText>
              </ContentStack>
            </PromptSurfaceButton>
          )}
        </FilePickerButton>
      )}
    </Box>
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

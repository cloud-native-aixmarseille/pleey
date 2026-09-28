import { Box, Center, Text } from '@mantine/core';
import { useId } from 'react';
import { Button } from '../actions/button';
import { PromptSurfaceButton } from '../actions/prompt-surface-button';
import { Badge } from '../feedback/badge';
import { uiThemeTokens } from '../foundation/ui-theme';
import { AccentIconBadge } from '../icons/accent-icon-badge';
import { AppIcon } from '../icons/app-icon';
import { ContentStack, FlexGrowItem, SplitWrapRow, StretchRow, WrapRow } from '../layout/containers';
import { FileDropFieldset } from './file-drop-fieldset';
import { FileFieldMessages } from './file-field-messages';
import { formatFileFormat, formatFileSize } from './file-metadata';
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
  const generatedId = useId();
  const helpId = `${inputId ?? generatedId}-help`;
  const describedBy = helpId;
  const inputProps = {
    'aria-describedby': describedBy,
    'aria-label': inputAriaLabel,
    id: inputId,
  };

  return (
    <FileDropFieldset ariaLabel={inputAriaLabel} label={label} labelHtmlFor={inputId} onFileDrop={onFileSelect}>
      {({ isDragActive }) => (
        <>
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
                    <FilePickerButton accept={acceptedFileTypes} inputProps={inputProps} onSelect={onFileSelect}>
                      {({ onClick }) => (
                        <Button aria-describedby={describedBy} intent="ghost" onClick={onClick} size="sm" type="button">
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
            <FilePickerButton accept={acceptedFileTypes} inputProps={inputProps} onSelect={onFileSelect}>
              {({ onClick }) => (
                <PromptSurfaceButton
                  aria-describedby={describedBy}
                  aria-label={inputAriaLabel}
                  onClick={onClick}
                  rootStyle={{ paddingTop: '4.5rem' }}
                >
                  <ContentStack align="center" gap="sm">
                    <AccentIconBadge size={52}>
                      <AppIcon name="arrow-up" size={26} />
                    </AccentIconBadge>
                    <Text c={uiThemeTokens.color.text.primary} fw={700} lh={1.25} ta="center">
                      {isDragActive ? activePrompt : prompt}
                    </Text>
                    {!isDragActive ? (
                      <Badge icon={<AppIcon name="plus" size={12} />} tone="info">
                        {inputAriaLabel}
                      </Badge>
                    ) : null}
                  </ContentStack>
                </PromptSurfaceButton>
              )}
            </FilePickerButton>
          )}
          <Box p="md" pt={0}>
            <FileFieldMessages helpId={helpId} helpText={fieldHelpText} />
          </Box>
        </>
      )}
    </FileDropFieldset>
  );
}

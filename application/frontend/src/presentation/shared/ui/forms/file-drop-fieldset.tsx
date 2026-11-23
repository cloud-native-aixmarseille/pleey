import { Box, Text } from '@mantine/core';
import { type DragEvent, type ReactNode, useRef, useState } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';

interface FileDropFieldsetProps {
  readonly ariaLabel: string;
  readonly children: (state: { readonly isDragActive: boolean }) => ReactNode;
  readonly label?: string;
  readonly labelHtmlFor?: string;
  readonly onFileDrop: (file: File | null) => void;
}

const fieldsetTransition = `border-color ${uiThemeTokens.motion.standard}, background ${uiThemeTokens.motion.standard}, box-shadow ${uiThemeTokens.motion.standard}`;

const fieldsetBaseStyle = {
  background: `linear-gradient(180deg, ${uiThemeTokens.color.surface.accentMuted} 0%, ${uiThemeTokens.color.surface.recessed} 100%)`,
  border: `2px dashed ${uiThemeTokens.color.border.accent}`,
  borderRadius: uiThemeTokens.radius.panel,
  boxShadow: uiThemeTokens.shadow.subtle,
  margin: 0,
  minWidth: 0,
  padding: 0,
  position: 'relative',
  transition: fieldsetTransition,
} as const;

const fieldsetActiveStyle = {
  background: `linear-gradient(180deg, color-mix(in srgb, ${uiThemeTokens.color.brand.primary} 10%, ${uiThemeTokens.color.surface.accentMuted}) 0%, ${uiThemeTokens.color.surface.accentMuted} 100%)`,
  border: `2px dashed ${uiThemeTokens.color.border.accent}`,
  boxShadow: uiThemeTokens.shadow.accentGlow,
} as const;

export function FileDropFieldset({ ariaLabel, children, label, labelHtmlFor, onFileDrop }: FileDropFieldsetProps) {
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
    onFileDrop(event.dataTransfer.files?.[0] ?? null);
  };

  const fieldsetStyle = {
    ...fieldsetBaseStyle,
    ...(isDragActive ? fieldsetActiveStyle : null),
  };

  return (
    <Box
      aria-label={ariaLabel}
      component="fieldset"
      m={0}
      miw={0}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      p={0}
      style={fieldsetStyle}
    >
      {label ? (
        <Text
          c={uiThemeTokens.color.text.secondary}
          component={labelHtmlFor ? 'label' : 'p'}
          ff={uiThemeTokens.typography.bodyFamily}
          fw={700}
          htmlFor={labelHtmlFor}
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
      ) : null}
      {children({ isDragActive })}
    </Box>
  );
}

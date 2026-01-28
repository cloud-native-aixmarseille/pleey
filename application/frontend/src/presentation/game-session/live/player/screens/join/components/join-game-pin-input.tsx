import { type ChangeEvent, type CSSProperties, type FocusEvent, useRef } from 'react';
import { motionRecipes } from '../../../../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../../../../shared/ui/foundation/ui-theme';

interface JoinGamePinInputProps {
  readonly id: string;
  readonly maxLength: number;
  readonly onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly placeholder: string;
  readonly value: string;
}

const containerStyle: CSSProperties = {
  cursor: 'text',
  display: 'flex',
  gap: 'clamp(0.25rem, 1vw, 0.75rem)',
  justifyContent: 'center',
  position: 'relative',
};

const hiddenInputStyle: CSSProperties = {
  caretColor: 'transparent',
  height: '100%',
  left: 0,
  opacity: 0,
  position: 'absolute',
  top: 0,
  width: '100%',
};

function buildCellStyle(filled: boolean, active: boolean): CSSProperties {
  return {
    alignItems: 'center',
    aspectRatio: '3 / 4',
    background: filled
      ? `linear-gradient(180deg, ${uiThemeTokens.color.surface.accentPanel} 0%, ${uiThemeTokens.color.surface.panel} 100%)`
      : uiThemeTokens.color.surface.recessed,
    border: `2px solid ${active ? uiThemeTokens.color.border.accent : filled ? uiThemeTokens.color.border.accent : uiThemeTokens.color.border.subtle}`,
    borderRadius: uiThemeTokens.radius.inset,
    boxShadow: active
      ? uiThemeTokens.shadow.accentGlow
      : filled
        ? `0 0 12px rgba(30, 232, 215, 0.12)`
        : 'none',
    color: filled ? uiThemeTokens.color.brand.accent : uiThemeTokens.color.text.quiet,
    display: 'flex',
    flex: '1 1 0',
    fontFamily: uiThemeTokens.typography.monoFamily,
    fontSize: 'clamp(1.4rem, 3vw, 2.5rem)',
    fontWeight: 800,
    justifyContent: 'center',
    letterSpacing: '0.05em',
    minWidth: 0,
    textShadow: filled ? `0 0 12px ${uiThemeTokens.color.brand.accent}` : 'none',
    ...motionRecipes.standard('border-color, box-shadow, background, color'),
  };
}

export function JoinGamePinInput({
  id,
  maxLength,
  onBlur,
  onChange,
  placeholder,
  value,
}: JoinGamePinInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const cells = Array.from({ length: maxLength }, (_, i) => {
    const char = value[i] ?? '';
    const placeholderChar = placeholder[i] ?? '';
    const filled = char.length > 0;
    const active = value.length === i;

    return (
      <div key={i} style={buildCellStyle(filled, active)} aria-hidden="true">
        {filled ? char : <span style={{ opacity: 0.3 }}>{placeholderChar}</span>}
      </div>
    );
  });

  return (
    <div style={containerStyle} onClick={() => inputRef.current?.focus()}>
      {cells}
      <input
        ref={inputRef}
        autoComplete="off"
        id={id}
        inputMode="text"
        maxLength={maxLength}
        onBlur={onBlur}
        onChange={onChange}
        placeholder={placeholder}
        style={hiddenInputStyle}
        type="text"
        value={value}
      />
    </div>
  );
}

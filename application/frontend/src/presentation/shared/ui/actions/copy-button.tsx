import { useEffect, useState } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';
import { AppIcon } from '../icons/app-icon';
import { Button } from './button';

interface CopyButtonProps {
  readonly children: string;
  readonly textToCopy: string;
  readonly onCopySuccess?: () => void;
  readonly onCopyFailed?: () => void;
  readonly disabled?: boolean;
  readonly size?: 'md' | 'sm';
  readonly intent?: 'primary' | 'secondary' | 'ghost';
  readonly width?: 'auto' | 'wide' | 'full';
}

type CopyState = 'idle' | 'copied' | 'failed';

const COPY_STATUS_RESET_DELAY_MS = 2_000;

const iconAnimationStyle = `
  @keyframes copyButtonCheckmark {
    0% {
      opacity: 0;
      transform: scale(0.5);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .copy-button-icon-check {
    animation: copyButtonCheckmark 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes copyButtonError {
    0%, 100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-2px);
    }
    75% {
      transform: translateX(2px);
    }
  }

  .copy-button-icon-error {
    animation: copyButtonError 0.4s ease-in-out;
  }
`;

export function CopyButton({
  children,
  textToCopy,
  onCopySuccess,
  onCopyFailed,
  disabled = false,
  size = 'md',
  intent = 'ghost',
  width,
}: CopyButtonProps) {
  const [copyState, setCopyState] = useState<CopyState>('idle');

  useEffect(() => {
    if (copyState === 'idle') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyState('idle');
    }, COPY_STATUS_RESET_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copyState]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyState('copied');
      onCopySuccess?.();
    } catch {
      setCopyState('failed');
      onCopyFailed?.();
    }
  };

  const getIcon = () => {
    if (copyState === 'copied') {
      return (
        <AppIcon
          className="copy-button-icon-check"
          name="success"
          size={14}
          style={{ color: uiThemeTokens.color.brand.success }}
        />
      );
    }

    if (copyState === 'failed') {
      return (
        <AppIcon
          className="copy-button-icon-error"
          name="error"
          size={14}
          style={{ color: uiThemeTokens.color.text.danger }}
        />
      );
    }

    return <AppIcon name="copy" size={14} />;
  };

  const getLabel = () => {
    if (copyState === 'copied') {
      return '✓';
    }

    if (copyState === 'failed') {
      return '✕';
    }

    return children;
  };

  return (
    <>
      <style>{iconAnimationStyle}</style>
      <Button
        disabled={disabled || copyState !== 'idle'}
        intent={intent}
        leftSection={getIcon()}
        onClick={() => void handleCopy()}
        size={size}
        width={width}
      >
        {getLabel()}
      </Button>
    </>
  );
}

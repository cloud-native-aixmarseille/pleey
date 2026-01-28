import type { CSSProperties } from 'react';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { motionRecipes } from '../../../../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../../shared/ui/foundation/ui-typography';

interface JoinGameGuidanceBarProps {
  readonly currentStep: 1 | 2 | 3;
}

const STEPS = ['game.join.stepPin', 'game.join.stepIdentity', 'game.join.stepJoin'] as const;

const barStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xs,
  padding: `${uiThemeTokens.spacing.sm} ${uiThemeTokens.spacing.lg}`,
};

const stepsRowStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: 0,
  justifyContent: 'center',
  width: '100%',
  maxWidth: '20rem',
};

function buildDotStyle(state: 'completed' | 'active' | 'upcoming'): CSSProperties {
  const isCompleted = state === 'completed';
  const isActive = state === 'active';
  return {
    background:
      isCompleted || isActive
        ? uiThemeTokens.color.brand.accent
        : uiThemeTokens.color.surface.recessed,
    border: `2px solid ${isActive ? uiThemeTokens.color.border.accent : isCompleted ? uiThemeTokens.color.brand.accent : uiThemeTokens.color.border.subtle}`,
    borderRadius: '50%',
    boxShadow: isActive ? uiThemeTokens.shadow.accentGlow : 'none',
    flexShrink: 0,
    height: 12,
    width: 12,
    ...motionRecipes.standard('background, border-color, box-shadow'),
  };
}

function buildLineStyle(active: boolean): CSSProperties {
  return {
    background: active ? uiThemeTokens.color.brand.accent : uiThemeTokens.color.border.subtle,
    flex: 1,
    height: 2,
    ...motionRecipes.standard('background'),
  };
}

function buildLabelStyle(state: 'completed' | 'active' | 'upcoming'): CSSProperties {
  return {
    ...uiTypeScale.caption,
    color:
      state === 'active'
        ? uiThemeTokens.color.brand.accent
        : state === 'completed'
          ? uiThemeTokens.color.text.primary
          : uiThemeTokens.color.text.quiet,
    textAlign: 'center',
    ...motionRecipes.standard('color'),
  };
}

const labelsRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  maxWidth: '20rem',
  width: '100%',
};

const summaryStyle: CSSProperties = {
  ...uiTypeScale.caption,
  color: uiThemeTokens.color.text.soft,
  margin: 0,
};

export function JoinGameGuidanceBar({ currentStep }: JoinGameGuidanceBarProps) {
  const { t } = usePresentationTranslation();

  function resolveState(stepIndex: number): 'completed' | 'active' | 'upcoming' {
    const step = stepIndex + 1;
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'active';
    return 'upcoming';
  }

  return (
    <div style={barStyle} role="complementary" aria-label={t('game.join.guidanceBarLabel')}>
      <div style={stepsRowStyle}>
        {STEPS.map((_, index) => {
          const state = resolveState(index);
          return (
            <div key={index} style={{ display: 'contents' }}>
              <div style={buildDotStyle(state)} aria-hidden="true" />
              {index < STEPS.length - 1 ? (
                <div style={buildLineStyle(index + 1 < currentStep)} aria-hidden="true" />
              ) : null}
            </div>
          );
        })}
      </div>

      <div style={labelsRowStyle}>
        {STEPS.map((key, index) => (
          <span key={key} style={buildLabelStyle(resolveState(index))} aria-hidden="true">
            {t(key)}
          </span>
        ))}
      </div>

      <p style={summaryStyle}>{t('game.join.guidanceSummary')}</p>
    </div>
  );
}

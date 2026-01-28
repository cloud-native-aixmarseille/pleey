import { uiThemeTokens } from '../foundation/ui-theme';
import { uiTypeScale } from '../foundation/ui-typography';
import { InsetPanel } from '../layout/panels';
import { SupportingText } from '../layout/typography';

interface MetricPanelProps {
  readonly label: string;
  readonly value: string | number;
}

const metricValueStyle = {
  ...uiTypeScale.metric,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
} as const;

export function MetricPanel({ label, value }: MetricPanelProps) {
  return (
    <InsetPanel>
      <p style={metricValueStyle}>{String(value)}</p>
      <SupportingText marginTop="xs">{label}</SupportingText>
    </InsetPanel>
  );
}

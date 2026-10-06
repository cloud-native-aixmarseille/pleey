import { uiTypeScale } from '../../shared/ui/foundation/ui-typography';

export function themeFontSampleStyle(font: string) {
  return { ...uiTypeScale.sectionTitle, fontFamily: font };
}

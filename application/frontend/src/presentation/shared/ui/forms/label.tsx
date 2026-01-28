import type { LabelHTMLAttributes } from 'react';
import { formRecipes } from '../foundation/ui-recipes';

type LabelProps = Omit<LabelHTMLAttributes<HTMLLabelElement>, 'className' | 'style'>;

export function Label(props: LabelProps) {
  return <label style={formRecipes.fieldLabel} {...props} />;
}

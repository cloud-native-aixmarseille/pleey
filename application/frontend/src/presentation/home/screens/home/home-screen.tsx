import { uiThemeTokens } from '../../../shared/ui/foundation/ui-theme';

const pageStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xl,
} as const;

import { HomeClosingCtaSection } from './home-closing-cta-section';
import {
  HomeFeaturesSection,
  HomeHowItWorksSection,
  HomeValuePropositionSection,
} from './home-content-sections';
import { HomeHeroSection } from './home-hero-section';

export function HomeScreen() {
  return (
    <div style={pageStyle}>
      <HomeHeroSection />
      <HomeValuePropositionSection />
      <HomeHowItWorksSection />
      <HomeFeaturesSection />
      <HomeClosingCtaSection />
    </div>
  );
}

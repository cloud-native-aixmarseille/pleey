import { ContentStack } from '../../../shared/ui/layout/containers';
import { HomeClosingCtaSection } from './home-closing-cta-section';
import {
  HomeFeaturesSection,
  HomeHowItWorksSection,
  HomeValuePropositionSection,
} from './home-content-sections';
import { HomeHeroSection } from './home-hero-section';

export function HomeScreen() {
  return (
    <ContentStack gap="xl">
      <HomeHeroSection />
      <HomeValuePropositionSection />
      <HomeHowItWorksSection />
      <HomeFeaturesSection />
      <HomeClosingCtaSection />
    </ContentStack>
  );
}

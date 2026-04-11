import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import {
  AppIcon,
  homeFeatureIconNames,
  homeStepIconNames,
} from '../../../shared/ui/icons/app-icon';
import {
  ContentStack,
  ResponsiveGrid,
  SectionContainer,
  WrapRow,
} from '../../../shared/ui/layout/containers';
import { IntroBlock } from '../../../shared/ui/layout/intro-block';
import { LandingStepBadge } from '../../../shared/ui/layout/landing-sections';
import { ElevatedPanel, InsetPanel } from '../../../shared/ui/layout/panels';
import { Eyebrow, Heading, SupportingText } from '../../../shared/ui/layout/typography';

interface HomeStep {
  readonly title: string;
  readonly description: string;
}

interface HomeFeatureItem {
  readonly label: string;
  readonly description: string;
}

export function HomeValuePropositionSection() {
  const { t } = usePresentationTranslation();

  return (
    <SectionContainer centered maxWidth="50rem">
      <IntroBlock
        align="center"
        subtitle={t('home.valueProposition.description')}
        subtitleMaxWidth="38rem"
        title={t('home.valueProposition.heading')}
      />
    </SectionContainer>
  );
}

export function HomeHowItWorksSection() {
  const { t } = usePresentationTranslation();
  const steps = (t as unknown as (key: string, options: { returnObjects: true }) => HomeStep[])(
    'home.howItWorks.steps',
    { returnObjects: true },
  );

  return (
    <SectionContainer maxWidth="50rem">
      <Eyebrow>{t('home.howItWorks.eyebrow')}</Eyebrow>
      <ResponsiveGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="md">
        {steps.map((step, index) => (
          <ElevatedPanel key={step.title} padding="lg">
            <article>
              <ContentStack gap="sm">
                <LandingStepBadge stepNumber={index + 1} />
                <WrapRow gap="xs">
                  <AppIcon
                    name={
                      homeStepIconNames[index] ?? homeStepIconNames[homeStepIconNames.length - 1]
                    }
                    size={18}
                  />
                  <Heading level={3}>{step.title}</Heading>
                </WrapRow>
                <SupportingText>{step.description}</SupportingText>
              </ContentStack>
            </article>
          </ElevatedPanel>
        ))}
      </ResponsiveGrid>
    </SectionContainer>
  );
}

export function HomeFeaturesSection() {
  const { t } = usePresentationTranslation();
  const items = (
    t as unknown as (key: string, options: { returnObjects: true }) => HomeFeatureItem[]
  )('home.features.items', { returnObjects: true });

  return (
    <SectionContainer maxWidth="50rem">
      <Eyebrow>{t('home.features.eyebrow')}</Eyebrow>
      <ResponsiveGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="md">
        {items.map((item, index) => (
          <InsetPanel key={item.label} padding="lg">
            <article>
              <ContentStack gap="xs">
                <WrapRow gap="xs">
                  <AppIcon
                    name={
                      homeFeatureIconNames[index] ??
                      homeFeatureIconNames[homeFeatureIconNames.length - 1]
                    }
                    size={18}
                  />
                  <Heading level={3}>{item.label}</Heading>
                </WrapRow>
                <SupportingText>{item.description}</SupportingText>
              </ContentStack>
            </article>
          </InsetPanel>
        ))}
      </ResponsiveGrid>
    </SectionContainer>
  );
}

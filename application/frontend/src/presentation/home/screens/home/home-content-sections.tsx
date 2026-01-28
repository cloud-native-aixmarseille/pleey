import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import {
  AppIcon,
  homeFeatureIconNames,
  homeStepIconNames,
} from '../../../shared/ui/icons/app-icon';
import { IntroBlock } from '../../../shared/ui/layout/intro-block';
import {
  featureCardStyle,
  featureDescStyle,
  featureHeaderStyle,
  featureLabelStyle,
  featuresGridStyle,
  type HomeFeatureItem,
  type HomeStep,
  sectionCenterStyle,
  sectionEyebrowStyle,
  sectionStyle,
  stepCardStyle,
  stepDescStyle,
  stepNumberStyle,
  stepsGridStyle,
  stepTitleRowStyle,
  stepTitleStyle,
} from './home-screen-styles';

export function HomeValuePropositionSection() {
  const { t } = usePresentationTranslation();

  return (
    <section style={sectionCenterStyle}>
      <IntroBlock
        align="center"
        subtitle={t('home.valueProposition.description')}
        subtitleMaxWidth="38rem"
        title={t('home.valueProposition.heading')}
      />
    </section>
  );
}

export function HomeHowItWorksSection() {
  const { t } = usePresentationTranslation();
  const steps = (t as unknown as (key: string, options: { returnObjects: true }) => HomeStep[])(
    'home.howItWorks.steps',
    { returnObjects: true },
  );

  return (
    <section style={sectionStyle}>
      <p style={sectionEyebrowStyle}>{t('home.howItWorks.eyebrow')}</p>
      <div style={stepsGridStyle}>
        {steps.map((step, index) => (
          <article key={step.title} style={stepCardStyle}>
            <div aria-hidden style={stepNumberStyle}>
              {index + 1}
            </div>
            <div style={stepTitleRowStyle}>
              <AppIcon
                name={homeStepIconNames[index] ?? homeStepIconNames[homeStepIconNames.length - 1]}
                size={18}
              />
              <h3 style={stepTitleStyle}>{step.title}</h3>
            </div>
            <p style={stepDescStyle}>{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HomeFeaturesSection() {
  const { t } = usePresentationTranslation();
  const items = (
    t as unknown as (key: string, options: { returnObjects: true }) => HomeFeatureItem[]
  )('home.features.items', { returnObjects: true });

  return (
    <section style={sectionStyle}>
      <p style={sectionEyebrowStyle}>{t('home.features.eyebrow')}</p>
      <div style={featuresGridStyle}>
        {items.map((item, index) => (
          <article key={item.label} style={featureCardStyle}>
            <div style={featureHeaderStyle}>
              <AppIcon
                name={
                  homeFeatureIconNames[index] ??
                  homeFeatureIconNames[homeFeatureIconNames.length - 1]
                }
                size={18}
              />
              <h3 style={featureLabelStyle}>{item.label}</h3>
            </div>
            <p style={featureDescStyle}>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

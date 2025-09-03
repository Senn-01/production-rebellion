import { LandingHeader } from './landing/LandingHeader';
import { PaintingSection } from './landing/PaintingSection';
import { RealitySection } from './landing/RealitySection';
import { LandingFooter } from './landing/LandingFooter';
import { landingContent } from '../data/landingContent';

interface LandingPageProps {
  onAuthSuccess: () => void;
}

export function LandingPage({ onAuthSuccess }: LandingPageProps) {
  const { header, paintings, reality, forWhom, footer } = landingContent;

  return (
    <div className="min-h-screen bg-black">
      <LandingHeader 
        title={header.title}
        subtitle={header.subtitle}
        badge={header.badge}
      />

      <div className="relative">
        <PaintingSection
          type="tactical"
          title={paintings.tactical.title}
          subtitle={paintings.tactical.subtitle}
          description={paintings.tactical.description}
          benefit={paintings.tactical.benefit}
        />

        <PaintingSection
          type="focus"
          title={paintings.focus.title}
          subtitle={paintings.focus.subtitle}
          description={paintings.focus.description}
          benefit={paintings.focus.benefit}
          reversed={true}
        />

        <PaintingSection
          type="analytics"
          title={paintings.analytics.title}
          subtitle={paintings.analytics.subtitle}
          description={paintings.analytics.description}
          benefit={paintings.analytics.benefit}
        />
      </div>

      <RealitySection
        reality={reality}
        forWhom={forWhom}
        onAuthSuccess={onAuthSuccess}
      />

      <LandingFooter
        tagline={footer.tagline}
        status={footer.status}
      />
    </div>
  );
}
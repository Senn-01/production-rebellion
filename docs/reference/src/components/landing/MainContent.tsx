import { ContentSection } from './ContentSection';
import { ValueCard } from './ValueCard';
import { WorkflowStep } from './WorkflowStep';
import { landingContent } from '../../data/landingContent';

export function MainContent() {
  const { sections } = landingContent;

  return (
    <div className="space-y-16">
      {/* What is it? */}
      <ContentSection title={sections.whatIsIt.title}>
        <div className="space-y-4 text-lg leading-relaxed">
          {sections.whatIsIt.content.map((paragraph, index) => (
            <p key={index}>
              {index === 0 ? (
                <>
                  <strong>Production Rebellion is a strategic meta-layer</strong> above your existing productivity tools. 
                  While your calendar manages when, and your task manager handles what, we focus on <em>which</em> and <em>how deeply</em>.
                </>
              ) : (
                <>
                  Two core functions: <strong>Strategic project visualization</strong> using cost/benefit positioning, 
                  and <strong>mindful work sessions</strong> with pattern awareness. Think Strava for your strategic thinking.
                </>
              )}
            </p>
          ))}
        </div>
      </ContentSection>

      {/* For Whom? */}
      <ContentSection title={sections.forWhom.title}>
        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            <strong>Knowledge workers who are drowning in options.</strong> You have more projects than time, 
            more ideas than capacity, more opportunities than clarity.
          </p>
          <p>
            Consultants, founders, researchers, creators—anyone whose work involves choosing <em>what</em> to do 
            before figuring out <em>how</em> to do it. People who need strategic pause, not more task management.
          </p>
        </div>
      </ContentSection>

      {/* Unique Value */}
      <ContentSection title={sections.uniqueValue.title}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.uniqueValue.cards.map((card, index) => (
            <ValueCard key={index} {...card} />
          ))}
        </div>
      </ContentSection>

      {/* How it Works? */}
      <ContentSection title={sections.howItWorks.title}>
        <div className="space-y-6">
          {sections.howItWorks.steps.map((step, index) => (
            <WorkflowStep key={index} {...step} />
          ))}
        </div>
      </ContentSection>

      {/* Inspiration */}
      <ContentSection title={sections.inspiration.title}>
        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            <strong>GTD's capture philosophy</strong> meets <strong>Deep Work's focus principles</strong> 
            with the <strong>visual clarity of spatial interfaces</strong>. 
          </p>
          <p>
            We believe in conscious choice over reactive scrambling, 
            strategic pause over perpetual motion, and awareness over automation.
          </p>
          <div className="bg-[#525252] text-white border-4 border-black p-6 shadow-[4px_4px_0px_#000000] italic">
            "The best way to find out if you can trust somebody is to trust them." 
            <span className="block text-sm font-bold mt-2 not-italic">— But first, you need to see clearly what you're choosing to trust.</span>
          </div>
        </div>
      </ContentSection>
    </div>
  );
}
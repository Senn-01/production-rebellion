import { Map, Target, BarChart3, LucideIcon } from 'lucide-react';

interface PaintingSectionProps {
  type: 'tactical' | 'focus' | 'analytics';
  title: string;
  subtitle: string;
  description: string;
  benefit: string;
  reversed?: boolean;
}

export function PaintingSection({ type, title, subtitle, description, benefit, reversed = false }: PaintingSectionProps) {
  const getConfig = () => {
    switch (type) {
      case 'tactical':
        return {
          bgClass: 'bg-[#FFF8DC]',
          gradientClass: 'bg-gradient-to-br from-[#FDE047]/20 to-transparent',
          accentColor: '#FDE047',
          titleClass: 'text-black transform skew-x-2',
          textClass: 'text-black',
          icon: Map,
          iconBg: 'bg-[#FDE047]',
          shadowColor: '#FDE047'
        };
      case 'focus':
        return {
          bgClass: 'bg-[#3a6a2e]',
          gradientClass: 'bg-gradient-to-br from-[#CFE820]/30 to-transparent',
          accentColor: '#CFE820',
          titleClass: 'text-white transform -skew-x-2',
          textClass: 'text-white',
          icon: Target,
          iconBg: 'bg-[#CFE820]',
          shadowColor: '#CFE820'
        };
      case 'analytics':
        return {
          bgClass: 'bg-[#2D1B3D]',
          gradientClass: 'bg-gradient-to-br from-[#E5B6E5]/20 to-transparent',
          accentColor: '#E5B6E5',
          titleClass: 'text-[#E5B6E5] transform skew-x-2',
          textClass: 'text-white',
          icon: BarChart3,
          iconBg: 'bg-[#E5B6E5]',
          shadowColor: '#E5B6E5'
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;

  const contentSection = (
    <div>
      <div className={`${config.iconBg} border-8 border-black p-6 shadow-[16px_16px_0px_#000000] transform ${reversed ? 'rotate-2' : '-rotate-2'} mb-8`}>
        <IconComponent className="w-16 h-16 text-black" />
      </div>
      <h2 className={`text-5xl font-black uppercase tracking-wider mb-4 ${config.titleClass}`}>
        {title}
      </h2>
      <div className={`bg-black border-4 border-black px-6 py-3 inline-block mb-6 transform ${reversed ? '-rotate-1' : 'rotate-1'}`} 
           style={{ color: config.accentColor }}>
        <span className="text-xl font-black uppercase tracking-wider">{subtitle}</span>
      </div>
      <p className={`text-xl leading-relaxed mb-6 font-bold ${config.textClass}`}>
        {description}
      </p>
      <div className={`bg-white border-8 border-black p-6 shadow-[8px_8px_0px_#000000] transform ${reversed ? '-rotate-1' : 'rotate-1'}`}>
        <p className="text-lg font-black uppercase tracking-wide text-black">
          → {benefit}
        </p>
      </div>
    </div>
  );

  const visualSection = (
    <div className={`flex justify-center ${reversed ? 'lg:justify-start' : 'lg:justify-end'}`}>
      <div className={`bg-black border-8 border-black p-8 shadow-[20px_20px_0px_${config.accentColor}] transform ${reversed ? '-rotate-3' : 'rotate-3'}`}>
        <div className={`${config.iconBg} p-12 border-4 border-black`}>
          <div className="text-4xl font-black text-center">
            {subtitle.includes(' ') ? (
              <>
                {subtitle.split(' ')[0]}<br/>{subtitle.split(' ')[1]}
              </>
            ) : (
              subtitle
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className={`${config.bgClass} border-b-8 border-black relative overflow-hidden`}>
      <div className={`absolute inset-0 ${config.gradientClass}`}></div>
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {reversed ? (
            <>
              {visualSection}
              {contentSection}
            </>
          ) : (
            <>
              {contentSection}
              {visualSection}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
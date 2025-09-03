import { AuthForm } from './AuthForm';

interface RealitySectionProps {
  reality: {
    title: string;
    content: string[];
  };
  forWhom: {
    title: string;
    description: string;
    reality: string;
  };
  onAuthSuccess: () => void;
}

export function RealitySection({ reality, forWhom, onAuthSuccess }: RealitySectionProps) {
  return (
    <section className="bg-white border-b-8 border-black">
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-5xl font-black uppercase tracking-wider mb-8 transform -skew-x-1">
              {reality.title}
            </h2>
            <div className="space-y-6">
              {reality.content.map((paragraph, index) => (
                <p key={index} className="text-xl leading-relaxed font-bold">
                  {paragraph}
                </p>
              ))}
            </div>
            
            <div className="mt-12 border-8 border-black bg-[#f7f7f5] p-8 shadow-[12px_12px_0px_#000000] transform rotate-1">
              <h3 className="text-3xl font-black uppercase tracking-wider mb-4">{forWhom.title}</h3>
              <p className="text-lg leading-relaxed font-bold mb-4">{forWhom.description}</p>
              <div className="bg-black text-white p-4 border-4 border-black transform -rotate-1">
                <p className="font-black uppercase tracking-wide">{forWhom.reality}</p>
              </div>
            </div>
          </div>

          {/* Auth Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="transform rotate-2">
                <AuthForm onAuthSuccess={onAuthSuccess} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
interface LandingHeaderProps {
  title: string;
  subtitle: string;
  badge: string;
}

export function LandingHeader({ title, subtitle, badge }: LandingHeaderProps) {
  return (
    <header className="border-b-8 border-black bg-white relative">
      <div className="absolute inset-0 bg-gradient-to-r from-[#FDE047] via-white to-[#FDE047]"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-6xl font-black uppercase tracking-wider mb-3 transform -skew-x-2">
              {title}
            </h1>
            <p className="text-2xl font-black uppercase tracking-wide text-black/80 transform skew-x-1">
              {subtitle}
            </p>
          </div>
          <div className="bg-black text-[#FDE047] border-8 border-black px-8 py-4 shadow-[12px_12px_0px_#FDE047] transform rotate-3">
            <span className="text-xl font-black uppercase tracking-wider">{badge}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
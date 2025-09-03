interface LandingFooterProps {
  tagline: string;
  status: string;
}

export function LandingFooter({ tagline, status }: LandingFooterProps) {
  return (
    <footer className="border-t-8 border-black bg-black">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-black uppercase tracking-wide text-white transform -skew-x-1">
            {tagline}
          </div>
          <div className="flex gap-6 text-xl font-black uppercase tracking-wide">
            <span className="text-[#FDE047]">{status}</span>
            <span className="text-white">|</span>
            <span className="text-white">PRODUCTION REBELLION</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
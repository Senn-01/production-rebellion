import { Target, Brain } from 'lucide-react';

interface ValueCardProps {
  icon: string;
  title: string;
  description: string;
}

export function ValueCard({ icon, title, description }: ValueCardProps) {
  const IconComponent = icon === 'Target' ? Target : Brain;
  
  return (
    <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_#000000]">
      <IconComponent className="w-8 h-8 mb-4" />
      <h3 className="font-black uppercase tracking-wide mb-3">{title}</h3>
      <p className="text-sm leading-relaxed">{description}</p>
    </div>
  );
}
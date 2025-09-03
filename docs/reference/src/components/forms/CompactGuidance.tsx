interface CompactGuidanceProps {
  type: 'cost' | 'benefit';
}

export function CompactGuidance({ type }: CompactGuidanceProps) {
  const text = type === 'cost' 
    ? 'EFFORT: 1-3 Quick • 4-6 Moderate • 7-10 Major' 
    : 'IMPACT: 1-3 Minor • 4-6 Notable • 7-10 Game-changer';
  
  return (
    <div className="bg-[#FDE047] border-4 border-black shadow-[4px_4px_0px_#000000] mt-2 p-2">
      <div className="text-xs font-bold uppercase tracking-wide text-black/70 font-mono">
        {text}
      </div>
    </div>
  );
}
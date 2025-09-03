interface CategoryBlockProps {
  value: string;
  label: string;
  description: string;
  color: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
}

export function CategoryBlock({ 
  value, 
  label, 
  description, 
  color,
  isSelected,
  onSelect 
}: CategoryBlockProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`relative p-4 border-4 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 text-left w-full h-18 flex flex-col justify-center ${
        isSelected ? 'bg-[#FDE047] text-black' : 'bg-[#9ca3af] text-white'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-4 h-4 border-2 border-black shadow-[2px_2px_0px_#000000] ${
          isSelected ? 'bg-black' : 'bg-white'
        }`}></div>
        <div className="text-sm font-black uppercase tracking-wider">
          {label}
        </div>
      </div>
      <div className={`text-xs font-bold ${
        isSelected ? 'text-black/70' : 'text-white/90'
      }`}>
        {description}
      </div>
    </button>
  );
}
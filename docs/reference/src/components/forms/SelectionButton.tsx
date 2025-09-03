interface SelectionButtonProps {
  value: string;
  label: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
}

export function SelectionButton({ 
  value, 
  label, 
  isSelected,
  onSelect 
}: SelectionButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`p-3 border-4 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 text-center w-full font-black uppercase tracking-wider text-sm ${
        isSelected ? 'bg-[#FDE047] text-black' : 'bg-[#9ca3af] text-white'
      }`}
    >
      {label}
    </button>
  );
}
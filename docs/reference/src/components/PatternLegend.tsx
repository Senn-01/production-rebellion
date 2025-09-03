interface PatternLegendProps {
  category: string;
  label: string;
}

export function PatternLegend({ category, label }: PatternLegendProps) {
  const getCategoryPattern = () => {
    const patternId = `legend-pattern-${category.toLowerCase()}`;
    const darkGrey = '#9ca3af'; // Darker grey for better contrast
    
    switch (category) {
      case 'WORK':
        return {
          patternId,
          backgroundColor: darkGrey,
          pattern: null
        };
      case 'LEARN':
        return {
          patternId,
          backgroundColor: '#f7f7f5',
          pattern: (
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <pattern id={patternId} patternUnits="userSpaceOnUse" width="8" height="8">
                  <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke={darkGrey} strokeWidth="1.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
          )
        };
      case 'BUILD':
        return {
          patternId,
          backgroundColor: '#f7f7f5',
          pattern: (
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <pattern id={patternId} patternUnits="userSpaceOnUse" width="6" height="6">
                  <path d="M 6 0 L 0 0 0 6" fill="none" stroke={darkGrey} strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
          )
        };
      case 'MANAGE':
        return {
          patternId,
          backgroundColor: '#f7f7f5',
          pattern: (
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <pattern id={patternId} patternUnits="userSpaceOnUse" width="8" height="6">
                  <path d="M0,3 L8,3" stroke={darkGrey} strokeWidth="1.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
          )
        };
      default:
        return {
          patternId,
          backgroundColor: darkGrey,
          pattern: null
        };
    }
  };

  const categoryPattern = getCategoryPattern();

  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-4 h-4 border-2 border-black shadow-[2px_2px_0px_#000000] relative overflow-hidden"
        style={{ backgroundColor: categoryPattern.backgroundColor }}
      >
        {categoryPattern.pattern}
      </div>
      <span>{label}</span>
    </div>
  );
}
interface ProjectIconProps {
  category: string;
  isBossBattle: boolean;
  priority: string;
}

export function ProjectIcon({ category, isBossBattle, priority }: ProjectIconProps) {
  const size = 32;
  
  // Get shadow color based on priority
  const getShadowColor = () => {
    return priority === 'high' ? '#FFD700' : '#000000'; // Gold for high priority, black for others
  };
  
  const getCategoryPattern = () => {
    const patternId = `pattern-${category.toLowerCase()}`;
    const darkGrey = '#9ca3af'; // Darker grey for better contrast
    
    switch (category) {
      case 'WORK':
        // Solid fill
        return {
          patternId,
          backgroundColor: darkGrey,
          pattern: null
        };
      case 'LEARN':
        // Diagonal hatch (45° lines)
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
        // Grid pattern
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
        // Horizontal lines
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
  const shadowColor = getShadowColor();

  return (
    <div className="relative">
      <div 
        className="border-4 border-black cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] transition-all duration-100 relative overflow-hidden"
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: categoryPattern.backgroundColor,
          boxShadow: `4px 4px 0px ${shadowColor}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `6px 6px 0px ${shadowColor}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `4px 4px 0px ${shadowColor}`;
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.boxShadow = `2px 2px 0px ${shadowColor}`;
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.boxShadow = `4px 4px 0px ${shadowColor}`;
        }}
      >
        {categoryPattern.pattern}
      </div>
      {isBossBattle && (
        <div className="absolute -top-1 -right-1 text-[#FDE047] text-sm drop-shadow-[2px_2px_0px_#000000]">
          ★
        </div>
      )}
    </div>
  );
}
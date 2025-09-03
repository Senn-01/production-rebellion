import { CurrentPage } from '../types/project';

export function useHeaderStyling(currentPage: CurrentPage) {
  const getHeaderColor = () => {
    switch (currentPage) {
      case 'map': return '#FDE047'; // Original yellow
      case 'focus': return '#224718';
      case 'data': return '#451969';
      case 'prime': return '#2563EB';
      default: return '#FDE047';
    }
  };

  const getHeaderStyling = () => {
    if (currentPage === 'map') {
      return {
        headerTextColor: 'text-black',
        menuButtonStyle: 'bg-white'
      };
    }
    if (currentPage === 'focus') {
      return {
        headerTextColor: 'text-[#CFE820]', // Bright yellow-green text for focus page
        menuButtonStyle: 'bg-white'
      };
    }
    return {
      headerTextColor: 'text-white',
      menuButtonStyle: 'bg-white'
    };
  };

  return {
    headerColor: getHeaderColor(),
    ...getHeaderStyling()
  };
}
/**
 * Neo-Brutalist Design Token System
 * 
 * Centralized design tokens for Production Rebellion's neo-brutalist design system.
 * Each "painting" (page) has its own color theme while maintaining consistent
 * typography, shadows, and spacing.
 */

export const designTokens = {
  // Border System
  border: {
    standard: '4px solid black',
    emphasis: '8px solid black',
    thin: '2px solid black',
  },

  // Shadow System  
  shadow: {
    base: '4px 4px 0px #000000',
    hover: '6px 6px 0px #000000', 
    active: '2px 2px 0px #000000',
    none: '0px 0px 0px #000000',
  },

  // Typography
  typography: {
    primary: 'font-black uppercase tracking-wider',     // Headers, buttons
    data: 'font-mono',                                  // Numbers, technical info
    secondary: 'font-bold uppercase tracking-wide',     // Descriptions, labels
    body: 'font-medium',                                // Regular text
  },

  // Animation
  animation: {
    standard: 'all 100ms ease-out',
    slow: 'all 200ms ease-out',
    fast: 'all 50ms ease-out',
  },

  // Spacing (following 8px grid)
  spacing: {
    xs: '4px',
    sm: '8px', 
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
} as const;

// Page Themes - Each "painting" has its own color palette
export const themes = {
  tactical: {
    name: 'TacticalMap',
    primary: '#FDE047',        // Gumroad-inspired yellow
    background: '#FFF8DC',     // Cream/beige
    accent: '#f7f7f5',         // Light grey for XP gauge
    text: '#000000',           // Black text
    textSecondary: '#525252',  // Dark grey
  },
  
  focus: {
    name: 'DeepFocus', 
    primary: '#CFE820',        // Lime green - main setup box background
    background: '#3a6a2e',     // Medium green - page background
    accent: '#E5B6E5',         // Pink highlights - target icon, headings
    text: '#224718',           // Dark green - main text color
    textSecondary: '#FFFFFF',  // White text - for contrast on green
    timerBackground: '#E5EED0', // Light green - timer card background
    cardBackground: '#FFFFFF', // White - card backgrounds
  },

  analytics: {
    name: 'Analytics',
    primary: '#451969',        // Dark purple
    background: '#e5d9ff',     // Very light purple
    accent: '#E5B6E5',         // Light pink/lavender
    text: '#000000',           // Black text
    textSecondary: '#451969',  // Dark purple
  },

  prime: {
    name: 'Prime',
    primary: '#2563EB',        // Blue
    background: '#EFF6FF',     // Very light blue
    accent: '#DBEAFE',         // Light blue
    text: '#000000',           // Black text 
    textSecondary: '#1E40AF',  // Dark blue
  },
} as const;

export type ThemeName = keyof typeof themes;
export type Theme = typeof themes[ThemeName];

// CSS Custom Properties Generator
export function generateThemeCSS(themeName: ThemeName): Record<string, string> {
  const theme = themes[themeName];
  
  const baseVariables = {
    '--theme-primary': theme.primary,
    '--theme-background': theme.background, 
    '--theme-accent': theme.accent,
    '--theme-text': theme.text,
    '--theme-text-secondary': theme.textSecondary,
  };

  // Add theme-specific variables for focus theme
  if (themeName === 'focus') {
    return {
      ...baseVariables,
      '--theme-timer-background': (theme as any).timerBackground,
      '--theme-card-background': (theme as any).cardBackground,
    };
  }

  return baseVariables;
}

// Priority Colors (used across all themes)
export const priorityColors = {
  must: '#FFD700',    // Gold border for must-do items
  should: '#000000',  // Black border for should-do items  
  nice: '#666666',    // Grey border for nice-to-have items
} as const;

// Category Patterns (used for project visualization)
export const categoryPatterns = {
  work: 'solid-fill',         // Solid fill for work projects
  learn: 'vertical-lines',    // Vertical lines for learning
  build: 'diagonal-lines',    // Diagonal lines for building
  manage: 'horizontal-lines', // Horizontal lines for management
} as const;

// Session Willpower Multipliers (from brief.md)
export const willpowerMultipliers = {
  high: 1.0,    // Piece of Cake
  medium: 1.5,  // Caffeinated  
  low: 2.0,     // Don't Talk To Me
} as const;

// Difficulty Quotes Matrix (from brief.md)
export const difficultyQuotes = {
  'high-60': "I'm Too Young to Die",
  'medium-60': "Hey, Not Too Rough", 
  'high-90': "Bring It On",
  'medium-90': "Come Get Some",
  'low-60': "Damn I'm Good",
  'high-120': "Crunch Time", 
  'medium-120': "Balls of Steel ⚪⚪",
  'low-90': "Nightmare Deadline",
  'low-120': "Hail to the King 👑",
} as const;

export type DifficultyKey = keyof typeof difficultyQuotes;

export function getDifficultyQuote(willpower: 'high' | 'medium' | 'low', duration: 60 | 90 | 120): string {
  const key = `${willpower}-${duration}` as DifficultyKey;
  return difficultyQuotes[key] || "Unknown Difficulty";
}
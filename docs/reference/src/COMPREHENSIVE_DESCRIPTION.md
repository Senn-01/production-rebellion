# Production Rebellion: Comprehensive Technical Description

## Architecture & Technology Stack

**Production Rebellion** is a strategic project management application built with **React 18** and **TypeScript**, using **Tailwind CSS v4** for styling. The application follows a single-page application (SPA) architecture with component-based routing managed through React state. It's designed exclusively for desktop use with a minimum width of 1200px and no mobile responsiveness.

### Core Dependencies
- **React 18** with TypeScript for component architecture
- **Tailwind CSS v4** for utility-first styling with custom CSS variables
- **Lucide React** for all iconography (consistent icon system)
- **Shadcn/ui** component library for form controls and UI primitives
- **Custom CSS animations** defined in globals.css for neo-brutalist interactions

## Design Philosophy: Neo-Brutalism

The application embraces a **neo-brutalist design philosophy** characterized by:
- **Thick black borders** (4px standard, 8px for emphasis) on all interactive elements
- **Bold, aggressive shadows** using the pattern `shadow-[4px_4px_0px_#000000]` for base state, `shadow-[6px_6px_0px_#000000]` for hover, and `shadow-[2px_2px_0px_#000000]` for active states
- **Satisfying button animations** with translate transforms: `hover:translate-x-[-2px] hover:translate-y-[-2px]` and `active:translate-x-[2px] active:translate-y-[2px]`
- **High-contrast color combinations** with no subtle grays or muted tones
- **Bold, uppercase typography** with `font-black`, `uppercase`, and `tracking-wider` classes throughout
- **Brutal, unapologetic UI elements** that prioritize function and visual impact over subtlety

### Typography System
- **Primary Interface Font**: `system-ui, -apple-system, sans-serif` for headers and UI
- **Monaco Font**: Used specifically for the Focus page to create a softer, more approachable feel
- **Font-mono**: Used for data input fields and code-like elements
- **Typography Weights**: Primarily `font-black` (900) and `font-bold` (700), rarely using lighter weights
- **Letter Spacing**: Extensive use of `tracking-wider` and `tracking-wide` for aggressive spacing

## Color System & Page Theming

Each page has a distinct **monochromatic color theme** with consistent application across headers, backgrounds, and accents:

### Strategic Map (Default)
- **Primary Color**: `#FDE047` (bright yellow, Gumroad-inspired)
- **Background**: `#FFF8DC` (cream/beige)
- **Header**: `#FDE047` with black text
- **Accent Elements**: Black borders and shadows throughout

### Focus Page  
- **Primary Color**: `#CFE820` (bright yellow-green) for navigation and accents
- **Header Color**: `#224718` (dark green) with `#CFE820` text
- **Background**: `#3a6a2e` (medium green)
- **Special Colors**: `#E5B6E5` (pink) for icons and highlights, `#E5EED0` (light green) for timer background

### Data Analytics Page
- **Primary Color**: `#E5B6E5` (light pink/lavender) for navigation
- **Header Color**: `#451969` (dark purple)
- **Background**: `#E5B6E5` (light pink)
- **Content Backgrounds**: `#e5d9ff` (very light purple) for cards

### Prime Page
- **Primary Color**: `#2563EB` (blue) for headers and accents
- **Background**: `#FFFBEB` (cream)
- **Special Elements**: `#F0F8FF` (alice blue) for page background

## Universal Layout Structure

### SharedLayout Component
The `SharedLayout` component provides the consistent shell for all pages:

**Header Structure** (Full-width, `border-b-4 border-black p-6`):
- **Left**: App title "PRODUCTION REBELLION" (`text-3xl font-black uppercase tracking-wider`)
- **Center**: Two action buttons - "BRAIN DUMP" and "1 TO TRIAGE" (absolutely centered using `absolute left-1/2 transform -translate-x-1/2`)
- **Right**: Hotkey text "⚡ PRESS ⌘C TO QUICK CAPTURE" and hamburger menu button

**Fixed XP Gauge** (Top-right, positioned at `top: 112px, right: 48px`):
- White background with black border
- Lightning bolt icon with "1,250" XP display
- Uses `font-mono` for the number

**Bottom Navigation** (Fixed at `bottom-8 right-8`):
- 2x2 grid of navigation buttons
- Colors: Map (`#FDE047`), Focus (`#CFE820`), Data (`#E5B6E5`), Prime (`#2563EB`)
- Always vibrant colors regardless of active state
- Each button: 48px minimum width, icons + text labels

### Page-Specific Styling
Each page's header and interactive elements adapt to match the page theme, with the hamburger menu and brain dump button using the page's background color for proper contrast.

## Detailed Page Descriptions

### 1. Strategic Map (Main/Default Page)

**Layout**: Central content with max-width container (`max-w-7xl mx-auto`)

**Title Section**:
- Main heading: `text-5xl font-black uppercase tracking-wider mb-4` "STRATEGIC MAP"
- Subtitle: `text-xl font-bold uppercase tracking-wide text-black/70` 

**Action Buttons Row** (4 buttons, `gap-6 mb-12`):
- "ADD PROJECT" (opens modal dialog)
- "TRIAGE (1)" 
- "PARKING LOT"
- "WEEK FOCUS"
- All buttons: `bg-[#FDE047]` with standard neo-brutal styling

**Project Map Visualization**:
- **Container**: 800px height, full width, cream background (`#FFFEF7`)
- **Grid System**: Subtle 5% interval gridlines at 10% opacity
- **Main Axes**: 6px thick black lines (vertical and horizontal center)
- **Axis Labels**: Rotated text using `transform -rotate-90` for Y-axis
- **Quadrant Labels**: Positioned absolutely in each corner with enhanced typography
  - "NO-BRAINER" (top-left): Low effort, high impact  
  - "BREAKTHROUGH" (top-right): High effort, high impact
  - "SIDE-QUEST" (bottom-left): Low effort, low impact
  - "TRAP-ZONE" (bottom-right): High effort, low impact

**Project Icons System** (Monochromatic Patterns):
- **Size**: 32px squares with 4px black borders
- **WORK**: Solid fill (`#525252`)
- **LEARN**: Diagonal hatch pattern (45° lines, 8px spacing)
- **BUILD**: Grid pattern (6px squares)
- **MANAGE**: Horizontal lines (6px spacing)
- **Boss Battle Indicator**: Yellow star (`#FDE047`) positioned at `-top-1 -right-1`

**Pattern Legend**: 
- Small 16px squares showing each pattern with labels
- Positioned in header area with explanatory text

**Sample Projects** (8 total):
- Positioned using percentage coordinates (x, y)
- Mix of categories and boss battle status
- Tooltip on hover showing project title

**Stats Cards** (Bottom, 2-column grid):
- Left: Active projects count (yellow background)
- Right: Inactive projects count (white background)  
- Large numbers: `text-7xl font-black font-mono`

**Add Project Modal**:
- **Size**: 1100px width, `max-h-[85vh]` with scroll
- **Background**: `#FFF7ED` (cream) with 8px shadow
- **Header**: Orange (`#F97316`) with white text
- **Form Layout**: Multi-column grid with sections:
  - Project name (full width)
  - Cost/Benefit scores (2-column with guidance boxes)
  - Category selection (2x2 grid of colored blocks)
  - Priority levels (3 stacked options)
  - Due date and status (2-column with radio buttons)
  - Description textarea (full width)
  - Confidence level (3-column grid)
  - Action buttons (Create/Cancel)

### 2. Focus Page

**Design Approach**: Softer, more approachable than other pages using Monaco font
**Session States**: setup, willpower, active, completed, interrupted

**Setup State**:
- **Container**: Centered vertically (`min-h-[80vh] flex items-center justify-center`)
- **Main Box**: `max-w-lg` width, `#CFE820` background, 12px padding
- **Title Section**: Left-aligned with pink target icon (`#E5B6E5`)
- **Project Selection**: Dropdown using Shadcn Select component
- **Duration Selection**: 3-column grid (60, 90, 120 minutes)
- **Start Button**: Full width, pink background (`#E5B6E5`)

**Willpower Check State**:
- **Layout**: `max-w-2xl mx-auto text-center`
- **Title**: `text-4xl font-black uppercase tracking-wider mb-8 text-[#E5B6E5]`
- **Options**: 3 stacked buttons with icons (Zap, Coffee, BatteryLow)
- **Styling**: `#CFE820` backgrounds with ring selection indicator

**Active Session State**:
- **Timer Display**: 
  - Container: Light green background (`#E5EED0`)
  - Font: `text-8xl font-black font-mono text-[#224718]`
  - Animation: `urgent-pulse` class when ≤ 5 minutes remaining
- **Project Info**: White background card with pink/green text hierarchy
- **Interrupt Button**: Red background with square icon

**Completion States**: 
- Success: Green celebration with feedback options
- Interrupted: Red background with minimal XP message

**Animations**:
- Urgent pulse animation defined in globals.css
- Standard neo-brutal hover/active states throughout

### 3. Data Analytics Page

**Color Scheme**: Purple/pink theme (`#451969`, `#E5B6E5`, `#e5d9ff`)
**Layout**: Dashboard-style with metric cards and data visualizations

**Hero Metrics** (3-column grid):
- Today, This Week, Total XP
- Purple accent color for XP card (`#451969` background, `#E5B6E5` text)
- Large numbers: `text-4xl font-black font-mono`

**Quick Insights** (3-column grid):
- Current Streak, Best Day, Records Beaten
- White backgrounds with purple accents
- Smaller metrics: `text-2xl font-black font-mono`

**14-Day Heatmap**:
- **Layout**: 2 rows × 7 columns (no day labels)
- **Colors**: Progressive intensity using purple opacity levels
- **Size**: 48px squares (`w-12 h-12`) with 4px borders
- **Legend**: Points system explanation below

**Personal Records Section**:
- Light purple background (`#e5d9ff`)
- List of achievements with hover animations
- Monaco font for data consistency

**Completed Projects**:
- Project cards with detailed metadata
- Trophy icons for completion status
- Grid layout showing all project attributes

**Achievement Gallery**:
- 5-column grid of achievement badges
- Unlocked: Full color with emoji icons
- Locked: Gray with lock icon, reduced opacity
- Hover effects on unlocked achievements

### 4. Prime Page

**Special Overlay**: Fixed diagonal "NEW FEATURE SOON" banner (blue, rotated 12°, top-right)
**Opacity**: Entire main content at 80% opacity to indicate development status

**Layout**: 2-column side-by-side (`grid-cols-2 gap-8`)

**Left Side - System Prompt**:
- **Header**: Blue (`#2563EB`) with edit/save button
- **Content**: Long-form text in Monaco font, scrollable
- **Edit Mode**: Large textarea with blue focus states
- **Save/Cancel**: Button pair with standard styling

**Right Side - Duck-E Journal**:
- **Header**: Light blue (`#0099FF`) with bot icon
- **Today's Entry**: 
  - Date display with calendar icon
  - Textarea for input (`min-h-[120px]`)
  - Save button below
- **Previous Entries**: 
  - Scrollable area (`max-h-[300px]`)
  - Individual entry cards with dates
  - Monaco font for consistency

**Mock Data**: 3 humorous journal entries with realistic dates and content

## State Management & Interactions

### Global State (App.tsx):
- `currentPage`: Controls routing between 4 main pages
- `isAddProjectOpen`: Modal dialog state
- `formData`: Complete form state object for project creation
- `sampleProjects`: Array of mock project data with positioning

### Focus Page State:
- `sessionState`: Multi-step workflow management
- `selectedProject`, `sessionDuration`, `willpowerLevel`: User selections
- `timeRemaining`: Live countdown timer
- `useEffect` hook for timer management

### Analytics Page State:
- Mock data generation for 14-day period
- Complex calculations for metrics and personal records
- Achievement system with unlock status

### Shared Layout State:
- Dynamic theming based on current page
- Background color adaptation
- Button styling coordination

## Component Architecture

### Reusable Components:
- `ProjectIcon`: SVG pattern generation for categories
- `PatternLegend`: Mini pattern displays with labels
- `CompactGuidance`: Score explanation boxes
- `CategoryBlock`, `PriorityBlock`, `ConfidenceBlock`: Form selection components

### UI Library Integration:
- Shadcn/ui components extensively customized with neo-brutal styling
- All form controls use 4px borders and custom focus states
- Dialog, Select, Input, Textarea, RadioGroup, Label components

### Custom Animations:
- CSS keyframes for urgent timer pulsing
- Hover/active state transforms on all interactive elements
- Consistent 100ms transition duration

## Technical Implementation Notes

### CSS Architecture:
- Tailwind v4 with custom CSS variables
- Global utility classes for neo-brutal effects
- Page-specific color coordination through computed styles
- No CSS modules or styled-components

### TypeScript Integration:
- Strict typing for all state objects
- Interface definitions for complex data structures
- Type-safe event handlers and component props

### Performance Considerations:
- Minimal re-renders through careful state management
- Mock data generation for development/demo purposes
- Efficient timer implementation with cleanup

### Accessibility:
- High contrast color combinations
- Bold typography for readability
- Clear focus states on all interactive elements
- Semantic HTML structure maintained

## File Structure

```
├── App.tsx (Main component with routing logic)
├── components/
│   ├── AnalyticsPage.tsx (Data dashboard)
│   ├── FocusPage.tsx (Deep focus sessions)
│   ├── PrimePage.tsx (System prompt & journal)
│   ├── SharedLayout.tsx (Universal layout shell)
│   └── ui/ (Shadcn components library)
├── styles/
│   └── globals.css (Tailwind v4 + custom animations)
└── guidelines/
    └── Guidelines.md (Development guidelines)
```

## Mock Data Patterns

### Sample Projects (8 total):
```javascript
{ id: 1, category: 'WORK', x: 75, y: 25, isBossBattle: true, title: 'Q4 Revenue Push' }
{ id: 2, category: 'LEARN', x: 25, y: 35, isBossBattle: false, title: 'React Advanced' }
// ... continues with varied positioning and categories
```

### Focus Session Data:
- Duration options: 60, 90, 120 minutes
- Willpower levels: high, medium, low with specific UI labels
- Mindset feedback: excellent, good, challenging

### Analytics Metrics:
- XP calculation: 60min=1.0, 90min=1.5, 120min=2.0 points
- 14-day heatmap with progressive purple opacity
- Achievement system with unlock conditions

### Form State Structure:
```javascript
{
  projectName: '', costScore: '', benefitScore: '', category: '',
  priority: '', dueDate: '', description: '', status: '', confidence: ''
}
```

This comprehensive description should enable another LLM to recreate the **Production Rebellion** application with complete fidelity to its neo-brutalist design philosophy, complex state management, and sophisticated visual design system.
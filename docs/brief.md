---
title: Production Rebellion - Design Brief
version: 0.1.0-alpha
phase: design
date: 2025-08-29
author: Production Rebellion Team
status: active
---

# Production Rebellion - Brief

## Overview

### **What it is:** 

- A professional strategic planning tool that helps knowledge workers:
  - Visualize project priorities spatially (cost/benefit matrix)
  - Bring consciousness to their deep work sessions
  - Strategic decision-making through clear visualization 
  - Track meaningful progress 

- **Two Core Functions:**
  - **STRATEGIC MAP**: Visual project overview using cost/benefit positioning - see everything at once, understand trade-offs
  - **DEEP FOCUS**: Mindful work sessions with post-session awareness - understand your patterns, improve your practice

- It is a **strategic meta-layer** above task and project management tools, todoist, calendar, etc. - not managing the details, but understanding the bigger picture and focus patterns. -> "Strategic workspace for mindful professionals"

- It integrates proven methodologies (GTD capture, Deep Work principles, visual project management) with elegant execution and thoughtful design. also, some gaming references (Duke Nukem, XP, etc.) for just small touches for relief.

###**Why This Matters:**

- This tool creates the strategic pause that prevents productivity system collapse. It's about making better choices through visual clarity and understanding your deep work patterns through gentle tracking.

- **The tagline should reflect:**
  - Professional sophistication
  - Strategic thinking
  - Deep focus
  - Awareness/mindfulness
  - Genuine productivity gains

  **Not:**
  - Gaming culture
  - Rebellion for rebellion's sake
  - Cheesy motivational language
  - Over-the-top epic narratives

### Core Features

The user experience flows through **four distinct "paintings" (pages)**, each serving a specific purpose:

1. **TacticalMap** - Strategic project visualization on a cost/benefit scatter plot with visual prioritization
2. **DeepFocus** -  deep work sessions with willpower tracking and gamified difficulty levels  
3. **Analytics** - Data-driven insights with heatmaps, treemaps, and achievement tracking. (Strava like)
4. **Prime** - Personal operating system with values definition and daily reflection.

**Universal Systems** present across all paintings:
- **App Header with Capture Bar** - Brand identity and navigation menu,  Frictionless thought capture with GTD-inspired triage workflow
- **XP System** - gauge (⚡ icon + points) in top-right
- **Navigation Grid** - Fixed bottom-right 2x2 quadrant for seamless page switching

#### Why "paintings" terminology

The app will embrace Neobrutalism design, each page will have a unique monochromatic color palette.
"TacticalMap" will have for example a Yellow as main color, Black and shades of grey.

## Design Principles

1. **Intuitive by Design**: The interface teaches itself through visual enhancement. Understanding through discovery.

2. **Light Through Function**: Clarity emerges through use.

3. **Brutally Modern, sophisticated elegance**: We embrace totally the neo-brutalism design for this app. 
    **IMPORTANT** : ALL UI decisions, animations,etc should adher to our neo-brutalism design choice.
    **TODO** : develop neo-brutalism design system and components.

## Target User Profile

This app speaks to **anyone** that has a list of projects and is motivated to transform ideas into concrete endeavour. this app helps them to have an helicopter view of their projects, in order to use their critical thinking to decide what's next. With the help of a tool to understand their focus patterns. They include (not exhaustive):

- **The Academic**: PhD students managing research, teaching, and life - need visual clarity for projects
- **The Creative Professional**: Freelance designers, writers, architects
- **The Knowledge Worker**: Developers, consultants, analysts - drowning in initiatives at work and side projects at home
- **The Entrepreneur**: Building while maintaining day job - need to maximize limited focus time
- **The Multi-Passionate**: People with diverse interests - struggling to balance learning, creating, and doing

What unites them:
- They are motivated
- Appreciation for visual organization 
- Like Strava/Whoop feedback mechanism, they want to see their progress, keep tracks and improve their performance

## MVP Success Criteria

### Definition of Done for Beta Launch

**The MVP will be considered ready for beta testing when the following are operational:**

1. **Three Core Paintings** (Pages)
   - ✅ TacticalMap: Full project management with cost/benefit matrix
   - ✅ DeepFocus: Complete session tracking with willpower system
   - ✅ Analytics/Data: Basic visualizations (heatmaps, streaks, achievements)

2. **Universal Components**
   - ✅ Brain Dump capture bar (CMD+K activated)
   - ✅ XP display with weekly tracking
   - ✅ Navigation grid (2x2 quadrant)
   - ✅ Consistent Neobrutalism design across all pages

3. **Authentication & Onboarding**
   - ✅ Combined landing/login page with value proposition
   - ✅ Supabase authentication (email/password)
   - ✅ Welcome toast on first login (full onboarding post-MVP)

4. **Data Persistence**
   - ✅ Core operational tables (projects, captures, sessions, etc.)
   - ✅ Real-time sync for captures and XP
   - ✅ Project CRUD operations
   - ✅ Session tracking and storage

**Notes**: 
- Prime page will be scaffolded but not functional for MVP
- Pricing/payment will not be implemented during beta phase
- Focus is on core functionality validation with beta testers

## Beta Testing Model

### Beta Access

**Open beta approach:**
- Direct signup with Supabase auth
- Everyone who signs up can use the app
- Beta badge/label in app to set expectations
- Optional feedback widget

### Beta Tester Expectations

- Regular usage (at least weekly)
- Feedback on bugs and UX issues
- Feature request submissions
- Understanding that data may be reset post-beta

## Tech Stack

### Frontend
- **Next.js 15** (App Router) - Simple structure, combined landing/auth
- **React 19**
- **TypeScript 5**
- **@tanstack/react-query v5** - Server state management
- **@supabase/supabase-js v2** - Database client
- **Tailwind CSS v4**
- **shadcn/ui v4** components with Neobrutalism styling
- **lucide-react** - Icons (clean, consistent, lightweight)
- **Framer Motion v11** - Animations
- **Recharts v2** - Data visualizations

### Backend & Database
- **Supabase** (PostgreSQL + Auth + Realtime)
- Database tables as defined in spec (11 MVP tables - see Database Schema section)
- Row Level Security for all tables

### Testing Stack & Strategy

#### Testing Tools
- **Vitest** - Unit testing (faster than Jest, better ESM support)
- **@testing-library/react** - Component testing
- **@testing-library/user-event** - User interaction simulation
- **MSW (Mock Service Worker)** - API mocking for integration tests
- **Playwright (via MCP)** - E2E testing for critical user journeys using MCP browser automation
- **@vitest/ui** - Visual test runner

#### Quality Gates (Pre-commit & CI)
- **TypeScript** - `tsc --noEmit` for type checking
- **ESLint** - Code quality (`eslint . --ext .ts,.tsx`)
- **Prettier** - Code formatting (`prettier --check .`)
- **Vitest** - Unit/integration tests (`vitest run`)
- **Bundle size** - Track with `next-bundle-analyzer`

#### Testing Strategy: Hybrid Pragmatic Testing
**Philosophy:** Test what's hard to fix in production, skip what's trivial

**Test Coverage Targets:**
1. **Business Logic (90% coverage)**
   - XP calculations (session & project formulas)
   - Achievement unlock conditions
   - Coordinate transformations (x,y ↔ cost,benefit)
   - Priority/category mappers

2. **Service Layer (80% coverage)**
   - Supabase operations (CRUD with error handling)
   - Optimistic update rollbacks
   - Cache invalidation logic
   - Realtime subscription handlers

3. **Critical User Flows (100% E2E coverage)**
   - Signup → First project → Completion → XP earned
   - Session start → Timer → Completion → Achievement
   - Capture → Triage → Project creation
   - Boss battle selection → Completion → 2x XP

4. **Component Testing (Selected only)**
   - Complex state machines (session flow)
   - Form validation (ProjectCreator modal)
   - Timer logic (DeepFocus page)
   - Skip: Simple presentational components

5. **What NOT to Test**
   - shadcn/ui components (already tested upstream)
   - Simple utilities under 10 lines
   - CSS/styling
   - Static content

**Example Test Structure:**
```typescript
// Business logic test (unit)
describe('XP Calculations', () => {
  test('session XP with low willpower', () => {
    expect(calculateSessionXP(90, 'low')).toBe(110) // (10+45)*2
  })
  
  test('boss battle project XP', () => {
    expect(calculateProjectXP(8, 9, true)).toBe(1440) // 8*9*10*2
  })
})

// Service layer test (integration)
describe('ProjectsService', () => {
  test('prevents coordinate collision', async () => {
    await createProject({ cost: 5, benefit: 5 })
    await expect(createProject({ cost: 5, benefit: 5 }))
      .rejects.toThrow('Coordinate occupied')
  })
})

// Critical flow test (E2E with MCP Playwright)
test('Complete first project earns XP', async ({ page }) => {
  // Only test happy path for E2E
  await loginAsTestUser(page)
  await createProjectViaUI(page, { name: 'Test', cost: 5, benefit: 5 })
  await completeProjectViaUI(page, { accuracy: 3 })
  await expect(page.locator('[data-testid="xp-display"]'))
    .toContainText('250') // 5*5*10
})
```

**Testing Timeline:**
- Day 1-2: No tests (rapid prototyping)
- Day 3-4: TDD for business logic only
- Day 5-6: Integration tests for services
- Day 7: E2E smoke tests + monitoring setup

**Trade-offs:**
- ✅ Gained: Fast development, confident in critical logic
- ❌ Lost: Some UI bugs will escape, edge cases uncovered

### Error Handling Philosophy

All errors should follow the solo-dev humor pattern:
- Acknowledge the limitation
- Explain why it exists (time/resource trade-off)
- Offer a workaround
- Keep it light and self-aware

## Database Schema

### Complete MVP Tables (11 Total)

#### Core Tables
1. **user_profiles** - Extended user data (extends Supabase auth.users)
2. **projects** - TacticalMap projects
3. **captures** - Brain dump items
4. **parking_lot** - Someday/maybe items
5. **sessions** - Deep work sessions
6. **daily_commitments** - Session targets
7. **xp_tracking** - Points system
8. **user_achievements** - Unlocked achievements
9. **achievement_definitions** - Achievement master list
10. **personal_records** - Best performances
11. **week_streaks** - Tracking consecutive weeks with sessions

## "Paintings" 

**NOTE** For MVP we are only focusing on the "TacticalMap", "DeepFocus" and "Universal components" (other paintings will be added later, but scaffolding should already be in place).

### Paintings & Universal Components

### Phase 1: Universal Components Present on all *Paintings* 

Fixed top header across all paintings containing:
- **Left**:  text logo
- **Right**: menu icon for settings/profile (future expansion)

#### Universal Capture Bar
**important note**: Color of this header will vary depending on the painting. (for header label, capture button, hamburger menu)

##### Rationale
In top header (middle position), to provide a frictionless, always-accessible method for capturing thoughts the moment they occur, adhering to the core "capture" principle of GTD. This decouples the act of capturing from the act of organizing, preventing context-switching and reducing cognitive load.

##### UX Flow

**Capture Flow:**
The capture bar sits directly in the app header, always visible across all paintings. When the user has a thought, they click (or CMD+K) on the static input bar labeled "Brain Dump". This transforms into an active textarea where they can type freely. They submit by clicking "Capture" or using Cmd/Ctrl+Enter. 
Then two things happened : 
1. next to "brain dump" appears a badge with "xx to triage"
2. on the TacticalMap, a hidden (if no element in it) "triage" button appears with a badge showing pending items count. 
User can decide wheneevr he want to empty his Inbox (triage queue), by clicking on the "Triage" button. (GTD principles)


##### Business Logic

When a capture is submitted:
1. Create capture item with status 'pending' in database
2. Check if first capture ever - if yes, unlock achievement 
3. Update pending count for TacticalMap badge
4. Log capture timestamp for analytics
5. Reset capture bar to static state

##### Data Captured

**Captures Table Fields:**
- id: uuid (PK)
- user_id: uuid (FK → users.id)
- content: text (the captured thought)
- status: enum ('pending', 'triaged', 'deleted')
- decision: enum ('project', 'parking_lot', 'doing_now', 'routing', 'deleted') - null until triaged
- created_at: timestamp
- triaged_at: timestamp (null until processed)


#### Navigation System

##### Rationale
Fixed navigation ensures users always know where they are and can quickly switch between the four paintings. The 2x2 grid reinforces the spatial concept while colors provide immediate visual orientation.

##### UX Flow

A 2x2 grid sits fixed in the bottom-right corner with four quadrants: "Map" (top-left - TacticalMap page), "Focus" (top-right - DeepFocus page), "Data" (bottom-left), "Prime" (bottom-right). 

The current painting is highlighted with its dominant color. Others are in light grey.

#### XP Points Display

##### Rationale
gamification that rewards without visual animation when earned. The XP system provides continuous positive reinforcement for all productive behaviors. Visual-only feedback (⚡ icon with numbers).

##### Position & Display
Fixed in top-right corner below the header, showing "⚡ 1,250 Points" format (current week's points). Resets weekly on Monday. On hover, shows tooltip: "Points earned this week from completing projects and focus sessions".

##### Business Logic

When Points are earned anywhere in the app:
1. Calculate points based on the event (project completion, focus session, etc.)
2. Get user's timezone from user_profiles
3. Calculate week_start in user's timezone (Monday 00:00:00)
4. Add to weekly total (stored as XP in database)
5. Trigger animation: number counts up from old value to new value
6. Display subtle pulse or glow effect during the count-up
7. Return to static state after animation completes

The component listens for XP events from all paintings and displays as "Points" to user.
Weekly reset happens Monday 00:00:00 in user's timezone.

##### Data Captured

**XP_Tracking Table Fields:**
- id: uuid (PK)
- user_id: uuid (FK → users.id)
- points: integer (amount earned)
- source_type: enum ('project_completion', 'session_completion', 'achievement')
- source_id: uuid (reference to project/session/achievement)
- week_start: date (Monday of the week)
- earned_at: timestamp

### Phase 2: TacticalMap (Page 1)

#### Rationale
To provide a strategic, visual decision-making arena. This page answers, "Of all the things I could do, what should I do?" The Cost vs. Benefit matrix forces users to evaluate projects based on strategic value and priorities at ease. The triage queue and parking lot serve as essential control points for managing the flow of work. This is our crucial, visual painting - information flows from visuals. 

#### UX Flow

**Main View:**
The application's main landing page presents the Cost vs. Benefit Matrix. Projects appear as shapes on the grid (0-10 scale for both axes). Shadow Border represent priority levels (Gold, Black, Grey respectively for must/should/nice), All categories are in a rectangle format, they differentiate by pattern inside (hozitonal line, vertical line, diagonal line, filled-in) and shades of greys. 

**Project Interactions:**
- Click on project: Opens options to edit, mark completed, or abandon
- When completed: First, a dialog box appears asking user if his cost/benefit was accurate(answer : scale 1-5, with 1=much harder than expected, 3=accurate estimate, 5=much easier than expected) (DB: 'accuracy' field)
- Then, Project disappears with animation, XP bar animates up
- Boss Battle: User can designate one project at a time as Boss Battle (2x XP bonus). Can select new one after completing current

**Visual Handling:**
- Projects with cannot have same cost/benefit values in MVP. errors handled gracefully with humor and propose to offset by 1.
- Edge cases (e.g., cost 10, benefit 10) render gracefully within map boundaries
- Visible but Inactive projects appear dimmed at 60% opacity
- Projects with approaching deadlines (≤3 days) show gentle pulse animation

**Buttons Controls:**
Above the chart, three action buttons (left-aligned in horizontal row):
- "Add Project" - Opens ProjectCreator modal for direct project creation
- "Parking Lot" - Shows someday/maybe items list
- "Triage (n)" - Appears when capture items are pending (rightmost position, shows badge with count)

**Chartheader :**
On the left: Cost vs Benefit Analysis Label and on second line : xx project visible
On the right on two lines also, a non-verbose legend of categories, boss-battle, and priority levels.
**Modal Flows:**
- Triage: Processes pending captures one by one (see Phase 1)
- Add Project: Direct creation shortcut when user knows they want to track something
- Parking Lot: Simple list modal showing items
  - Each item shows text and date added
  - Two actions: "Promote" (opens ProjectCreator) or "Delete"
  - Items come from triage when user selects "Parking Lot"

#### Business Logic

**Data Loading:**
1. Fetch all projects for user (active and inactive)
2. Calculate positions based on cost/benefit scores
3. Check for coordinate conflicts (no two projects can have same cost/benefit values in MVP - handled with error message during creation)
4. Apply visual states (opacity, colors, animations)

**Project State Management:**
- Create: Add new project with all fields, set initial status
- Update: Edit cost/benefit/priority/status/confidence
- Complete: 
  1. Set `was_boss_battle = is_boss_battle` (preserve for XP calculation)
  2. Show accuracy check, record result
  3. Calculate XP: (Cost × Benefit × 10) × 2 if was_boss_battle
  4. Trigger achievement checks
  5. Remove from map
- Abandon: Mark as abandoned, remove from map
- Set Boss Battle: 
  1. Start transaction
  2. UPDATE projects SET is_boss_battle = false WHERE user_id = $1 AND is_boss_battle = true
  3. UPDATE projects SET is_boss_battle = true WHERE id = $2
  4. Commit transaction
  (Ensures only one active boss battle via transaction + partial unique index)

**Triage Integration:**
- Monitor pending capture count
- Show/hide Triage button based on count
- Handle triage decisions that create new projects

**Achievement Triggers (10 Total for MVP):**
- "Paths are made by walking" - COUNT(captures WHERE user_id = current_user) = 1
- "First Blood" - COUNT(projects WHERE status = 'completed') = 1
- "Double Digits" - COUNT(projects WHERE status = 'completed') >= 10
- "Giant Slayer" - EXISTS(projects WHERE cost = 10 AND status = 'completed')
- "Dark Souls Mode" - EXISTS(projects WHERE was_boss_battle = true AND confidence = 'low' AND status = 'completed')
- "Frame Perfect" - EXISTS(projects WHERE DATE(completed_at) = due_date)
- "Dedicated" - COUNT(week_streaks WHERE has_session = true) >= 4
- "The Grind" - SUM(sessions.duration WHERE date = today) >= 600
- "The Estimator" - COUNT(projects WHERE confidence = 'high' AND accuracy = '3') >= 5
- "No-Brainer King" - COUNT(projects WHERE cost <= 5 AND benefit >= 5 AND status = 'completed') >= 10

#### Data Captured

**Projects Table Fields:**
- id: uuid (PK)
- user_id: uuid (FK → users.id)
- name: varchar(255) (required)
- cost: integer (1-10, CHECK constraint)
- benefit: integer (1-10, CHECK constraint)
- priority: enum ('must', 'should', 'nice')
- category: enum ('work', 'learn', 'build', 'manage')
- tags: text[] (optional, for flexible categorization)
- status: enum ('active', 'inactive', 'completed', 'abandoned')
- is_boss_battle: boolean (default false)
- was_boss_battle: boolean (snapshot at completion)
- created_at: timestamp
- completed_at: timestamp (null until completed)
- confidence: enum ('very_high', 'high', 'medium', 'low', 'very_low')
- accuracy: enum ('1', '2', '3', '4', '5') - null until completed # 1=much harder, 3=accurate, 5=much easier
- due_date: date (optional)
- description: text (optional)
- UNIQUE constraint on (user_id, cost, benefit) for MVP
- UNIQUE partial index on (user_id) WHERE is_boss_battle = true (ensures only one boss battle per user)

#### Specific Modals (#3)

##### ProjectCreator Modal

###### Rationale
Provides structured project creation with guided scoring to ensure consistent evaluation. The modal helps users think strategically about effort vs impact before committing to track a project.

###### UX Flow

The modal opens when user clicks "Add Project" or chooses "Track Project" during triage.

**Field Entry Process:**
1. **Project Name** - Required, clear title
2. **Cost Score (1-10)** - With guidance:
   - 1-3: Quick wins (<5 hours) - "Could finish in one sitting"
   - 4-6: Moderate effort (5-20 hours) - "Multiple work sessions needed" 
   - 7-10: Major undertaking (>20 hours) - "Significant time investment"
3. **Benefit Score (1-10)** - With guidance:
   - 1-3: Minor improvement - "Nice to have, marginal benefit"
   - 4-6: Notable progress - "Clear value, moves the needle"
   - 7-10: Game-changer - "Transformative, unlocks new possibilities"
4. **Category** - Select ONE:
   - Work: Career, clients, income-generating (DB: 'work')
   - Learn: Education, skill development (DB: 'learn')
   - Build: Creating, side ventures (DB: 'build')
   - Manage: Health, relationships, maintenance (DB: 'manage')
5. **Priority** - Choose one:
   - Must-Do (Critical/Deadline-driven) - DB: 'must'
   - Should-Do (Important but flexible) - DB: 'should'
   - Nice-to-Have (Valuable when time permits) - DB: 'nice'
6. **Due Date** - Optional date picker
7. **Description/Links** - Optional text area for context
8. **Tags** - Optional comma-separated tags for flexible categorization
10. **Status** - Select:
   - Focus: Ready to work on (DB: 'active')
   - Visible: Not current focus (DB: 'inactive')
11. **Confidence** - Required (last field): "Confidence level? 1-5"
   - very high (DB: 'very_high')
   - Magna Cum (DB: 'high')
   - Gut feel (DB: 'medium')
   - Leap Faith (DB: 'low')
   - very low (DB: 'very_low')

After submission, project immediately appears on the map at calculated position.

###### Business Logic

When project is created:
1. Validate required fields (name, cost, benefit, category, priority, confidence)
2. **Check if coordinates are available / check collision**:
   - Call `check_coordinate_availability(user_id, cost, benefit)`
   - If position taken: Handle error gracefully, with message instead of blocking the user. ("Coordinate occupied. My bad - prioritized the achievement system over spatial algorithms." or "That spot's taken. Spent the collision-handling time on that sick difficulty naming. Worth it.")
   - If position available, proceed to step 3
3. Calculate quadrant position based on scores
4. Save to database with created_at timestamp and confidence level
5. If coming from triage, mark capture item as processed
6. Check for first project achievement
7. Update map visualization
8. Close modal

##### Triage Modal

**Triage Flow:**
When the user decides to triage (clicking the "Triage" button on TacticalMap), a modal opens showing items one by one with these options:
- "Track project" → Opens ProjectCreator modal (same as "+ add a project" button present on "TacticalMap" page)
- "Parking Lot" → Moves to Parking Lot  
- "Doing it now." → Removes from queue with reminder toast
- "Routing" → Placeholder for future integrations (Notion/Todoist/Calendar)
- "Delete" → Removes from system

After each decision, once full action is over, the system moves to the next item.

**Business Logic**
During triage:
1. Display oldest item first
2. Record decision 
3. Log triage timestamp
4. Execute decision (create project, move to parking lot, etc.)
5. Auto-advance to next item or close if done

##### ParkingLot Modal

**Rationale**
The Parking Lot is a simple list of items that the user has decided to postpone. It's a way to keep track of ideas that are not currently a priority.

**Data Captured**

**Parking_Lot Table Fields:**
- id: uuid (PK)
- user_id: uuid (FK → users.id)
- capture_id: uuid (FK → captures.id, nullable if created directly)
- content: text
- parked_at: timestamp

### Phase 3: "DeepFocus" (Page 2)

#### Rationale
To provide a dedicated, minimalist environment for deep work and execution. Once a strategic decision has been made on the Map, this page facilitates focused action on those projects, shielding the user from other distractions within the app. He can still navigate to other pages for his work, and capture new ideas.
**Important note**: Projects and deep focus are two separate entities. the only link is that user chooses a project to work on. but you can finish a project for example without having done a single deep focus session on it. 

#### UX Flow

**Daily Flow (First Session):**
On first visit after midnight, commitment modal appears:
- "Want to commit?"
- Choose number of sessions (1-10)
- Can skip with "Not today"

**Main page and Session Setup:**
1. Select project from active projects list (single project)
2. Choose session duration (60, 90, or 120 minutes)
3. Click "Start session"
4. Willpower modal appears: "Before starting, just a quick willpower check"
   - 🔥 Piece Of Cake (High willpower)
   - ☕ Caffeinated (Medium willpower)
   - 🥱 Don't Talk To Me (Low willpower)

**During Session:**
- Countdown timer displays
- Difficulty quote shows (based on willpower + duration with format "Difficulty Level : xxxx(placeholder) ")
- Project name visible (format : "Working on : xxxx " )
- Interrupt button (abandon session - no tracking, just ends)
- Universal Capture Bar remains accessible (header is always present)

**Session End:**
- **If Interrupted**: return to setup
- **If Completed**: 
  - Timer completion sound
  - Mindset check: "Were you in the zone for that session ?"
    - "Shaolin" → DB stores as 'excellent' (highest flow state)
    - "Getting there" → DB stores as 'good' (partial flow state)  
    - "What the heck is the zone ?" → DB stores as 'challenging' (struggled with focus)
  - After mindset check, button that says user : "Great job. Reward yourself and take a break."/ on a second line "you've earned xx points for this session"
  - Points awarded (XP in database), with visual animation.
  - Returns to setup for next session with updated Points and sessions count of the day. (format : " Number of sessions completed today : xxxx " compared to target - if any)

#### Business Logic

**Session Start:**
1. Validate active projects exist (empty state if none)
2. Calculate difficulty multiplier (willpower + duration)
3. Start countdown timer
4. Lock in session parameters
5. Begin tracking elapsed time

**During Session:**
1. Countdown decrements each second
2. user can switch to another tab, or app without countdown to stop.

**Session Completion:**
1. Stop timer
2. Calculate XP (base + difficulty multiplier)
3. Log session data (duration, project, willpower, completion status)
4. Trigger achievements (first session, streak, etc.)
5. Update daily session count

#### Data Captured

**Sessions Table Fields:**
- id: uuid (PK)
- user_id: uuid (FK → users.id)
- project_id: uuid (FK → projects.id, single project)
- duration: integer (60, 90, or 120 minutes)
- willpower: enum ('high', 'medium', 'low')
- completed: boolean (default false)
- mindset: enum ('excellent', 'good', 'challenging') - null if not completed
- started_at: timestamp
- ended_at: timestamp (null until ended)
- date: date (for daily aggregation)
- xp_earned: integer (calculated at completion)

**Daily_Commitments Table Fields:**
- id: uuid (PK)
- user_id: uuid (FK → users.id)
- date: date
- target_sessions: integer (1-10)
- completed_sessions: integer (default 0, updated as sessions complete)
- created_at: timestamp
- UNIQUE constraint on (user_id, date)


#### Difficulty & XP System
**Difficulty Quotes Matrix:**
Based on willpower + duration combination, display during session:
- "I'm Too Young to Die" (High willpower + 60min)
- "Hey, Not Too Rough" (Medium willpower + 60min)
- "Bring It On" (High willpower + 90min)
- "Come Get Some" (Medium willpower + 90min)
- "Damn I'm Good" (Low willpower + 60min)
- "Crunch Time" (High willpower + 120min)
- "Balls of Steel" ⚪⚪ (Medium willpower + 120min)
- "Nightmare Deadline" (Low willpower + 90min)
- "Hail to the King" 👑 (Low willpower + 120min)

**XP Calculation (Standardized Formula):**
- **Session XP**: `(10 + duration_minutes × 0.5) × willpower_multiplier`
  - High willpower (Piece of Cake): 1.0x
  - Medium willpower (Caffeinated): 1.5x  
  - Low willpower (Don't Talk To Me): 2.0x
  - Example: 90min Low willpower = (10 + 45) × 2.0 = 110 XP
- **Interrupted Session**: Fixed 10 XP
- **Project Completion**: `cost × benefit × 10 × (boss_battle ? 2 : 1)`
  - Example: 8×9 Boss Battle = 720 × 2 = 1440 XP
- **Double-click prevention**: UPDATE only if completed = false 

### Phase 4: Analytics/Data (Page 3)

#### Rationale
To provide clear, actionable performance data in a professional way. 

#### UX Flow

**Page Structure (Top to Bottom - left to right - Bento Box):**

**1. Hero Stats Row**
Three cards showing current performance:
- **This Week**: Session count + total hours
  - Large number display: "12 SESSIONS"
  - Subtitle: "18.5 HOURS TOTAL"
- **Current Streak**: Consecutive weeks with sessions
  - Large number display: "7 WEEKS"
  - Subtitle: "KEEP IT GOING!"
  - Calculated in app on session completion (not via trigger)
  - Stored in user_profiles.current_streak for fast display

**2. Weekly Activity Chart**
What user has worked on this week. (deep focus session and hours for each project)

**3. Session Heatmap**
last two weeks calendar grid (2 rows × 7 columns) showing recent activity:
- Each cell = one day
- Color intensity based on number of sessions completed
- Current day marked with border

**4. Project Completion Chart and summary**
Cost/Benefit scatter plot showing completed projects (left side):
- Same 10×10 grid as TacticalMap but way smaller.
- Each completed project = small dot at its original position
- Dot intensity increases with multiple projects at same coordinate:
Summary (right side): 
- list of projects completed this month (with cost/benefit)
- "xx PROJECTS COMPLETED THIS YEAR"

**5. Personal Records**
Clean list of best performances:
- Best Day: "5 SESSIONS (JUNE 15)"
- Best Week: "22 SESSIONS (JUNE 15-21)"
- Max points in a week : "2200 POINTS"(date)
- Longest Streak: "14 DAYS (JUNE 15-28)"

**6. Achievements**
- Unlocked: name + description +teaser
- Locked: name
- All 10 achievements displayed

#### Business Logic

**SQL Queries:** 
1. **Weekly Sessions**: `SELECT COUNT(*), SUM(duration) FROM sessions WHERE user_id = ? AND date >= ? AND completed = true`
2. **Current Streak**: Count consecutive days with completed sessions from today backwards
3. **Total XP**: `SELECT SUM(points) FROM xp_tracking WHERE user_id = ?`
4. **Project Completions**: `SELECT cost, benefit, COUNT(*) FROM projects WHERE status = 'completed' GROUP BY cost, benefit`
5. **Achievements**: `SELECT achievement_key, unlocked_at FROM achievements WHERE user_id = ?`
6. **Personal Records**: Simple MAX() queries on relevant tables

**Data Loading:**
- All metrics calculated on page load via simple SQL
- No complex caching needed - PostgreSQL handles it
- Completed projects cached since they don't change
- Current week data always fresh

#### Data Captured

**Personal_Records Table Fields:**
- id: uuid (PK)
- user_id: uuid (FK → users.id)
- record_type: enum ('best_day_sessions', 'best_week_sessions', 'max_week_points', 'longest_streak')
- value: decimal (the record value)
- achieved_on: date
- metadata: jsonb (additional context like dates range)
- created_at: timestamp
- UNIQUE constraint on (user_id, record_type)

**User_Achievements Table Fields:**
- id: uuid (PK)
- user_id: uuid (FK → users.id)
- achievement_key: varchar(50) (FK → achievement_definitions.key)
- unlocked_at: timestamp
- xp_awarded: integer
- UNIQUE constraint on (user_id, achievement_key)

**Achievement_Definitions Table Fields (System Table):**
- key: varchar(50) (PK - e.g., 'first_step', 'giant_slayer')
- name: varchar(100) (display name)
- description: text (what it means)
- teaser: text (hint for locked state)
- xp_reward: integer (points awarded)
- sort_order: integer (display order)



### Phase 5: Prime (Page 4)
Scaffolding only for now. (universal component and different painting colors)
future features to describe and tease: 
- daily stand-up-like end of day reflection, user "system prompt" (north star)
- augmented by ai - voice agent to log reflections. --> remove friction (will be monitored in datas)

## Authentication & User Management

### Data Captured

**User_Profiles Table Fields (extends Supabase Auth):**
- id: uuid (PK)
- user_id: uuid (FK → auth.users.id, UNIQUE)
- display_name: varchar(100)
- timezone: varchar(50) (default 'UTC', e.g., 'America/New_York')
- current_streak: integer (default 0, maintained by trigger)
- onboarded_at: timestamp (null until onboarding complete)
- is_beta_user: boolean (default true for MVP)
- preferences: jsonb (theme, notifications, etc.)
- created_at: timestamp
- updated_at: timestamp

**Week_Streaks Table Fields:**
- id: uuid (PK)
- user_id: uuid (FK → auth.users.id)
- week_start: date (Monday of the week)
- has_session: boolean (true if at least one session that week)
- sessions_count: integer
- total_minutes: integer
- created_at: timestamp
- UNIQUE constraint on (user_id, week_start)

## MVP Objective
our MVP should be a rock-solid base to add ai features later.
It contains :
- 3 paintings (TacticalMap, DeepFocus, Analytics)
- combined landing/login page for beta testers (value prop + auth)
- welcome toast for first-time users (full onboarding deferred to post-MVP based on beta feedback)
- all logic for the 3 paintings working seamlessly (db, api, ui)















 
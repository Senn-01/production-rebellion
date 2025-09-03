---
title: Phase 3 - UI Functional Validation Gates
version: 1.0.0
phase: phase3-validation
date: 2025-08-30
rationale: Define testable validation criteria for functional behavior in Phase 3 UI implementation, excluding visual styling. Focus on "does it work correctly" not "does it look right".
---

# Phase 3 - UI Functional Validation Gates

## Validation Philosophy

**FUNCTIONAL ONLY** - Test behavior, not appearance. Ignore:
- Colors, styling, animations
- Neo-brutalism design elements  
- Visual polish, spacing, fonts

**TEST ONLY** - Core workflows, data integrity, state management

---

## 1. Core User Flow Validation

### 1.1 TacticalMap - Project CRUD Workflows

#### Project Creation Flow
- [ ] **ProjectCreator Modal Opens**: Click "Add Project" → modal displays with all required fields
- [ ] **Form Validation Works**: 
  - Empty name → error prevents submission
  - Cost/benefit outside 1-10 range → validation message
  - Missing category/priority/confidence → form incomplete
- [ ] **Coordinate Collision Handling**: 
  - Attempt duplicate cost/benefit values → graceful error with humor message
  - Error suggests offset by 1 (matches brief's solo-dev humor pattern)
- [ ] **Project Appears on Map**: Submit valid form → project immediately visible at calculated position
- [ ] **Database Persistence**: Refresh page → project still exists with correct data

#### Triage Workflow  
- [ ] **Capture Integration**: Brain dump item exists → "Triage (n)" button appears with count badge
- [ ] **Triage Modal Functions**: Click triage → modal shows oldest capture first
- [ ] **Decision Processing**: Each triage decision (project/parking/delete) → item processed correctly
- [ ] **Batch Processing**: Multiple captures → processes one by one, auto-advances
- [ ] **Badge Updates**: Complete triage → count badge disappears

#### Project State Management
- [ ] **Boss Battle Setting**: Designate project as boss battle → previous boss battle cleared (atomic)
- [ ] **Project Completion Flow**:
  - Mark complete → accuracy dialog appears (1-5 scale)
  - Submit accuracy → XP calculated correctly (cost × benefit × 10 × boss_multiplier)
  - Project disappears from map
- [ ] **Status Changes**: Active/inactive toggle → visual opacity changes (60% for inactive)

### 1.2 DeepFocus - Session Timer & State

#### Session Setup
- [ ] **Project Selection**: Active projects populate dropdown correctly
- [ ] **Duration Selection**: 60/90/120 minute options function
- [ ] **Willpower Modal**: Click start → willpower check appears with 3 options
- [ ] **Session Parameters Lock**: Start session → duration/project cannot be changed

#### Timer Functionality  
- [ ] **Countdown Accuracy**: Timer decrements correctly every second
- [ ] **Background Persistence**: Switch tabs/apps → timer continues running
- [ ] **Session Data Display**: Shows project name, difficulty quote, remaining time
- [ ] **Interrupt Handling**: Click interrupt → session ends, no data saved

#### Session Completion
- [ ] **Timer Completion**: Reaches 00:00 → completion sound plays (if audio enabled)
- [ ] **Mindset Check**: Completion → mindset modal appears (3 options)
- [ ] **XP Calculation**: Correct formula applied: (10 + duration×0.5) × willpower_multiplier
- [ ] **Database Recording**: Session data persists with all fields populated

### 1.3 Analytics - Data Calculation & Display

#### Data Accuracy
- [ ] **Weekly Stats**: Current week session count/hours calculate correctly
- [ ] **Streak Calculation**: Consecutive weeks with sessions computed properly  
- [ ] **Project Completion Chart**: Completed projects appear at correct cost/benefit coordinates
- [ ] **Personal Records**: Best day/week/points values accurate from database
- [ ] **Achievement Status**: Locked/unlocked states match database conditions

#### Real-time Updates
- [ ] **Session Completion**: Finish session → analytics immediately reflect new data
- [ ] **Project Completion**: Complete project → appears in completion chart
- [ ] **XP Updates**: Any XP-earning action → weekly total updates

---

## 2. Universal Components Validation

### 2.1 Capture Bar (CMD+K)

#### Basic Functionality
- [ ] **Keyboard Activation**: CMD+K (Mac) / Ctrl+K (PC) → capture bar focuses
- [ ] **Click Activation**: Click "Brain Dump" → transforms to active textarea
- [ ] **Text Entry**: Can type freely in textarea
- [ ] **Submission Methods**: Both "Capture" button and Cmd/Ctrl+Enter work
- [ ] **State Reset**: After capture → bar returns to static "Brain Dump" state

#### Data Flow
- [ ] **Database Insert**: Submit capture → creates record with status 'pending'
- [ ] **Badge Updates**: First capture → "xx to triage" badge appears next to brain dump
- [ ] **Triage Integration**: Pending items → TacticalMap shows triage button with count
- [ ] **Achievement Trigger**: First capture → "Paths are made by walking" unlocks

#### Error Handling
- [ ] **Empty Submission**: Submit empty capture → prevented with appropriate message
- [ ] **Network Failure**: Capture during offline → queued or error displayed
- [ ] **Rate Limiting**: Rapid captures → handled gracefully

### 2.2 XP System Display

#### Display Accuracy  
- [ ] **Weekly Total**: Shows current week points correctly (Monday reset)
- [ ] **Real-time Updates**: XP changes → number animates from old to new value
- [ ] **Timezone Handling**: Weekly reset occurs at Monday 00:00 in user timezone
- [ ] **Tooltip Information**: Hover → shows "Points earned this week from completing projects and focus sessions"

#### XP Calculation Validation
- [ ] **Session XP**: (10 + duration×0.5) × willpower_multiplier formula correct
- [ ] **Project XP**: cost × benefit × 10 × boss_battle_multiplier formula correct  
- [ ] **Achievement XP**: Achievement unlock → appropriate points awarded
- [ ] **Double Prevention**: Complete same session/project twice → XP only awarded once

### 2.3 Navigation Grid (2x2)

#### Navigation Functionality
- [ ] **Page Switching**: Click each quadrant → navigates to correct page
- [ ] **Current Page Highlighting**: Current page highlighted, others greyed
- [ ] **Fixed Positioning**: Grid stays in bottom-right corner across all pages
- [ ] **State Preservation**: Navigate between pages → maintains app state

---

## 3. Data Binding & State Management

### 3.1 Real-time Updates

#### Supabase Realtime Integration
- [ ] **XP Changes**: XP earned → UI updates immediately without refresh
- [ ] **Project Changes**: Create/update/complete project → map updates in real-time
- [ ] **Achievement Unlocks**: Achievement earned → badge/notification appears immediately
- [ ] **Capture Processing**: Triage item → badge counts update instantly

#### State Synchronization
- [ ] **Multiple Tabs**: Action in one tab → other tabs reflect changes
- [ ] **Network Reconnection**: Brief disconnect → state syncs on reconnection
- [ ] **Optimistic Updates**: UI updates immediately, rolls back on server error

### 3.2 Form Validation & Error Handling

#### Input Validation
- [ ] **Required Fields**: Missing required data → form cannot submit
- [ ] **Data Types**: Invalid input (non-numeric for cost/benefit) → validation error
- [ ] **Range Validation**: Cost/benefit outside 1-10 → appropriate error message
- [ ] **Duplicate Prevention**: Duplicate coordinates → handled with humor message

#### Error Message Quality
- [ ] **Solo-dev Humor Pattern**: Errors acknowledge limitation, explain why, offer workaround
- [ ] **Clear Language**: Error messages use plain language, avoid technical jargon
- [ ] **Actionable**: Errors tell user exactly what to fix

### 3.3 Modal State Machines

#### Modal Workflow Management
- [ ] **ProjectCreator Flow**: Open → fill form → submit/cancel → appropriate state
- [ ] **Triage Flow**: Open → process items → complete/cancel → correct final state
- [ ] **Session Willpower**: Start session → willpower check → session begins
- [ ] **Completion Flows**: Project/session completion → accuracy/mindset → XP awarded

#### State Persistence
- [ ] **Modal Dismissal**: Close modal without saving → no state changes persist
- [ ] **Browser Refresh**: Refresh during modal → modal closes, no partial state
- [ ] **Navigation During Modal**: Navigate away → modal closes properly

---

## 4. Browser & System Integration

### 4.1 State Persistence

#### Browser Refresh Handling
- [ ] **Authentication State**: Refresh → user remains logged in
- [ ] **Page State**: Refresh TacticalMap → projects still visible  
- [ ] **Active Session**: Refresh during DeepFocus → timer continues from correct time
- [ ] **Form Data**: Accidental refresh → unsaved form data handled gracefully

#### Local Storage Usage
- [ ] **Session Timer**: Timer state persists across page refreshes
- [ ] **Form Drafts**: Partially completed forms → draft saved locally
- [ ] **User Preferences**: Settings persist between sessions

### 4.2 Keyboard Shortcuts & Accessibility

#### Keyboard Navigation
- [ ] **CMD+K/Ctrl+K**: Capture bar activation works from any page
- [ ] **Tab Navigation**: All interactive elements reachable via keyboard
- [ ] **Enter Key**: Form submission works via Enter key
- [ ] **Escape Key**: Modals close via Escape key

#### Accessibility Basics
- [ ] **Screen Reader**: Critical elements have proper labels/roles
- [ ] **Focus Indicators**: Keyboard navigation shows clear focus states
- [ ] **Color Independence**: Functionality doesn't depend on color alone
- [ ] **Text Scaling**: Interface remains usable at 200% text size

---

## 5. Service Layer Integration

### 5.1 Supabase Operations

#### Database CRUD
- [ ] **Create Operations**: All create functions handle success/failure correctly
- [ ] **Read Operations**: Data fetching includes proper error handling
- [ ] **Update Operations**: Optimistic updates with rollback on failure
- [ ] **Delete Operations**: Soft deletes where appropriate, hard deletes confirmed

#### Authentication Integration
- [ ] **Row Level Security**: Users only access their own data
- [ ] **Session Management**: Auth tokens refresh properly
- [ ] **Logout Handling**: Logout clears all local state
- [ ] **Unauthorized Access**: Proper redirects when auth expires

### 5.2 Error Handling & Loading States

#### Network Error Handling
- [ ] **Connection Lost**: Offline state → appropriate message displayed
- [ ] **Request Timeout**: Long requests → timeout with retry option
- [ ] **Server Errors**: 5xx responses → user-friendly error message
- [ ] **Rate Limiting**: 429 responses → appropriate backoff behavior

#### Loading State Management
- [ ] **Initial Load**: App startup → loading indicators while data fetches
- [ ] **Action Feedback**: Button clicks → immediate visual feedback
- [ ] **Background Operations**: Long operations → non-blocking progress indication
- [ ] **Data Refresh**: Manual refresh → visual indication of update

---

## 6. Achievement System Validation

### 6.1 Trigger Conditions

#### Achievement Logic Testing
- [ ] **First Capture**: Single capture → "Paths are made by walking" unlocks
- [ ] **First Project**: Complete first project → "First Blood" unlocks  
- [ ] **Boss Battle Completion**: Complete low-confidence boss battle → "Dark Souls Mode" 
- [ ] **Streak Tracking**: 4 consecutive weeks with sessions → "Dedicated" unlocks
- [ ] **Estimation Accuracy**: 5 accurate high-confidence projects → "The Estimator"

#### Edge Case Handling
- [ ] **Duplicate Triggers**: Same achievement condition met twice → no duplicate unlock
- [ ] **Concurrent Actions**: Multiple achievement-triggering actions → all processed correctly
- [ ] **Database Rollback**: Failed XP award → achievement unlock also rolls back

### 6.2 XP Award Integration  

#### XP Consistency
- [ ] **Achievement XP**: Each achievement awards correct XP amount per definition table
- [ ] **Weekly Totals**: Achievement XP counts toward weekly total
- [ ] **Historical Tracking**: Achievement XP recorded in xp_tracking table with source

---

## Validation Execution Strategy

### Testing Priority (Complete in Order)

1. **Smoke Test (Day 1)**: Universal components + basic navigation
2. **Core Flows (Day 2-3)**: TacticalMap CRUD + DeepFocus timer  
3. **Data Integration (Day 4)**: Analytics accuracy + state management
4. **Edge Cases (Day 5)**: Error handling + system integration
5. **Full Validation (Day 6)**: End-to-end user journeys

### Success Criteria

**PASS**: All validation points marked complete with evidence (screenshots/logs)  
**CONDITIONAL PASS**: 90%+ complete, remaining items documented as known issues  
**FAIL**: Core user flows blocked or data integrity compromised

### Documentation Requirements

For each validation point:
- ✅ PASS: Brief confirmation 
- ❌ FAIL: Description + reproduction steps + severity assessment
- ⚠️ ISSUE: Non-blocking problem + workaround if available

---

**Quality Score: 9/10**
- **Conciseness**: ✅ Focused only on functional behavior, no visual elements
- **Clarity**: ✅ Specific, testable criteria with clear pass/fail conditions  
- **Completeness**: ✅ Covers all core flows from brief, includes edge cases and integration points

**Missing 1 point**: Could include specific test data scenarios for more comprehensive edge case coverage.
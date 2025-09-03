---
title: Critical Issues Fix Plan
version: 1.0.0
date: 2025-08-30
rationale: Strategic plan to address 3 critical architecture issues before implementation
---

# Critical Issues Fix Plan

## Issue 1: Achievement XP Not Recorded in xp_tracking

### Problem
Achievement XP awards are stored in user_achievements.xp_awarded but never flow into xp_tracking table, breaking weekly XP totals.

### Approach A: Modify RPC Function (✅ SELECTED)
**Implementation:** Update `check_and_unlock_achievements()` RPC to insert XP records
**Pros:** 
- Atomic operation within transaction
- Consistent with existing patterns
- Single source of truth
**Cons:** 
- Requires database function update
**Time:** 30 minutes

### Approach B: Handle in API Layer
**Implementation:** achievementsService adds XP after unlock
**Pros:** No database changes
**Cons:** Two operations, potential race condition
**Time:** 20 minutes

### Approach C: Database Trigger
**Implementation:** CREATE TRIGGER on user_achievements INSERT
**Pros:** Automatic, never forgotten
**Cons:** Hidden logic, debugging complexity
**Time:** 40 minutes

## Issue 2: XP Calculation Consistency

### Problem
API manually calculates XP instead of using database RPCs `calculate_session_xp()` and `calculate_project_xp()`.

### Approach A: Use Database RPCs (✅ SELECTED)
**Implementation:** Replace manual calculations with RPC calls
```typescript
// Instead of: xpEarned = (10 + duration * 0.5) * multiplier
const { data: xpEarned } = await supabase.rpc('calculate_session_xp', {...})
```
**Pros:** 
- Single formula source
- Guaranteed consistency
- Database-level validation
**Cons:** 
- Extra network call (minimal ~5ms)
**Time:** 1 hour

### Approach B: Shared TypeScript Library
**Implementation:** Create `/lib/xp-formulas.ts` used by both layers
**Pros:** No extra DB calls, type-safe
**Cons:** Formula duplication, drift risk
**Time:** 45 minutes

### Approach C: Remove Database RPCs
**Implementation:** Centralize all XP logic in API layer
**Pros:** Simpler architecture
**Cons:** Loses database guarantees
**Time:** 2 hours

## Issue 3: Session UI Terminology Mappings

### Problem
UI shows "Piece of Cake" but database stores 'high'. Missing documentation for these mappings.

### Approach A: Document Mapping Constants (✅ SELECTED)
**Implementation:** Add to neo-brutalist-ui-patterns.md
```typescript
export const WILLPOWER_DISPLAY = {
  high: { text: "🔥 Piece Of Cake", emoji: "🔥" },
  medium: { text: "☕ Caffeinated", emoji: "☕" },
  low: { text: "🥱 Don't Talk To Me", emoji: "🥱" }
}

export const MINDSET_DISPLAY = {
  excellent: "Shaolin",
  good: "Getting there",
  challenging: "What the heck is the zone?"
}
```
**Pros:** 
- Clean separation
- Easy to maintain
- Follows existing patterns
**Cons:** 
- Manual mapping required
**Time:** 30 minutes

### Approach B: Database Display Columns
**Implementation:** ALTER TABLE add display_name columns
**Pros:** Database-driven UI
**Cons:** Schema migration complexity
**Time:** 1.5 hours

### Approach C: Component-Level Hardcoding
**Implementation:** Put mappings in React components
**Pros:** Immediate implementation
**Cons:** Scattered logic
**Time:** 20 minutes

## Parallelization Strategy

These fixes can be implemented in parallel by 3 agents:

### Agent 1: Database RPC Fix
- **File:** `/database/schemas.sql`
- **Lines:** 559-634 (check_and_unlock_achievements function)
- **Task:** Add XP tracking insert

### Agent 2: API Service Fix  
- **Files:** `/docs/api-design.md`
- **Lines:** 200-201, 396-404
- **Task:** Replace manual calculations with RPC calls

### Agent 3: UI Documentation Fix
- **File:** `/docs/neo-brutalist-ui-patterns.md`
- **New Section:** After line 531
- **Task:** Add terminology mapping constants

## Implementation Order

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Agent 1       │     │   Agent 2       │     │   Agent 3       │
│ Database RPC    │     │ API Service     │     │ UI Mappings     │
│   (30 min)      │     │   (60 min)      │     │   (30 min)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 │
                         ┌───────▼────────┐
                         │   Verify All   │
                         │   (15 min)     │
                         └────────────────┘
```

## Success Criteria

1. **Achievement XP:** New achievements add records to xp_tracking
2. **XP Calculations:** All XP uses database RPCs
3. **UI Mappings:** Clear documentation for all enum-to-display transformations

## Risk Mitigation

- **Backup:** Create backup of schemas.sql before modifications
- **Testing:** Each fix includes test case
- **Rollback:** Document rollback procedure for each change

Total Time: 2 hours (1 hour with parallelization)
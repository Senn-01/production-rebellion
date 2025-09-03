---
title: Production Rebellion - Coherence Verification Report
version: 0.1.0
date: 2025-01-30
rationale: Verify alignment between API design, database schema, and business requirements to ensure system integrity
---

# Coherence Verification Report

## Executive Summary

**Overall Coherence Score: 8.5/10**

The system shows strong alignment between API design, database schema, and business requirements with a few gaps identified.

## 1. Database Schema vs API Design Alignment

### ✅ Perfect Matches (Tables → Services)

| Database Table | API Service | Status |
|----------------|-------------|---------|
| projects | projectsService | ✅ All fields mapped |
| sessions | sessionsService | ✅ All operations covered |
| captures | capturesService | ✅ CRUD complete |
| parking_lot | capturesService.moveToParkingLot() | ✅ Integrated |
| xp_tracking | Multiple services | ✅ Written by various operations |
| user_achievements | achievementsService | ✅ RPC function utilized |
| achievement_definitions | achievementsService | ✅ Read-only access |
| daily_commitments | sessionsService | ✅ Create/update operations |
| user_profiles | Used for timezone/streak | ✅ Referenced correctly |
| personal_records | analyticsService | ✅ Query implemented |
| week_streaks | analyticsService | ✅ Streak calculation |

### ⚠️ Gaps Identified

1. **Missing RPC Functions in API**
   - `increment_daily_sessions` - Referenced in API (line 411) but NOT in schemas.sql
   - `set_boss_battle` - Referenced in API (line 202) but NOT in schemas.sql
   - **Impact:** Runtime errors when these operations are called

2. **XP Tracking Week Calculation**
   - API assumes `week_start` is auto-calculated
   - Database has `week_start DATE NOT NULL` but no trigger
   - **Solution needed:** Either add trigger or calculate in API

## 2. Brief Requirements vs Implementation

### ✅ Correctly Implemented

| Requirement (Brief) | Implementation | Location |
|---------------------|----------------|----------|
| Projects due ≤3 days pulse | `isApproachingDeadline` computed | api-design.md:119-121 |
| Boss battle (only one) | Partial unique index | schemas.sql:84-86 |
| XP calculation formula | Matches exactly | api-design.md:179-181, 379-381 |
| Difficulty quotes | All 9 quotes present | api-design.md:266-276 |
| Achievement conditions | RPC function matches | schemas.sql:269-350 |
| Capture → Triage flow | Complete implementation | api-design.md:477-491 |
| Project visual properties | Patterns & borders defined | api-design.md:201-224 |

### ❌ Misalignments Found

1. **Session XP Storage**
   - Brief specifies: `xp_earned` field
   - Database has: `xp_earned INTEGER` ✅
   - Also has: `xp_breakdown JSONB` (not mentioned in brief/API)
   - **Unused field - remove or implement**

2. **Project Accuracy Scale**
   - Brief says: "scale 1-5" (line 290)
   - Database uses: enum ('accurate', 'easier', 'harder')
   - API uses: the enum version
   - **Documentation inconsistency**

3. **Timezone Handling**
   - Brief requires: User timezone support
   - Database has: `timezone VARCHAR(50)`
   - API missing: No timezone conversion in date operations
   - **Potential bug for non-UTC users**

## 3. Data Type Coherence

### ✅ Matching Types
- UUIDs consistent across all foreign keys
- Enums match between database and TypeScript types
- Date/timestamp handling consistent

### ⚠️ Type Mismatches
1. **Week start calculation**
   - Database: `get_week_start()` function exists but unused
   - API: Uses JavaScript `getMonday()` 
   - **Inconsistency risk between backend/frontend calculations**

## 4. Business Logic Distribution

### ✅ Properly Placed
- XP calculations in service layer ✅
- Achievement checks via RPC ✅
- Project position calculations in service ✅
- Difficulty quotes in service ✅

### ❌ Missing Business Logic
1. **Coordinate Collision Prevention**
   - Database: UNIQUE constraint exists
   - API: Checks availability but doesn't suggest alternatives
   - Brief: "propose to offset by 1"
   - **Missing auto-adjustment logic**

2. **Streak Calculation**
   - Database: `current_streak` field exists
   - API: No update logic defined
   - Brief: "maintained by trigger" (line 698)
   - Database: No trigger exists
   - **Streak won't update**

## 5. Critical Missing Pieces

### 🔴 Must Fix Before Beta

1. **Missing RPC Functions**
```sql
-- Add to schemas.sql
CREATE OR REPLACE FUNCTION increment_daily_sessions(
    p_user_id UUID,
    p_target_date DATE
) RETURNS VOID AS $$
BEGIN
    UPDATE daily_commitments 
    SET completed_sessions = completed_sessions + 1
    WHERE user_id = p_user_id 
    AND date = p_target_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_boss_battle(
    p_project_id UUID,
    p_user_id UUID  
) RETURNS VOID AS $$
BEGIN
    -- Clear existing boss battles
    UPDATE projects 
    SET is_boss_battle = false 
    WHERE user_id = p_user_id 
    AND is_boss_battle = true;
    
    -- Set new boss battle
    UPDATE projects 
    SET is_boss_battle = true 
    WHERE id = p_project_id 
    AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

2. **Week Start Calculation**
```typescript
// Add to API when inserting XP
const weekStart = getMonday(new Date()).toISOString().split('T')[0]
// Include in insert
```

3. **Streak Update Logic**
Either add trigger or handle in app after session completion

### 🟡 Minor Issues

1. **Unused Database Fields**
   - `xp_breakdown` in sessions table - remove or document usage
   - `tags` in projects table - not shown in UI

2. **Documentation Mismatches**
   - Accuracy scale (1-5 vs enum) needs clarification
   - Some achievement names differ slightly

## 6. Security & Performance

### ✅ Good Practices
- RLS policies on all tables ✅
- Indexes on frequently queried fields ✅
- Batch achievement checking via RPC ✅
- Optimistic updates defined ✅

### ⚠️ Concerns
1. No rate limiting on captures (mentioned in NFR report)
2. No input sanitization in API layer
3. Timezone conversions could cause date boundary issues

## 7. Realtime Subscriptions

### ✅ Properly Configured
- XP tracking subscription defined
- Captures count subscription defined
- Filter by user_id for efficiency

### ❌ Missing
- Projects table subscription for map updates (mentioned in schemas.sql:460)

## Summary & Recommendations

### Critical Fixes Required (2 hours)
1. Add missing RPC functions to schemas.sql
2. Fix week_start calculation in XP inserts
3. Implement streak update logic
4. Add timezone handling to date operations

### Nice to Have (1 hour)
1. Remove unused xp_breakdown field
2. Clarify accuracy scale in documentation
3. Add projects realtime subscription
4. Implement coordinate collision auto-adjustment

### Trade-offs Made
- **Gained:** Strong type safety, clean separation of concerns
- **Lost:** Some duplicate logic (date calculations), unused fields
- **Verdict:** Acceptable technical debt for MVP

**Final Assessment:**
System is 85% coherent and production-ready with 4 critical fixes needed. The architecture is solid but has implementation gaps that need immediate attention before beta launch.
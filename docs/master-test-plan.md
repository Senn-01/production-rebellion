---
title: Master Test Plan - Production Rebellion
version: 1.0.0
created: 2025-08-31
rationale: Comprehensive testing strategy to ensure BULLETPROOF validation of Phase 1 & 2 business logic accuracy per brief.md specifications with 92%+ pass rate target
references:
  - /docs/brief.md
  - /docs/testing-patterns.md
  - /tests/integration/
  - /src/services/
---

# Master Test Plan - Production Rebellion

## Executive Summary

Current Status: **23/25 tests passing (92%)** - requires comprehensive validation framework to reach BULLETPROOF coverage for Phase 1 & 2 requirements.

This master test plan provides a systematic approach to validate all business logic accuracy per brief.md specifications using the singleton service layer architecture documented in testing-patterns.md.

## Current Test Infrastructure Analysis

### Existing Test Structure

```
/tests/
├── integration/
│   ├── business-logic-happy-path.test.ts     ✅ End-to-end workflow validation
│   ├── real-user-business-logic.test.ts      ✅ Authenticated service layer testing
│   └── triage-workflow.test.ts               ✅ Complete triage decision paths
└── unit/
    └── task-2.3-achievements.test.ts          ✅ Achievement system validation
```

### Test Infrastructure Components

1. **Vitest Configuration**: `/vitest.config.ts`
   - JSdom environment for component testing
   - Global test setup with environment validation
   - TypeScript path alias support

2. **Test Setup**: `/src/test/setup.ts`
   - Environment variable validation
   - Global test configuration

3. **Service Layer Architecture**: `/src/services/`
   - 6 core services (projects, sessions, captures, xp, analytics, achievements)
   - Singleton pattern with shared Supabase client
   - Real database integration testing approach

## Phase 1 Validation Requirements (Database, Auth, RLS)

### 1. Database Schema Integrity Tests

**Priority: CRITICAL**
**Coverage Target: 100%**

#### Schema Validation Tests
```typescript
// Test all 11 MVP tables exist with correct structure
describe('Database Schema Validation', () => {
  test('All 11 MVP tables exist', () => {
    // Verify: user_profiles, projects, captures, parking_lot, sessions,
    // daily_commitments, xp_tracking, user_achievements, 
    // achievement_definitions, personal_records, week_streaks
  })
  
  test('Foreign key constraints are enforced', () => {
    // Test CASCADE behavior on user deletion
    // Test referential integrity violations
  })
  
  test('Check constraints prevent invalid data', () => {
    // cost/benefit BETWEEN 1 AND 10
    // x,y coordinates BETWEEN 0 AND 100
    // project positioning uniqueness
  })
})
```

#### RPC Function Tests
```typescript
describe('Database RPC Functions', () => {
  test('calculate_session_xp matches brief.md formulas', () => {
    // All 9 combinations from brief.md line 339-349
    // (10 + duration*0.5) × willpower_multiplier
  })
  
  test('calculate_project_xp with boss battle bonus', () => {
    // cost × benefit × 10 × (boss_battle ? 2 : 1)
  })
  
  test('get_difficulty_quote returns Duke Nukem references', () => {
    // All 9 combinations from brief.md line 402-412
  })
  
  test('check_and_unlock_achievements atomic operations', () => {
    // Verify XP awarded in same transaction
    // Test achievement uniqueness constraints
  })
})
```

### 2. Authentication & Authorization Tests

**Priority: CRITICAL**
**Coverage Target: 100%**

#### Row Level Security (RLS) Tests
```typescript
describe('Row Level Security Validation', () => {
  test('Users can only access their own data', () => {
    // Test with claude@test.com and second test user
    // Verify RLS blocks cross-user data access
  })
  
  test('Unauthenticated requests are blocked', () => {
    // Test all CRUD operations without authentication
    // Should return 401/403 errors
  })
  
  test('Service layer respects RLS policies', () => {
    // Test all 6 services with authentication context
  })
})
```

### 3. Data Integrity & Constraint Tests

**Priority: HIGH**
**Coverage Target: 95%**

#### Unique Constraint Tests
```typescript
describe('Data Integrity Constraints', () => {
  test('Boss battle uniqueness enforced', () => {
    // Only one project can be boss battle per user
    // Test transaction rollback on violation
  })
  
  test('Project coordinate collision prevention', () => {
    // UNIQUE(user_id, cost, benefit)
    // UNIQUE(user_id, x, y) for visual positioning
  })
  
  test('Achievement unlock idempotency', () => {
    // UNIQUE(user_id, achievement_key)
    // No duplicate achievements
  })
})
```

## Phase 2 Validation Requirements (Services, Business Logic, Formulas)

### 1. Service Layer Integration Tests

**Priority: CRITICAL**
**Coverage Target: 90%**

#### Projects Service Validation
```typescript
describe('Projects Service Business Logic', () => {
  test('Project creation with coordinate calculation', () => {
    // Verify x,y calculated from cost/benefit
    // x = ((cost - 1) / 9) * 100
    // y = ((10 - benefit) / 9) * 100
  })
  
  test('Boss battle management workflow', () => {
    // Set boss battle (clears previous)
    // Complete with 2x XP bonus
    // was_boss_battle preservation
  })
  
  test('Project completion accuracy assessment', () => {
    // Test accuracy scale 1-5 mapping
    // Achievement trigger for accurate estimates
  })
})
```

#### Sessions Service Validation
```typescript
describe('Sessions Service Business Logic', () => {
  test('Complete session workflow with XP calculation', () => {
    // Start → Complete → XP award → Achievement check
    // Verify all 9 willpower/duration XP combinations
  })
  
  test('Interrupted session handling', () => {
    // Fixed 10 XP for interrupted sessions
    // No achievement triggers on interruption
  })
  
  test('Daily commitment tracking', () => {
    // Atomic increment of completed_sessions
    // Target vs actual comparison
  })
})
```

#### XP Service Validation
```typescript
describe('XP Service Business Logic', () => {
  test('Weekly XP calculation with timezone support', () => {
    // Monday 00:00:00 in user timezone
    // Week boundary transition handling
  })
  
  test('XP source tracking and history', () => {
    // Proper source_type and source_id references
    // XP history pagination and filtering
  })
})
```

### 2. Achievement System Validation

**Priority: HIGH**
**Coverage Target: 100%**

Following the existing pattern in `/tests/unit/task-2.3-achievements.test.ts`:

#### Achievement Trigger Mapping Tests
```typescript
describe('Achievement System Validation', () => {
  test('All 10 achievements have correct trigger conditions', () => {
    // Verify mapping from ACHIEVEMENT_TRIGGERS
    // Test selective checking (2-7 achievements per event)
  })
  
  test('Achievement progress calculation accuracy', () => {
    // Test real database field mapping
    // Verify captures_count vs total_captures field names
  })
  
  test('Achievement unlock with XP rewards', () => {
    // Atomic unlock + XP award in single transaction
    // Verify XP amounts match achievement_definitions
  })
})
```

### 3. Business Logic Formula Validation

**Priority: CRITICAL**
**Coverage Target: 100%**

#### XP Formula Accuracy Tests
```typescript
describe('XP Formula Accuracy Validation', () => {
  test('Session XP matches brief.md specifications exactly', () => {
    // Test matrix from brief.md line 339-349
    const sessionTests = [
      { duration: 60, willpower: 'high', expected: 40 },    // (10 + 30) × 1.0
      { duration: 60, willpower: 'medium', expected: 60 },  // (10 + 30) × 1.5  
      { duration: 60, willpower: 'low', expected: 80 },     // (10 + 30) × 2.0
      { duration: 90, willpower: 'low', expected: 110 },    // Brief example
      // ... all 9 combinations
    ]
  })
  
  test('Project XP with boss battle multiplier', () => {
    // cost × benefit × 10 × (boss_battle ? 2 : 1)
    // Test boss battle 2x bonus accuracy
  })
  
  test('Difficulty quote matrix completeness', () => {
    // All 9 Duke Nukem references from brief.md
    // Exact string matching for UI display
  })
})
```

## Test File Organization Strategy

### Directory Structure
```
/tests/
├── integration/              # End-to-end workflows
│   ├── user-journey-complete.test.ts       # Full capture→project→session→XP
│   ├── triage-workflow.test.ts              # ✅ Existing
│   ├── boss-battle-workflow.test.ts         # Set→Complete→2x XP
│   └── achievement-unlocking.test.ts        # Real achievement triggers
├── services/                 # Service layer validation
│   ├── projects.service.test.ts             # CRUD + coordinate calculation
│   ├── sessions.service.test.ts             # Timer + XP + achievements
│   ├── captures.service.test.ts             # Triage workflow
│   ├── xp.service.test.ts                   # Weekly calculation + history
│   ├── analytics.service.test.ts            # Metrics aggregation
│   └── achievements.service.test.ts         # ✅ Existing (refactor)
├── database/                 # Database validation
│   ├── schema-integrity.test.ts             # Tables, constraints, indexes
│   ├── rpc-functions.test.ts                # XP formulas, difficulty quotes
│   ├── rls-policies.test.ts                 # Row level security
│   └── data-integrity.test.ts               # Constraints, uniqueness
└── business-logic/           # Pure logic validation
    ├── xp-calculations.test.ts              # Formula accuracy
    ├── coordinate-transforms.test.ts        # cost/benefit ↔ x,y
    ├── achievement-conditions.test.ts       # Trigger logic
    └── difficulty-matrix.test.ts            # Duke Nukem quotes
```

### Test Data Management Strategy

#### Test User Management
```typescript
// Use dedicated test user for consistency
const TEST_USER = {
  email: 'claude@test.com',
  password: 'Test1234'
}

// Multi-user RLS testing
const TEST_USERS = [
  { email: 'user1@test.com', password: 'Test1234' },
  { email: 'user2@test.com', password: 'Test1234' }
]
```

#### Test Data Cleanup Pattern
```typescript
afterEach(async () => {
  // Clean up test data in reverse dependency order
  await supabase.from('xp_tracking').delete().eq('user_id', testUserId)
  await supabase.from('user_achievements').delete().eq('user_id', testUserId)
  await supabase.from('sessions').delete().eq('user_id', testUserId)
  await supabase.from('projects').delete().eq('user_id', testUserId)
    .ilike('name', '%TEST%') // Only delete test data
  await supabase.from('captures').delete().eq('user_id', testUserId)
    .ilike('content', '%TEST%')
  await supabase.from('parking_lot').delete().eq('user_id', testUserId)
  
  await supabase.auth.signOut()
})
```

#### Test Data Isolation
```typescript
// Use prefixes to identify test data
const createTestData = () => ({
  projectName: 'TEST: Analytics Dashboard',
  captureContent: 'TEST: Build user analytics feature',
  description: 'TEST: Data for automated testing'
})
```

## Coverage Matrix: Brief.md Requirements → Test Scenarios

### TacticalMap Requirements Coverage

| Requirement | Test Scenario | File | Priority |
|-------------|---------------|------|----------|
| Cost/benefit matrix (1-10) | Project positioning validation | services/projects.service.test.ts | CRITICAL |
| Project completion workflow | Accuracy assessment + XP award | integration/user-journey-complete.test.ts | CRITICAL |
| Boss battle 2x XP | Set→Complete→XP verification | integration/boss-battle-workflow.test.ts | HIGH |
| Coordinate collision handling | Unique constraints + error messages | database/data-integrity.test.ts | MEDIUM |
| Triage workflow | All 5 decision paths | integration/triage-workflow.test.ts | ✅ EXISTS |

### DeepFocus Requirements Coverage

| Requirement | Test Scenario | File | Priority |
|-------------|---------------|------|----------|
| Session XP calculation | All 9 willpower/duration combinations | business-logic/xp-calculations.test.ts | CRITICAL |
| Difficulty quotes | Duke Nukem reference accuracy | business-logic/difficulty-matrix.test.ts | HIGH |
| Daily commitments | Target tracking + completion | services/sessions.service.test.ts | MEDIUM |
| Interrupted sessions | Fixed 10 XP award | services/sessions.service.test.ts | MEDIUM |

### Analytics Requirements Coverage

| Requirement | Test Scenario | File | Priority |
|-------------|---------------|------|----------|
| Weekly XP calculation | Monday reset + timezone handling | services/xp.service.test.ts | HIGH |
| Achievement system | All 10 achievements + triggers | services/achievements.service.test.ts | ✅ EXISTS |
| Personal records | Best day/week tracking | services/analytics.service.test.ts | MEDIUM |
| Streak calculation | Consecutive weeks logic | services/analytics.service.test.ts | MEDIUM |

### Universal Components Coverage

| Requirement | Test Scenario | File | Priority |
|-------------|---------------|------|----------|
| Capture → Triage | Brain dump processing | services/captures.service.test.ts | HIGH |
| XP display | Real-time updates + weekly reset | services/xp.service.test.ts | HIGH |
| Authentication | RLS policies + service layer | database/rls-policies.test.ts | CRITICAL |

## Testing Approach Following Singleton Pattern

Based on `/docs/testing-patterns.md`, use the **Direct Service Layer Testing** approach:

### Authentication Pattern
```typescript
beforeEach(async () => {
  // Use same singleton client as services
  await supabase.auth.signInWithPassword({
    email: 'claude@test.com',
    password: 'Test1234'
  })
  const { data: { user } } = await supabase.auth.getUser()
  testUserId = user.id
})
```

### Service Testing Pattern
```typescript
test('should create project with coordinate calculation', async () => {
  // Service uses same authenticated singleton
  const project = await projectsService.createProject({
    user_id: testUserId,
    name: 'TEST: Business Logic Validation',
    cost: 7,
    benefit: 8,
    // ... other fields
  })
  
  expect(project.x).toBeCloseTo(66.67, 1) // (7-1)/9*100
  expect(project.y).toBeCloseTo(22.22, 1) // (10-8)/9*100
})
```

## Expected Validation Metrics

### Test Coverage Targets

**Business Logic**: 95%+ coverage
- XP calculations: 100% (all formulas tested)
- Achievement conditions: 100% (all 10 achievements)
- Coordinate transformations: 100%
- Service layer methods: 90%

**Integration Workflows**: 100% coverage
- Complete user journey (capture → project → session → XP)
- Triage workflow (all 5 decision paths) ✅
- Boss battle workflow (set → complete → 2x XP)
- Achievement unlocking (real triggers)

**Database Layer**: 95%+ coverage
- Schema integrity: 100%
- RLS policies: 100%
- RPC functions: 100%
- Constraint enforcement: 95%

### Performance Targets

**Test Execution Speed**
- Unit tests: <2 seconds total
- Service tests: <10 seconds total  
- Integration tests: <30 seconds total
- Database tests: <5 seconds total

**Reliability Metrics**
- Test stability: 98%+ pass rate
- No flaky tests (consistent results)
- Zero false positives from setup/teardown

### Quality Gates

**Pre-Commit Validation**
```bash
# All must pass before code commit
npm run type-check     # TypeScript: 0 errors
npm run lint          # ESLint: 0 errors  
npm run test          # Vitest: 95%+ coverage
npm run build         # Production build successful
```

**Continuous Integration**
```bash
# Extended validation in CI
npm run test:integration  # Real database tests
npm run test:coverage     # Coverage report
npm run test:e2e         # Playwright critical paths
```

## Implementation Timeline

### Phase 1: Database & Auth Tests (Days 1-2)
1. **Schema integrity tests** - Verify all 11 tables + constraints
2. **RLS policy tests** - Multi-user data isolation
3. **RPC function tests** - XP formulas + difficulty quotes

### Phase 2: Service Layer Tests (Days 3-4)
1. **Projects service** - CRUD + coordinate calculation + boss battles
2. **Sessions service** - Timer workflow + XP calculation + achievements
3. **XP service** - Weekly calculation + timezone handling

### Phase 3: Business Logic Tests (Days 5-6)
1. **XP formula accuracy** - All combinations from brief.md
2. **Achievement system** - All 10 triggers + conditions
3. **Integration workflows** - Complete user journeys

### Phase 4: Coverage & Polish (Day 7)
1. **Coverage analysis** - Identify gaps, reach 95%+ targets
2. **Performance optimization** - Sub-30 second test suite
3. **CI integration** - Automated validation pipeline

## Risk Mitigation

### High-Risk Areas

1. **Database Connection Issues**
   - Mitigation: Connection pooling + retry logic
   - Fallback: Mock database layer for unit tests

2. **Authentication State Management**
   - Mitigation: Consistent auth setup/teardown
   - Fallback: JWT token management for edge cases

3. **Test Data Conflicts**
   - Mitigation: Unique test prefixes + cleanup
   - Fallback: Parallel test isolation

4. **Timing-Sensitive Tests**
   - Mitigation: Deterministic date mocking
   - Fallback: Tolerance ranges for time calculations

### Quality Assurance

**Code Review Gates**
- All test files require review
- Coverage reports reviewed for gaps
- Performance metrics monitored

**Validation Process**
- Tests must pass on fresh database
- Cross-browser compatibility verified
- Production environment validation

## Conclusion

This master test plan provides comprehensive coverage of Phase 1 & 2 requirements with a systematic approach to reach BULLETPROOF validation. The strategy follows the established singleton service pattern while ensuring business logic accuracy per brief.md specifications.

**Key Strengths:**
- Comprehensive coverage matrix mapping requirements to tests
- Real database integration following production patterns
- Clear organization strategy with priority-based implementation
- Measurable quality gates and performance targets

**Expected Outcome:**
- Confidence in business logic accuracy (100% formula validation)
- Robust integration testing (all user journeys validated)  
- Production-ready quality gates (95%+ coverage)
- BULLETPROOF foundation for beta launch

**Quality Score: 9/10** - Comprehensive plan ready for systematic implementation with clear validation metrics and BULLETPROOF coverage targets.
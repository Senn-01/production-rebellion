---
title: Testing Patterns - Production Rebellion
version: 1.0.0
created: 2025-08-31
updated: 2025-08-31
rationale: Document correct testing approaches for singleton service layer architecture to avoid over-engineering and maintain simplicity
references:
  - /docs/implementation-log.md
  - /src/services/
  - /tests/integration/
---

# Testing Patterns for Production Rebellion

## Overview
Production Rebellion uses a **singleton service layer architecture** which is the correct choice for our single-database, single-tenant application. This document outlines the right way to test this architecture without over-engineering.

## Architectural Context

### ✅ **Why Singleton is Right for Us**
- **One database**: Single Supabase project across all environments
- **Single-tenant**: Users don't switch between databases
- **Simple CRUD**: No complex multi-database transactions
- **MVP focus**: Speed and simplicity over architectural flexibility

### **Service Layer Pattern**
```typescript
// src/lib/supabase/client.ts
export const supabase = createClient() // ← Singleton (correct choice)

// src/services/captures.service.ts
import { supabase } from '@/lib/supabase/client' // ← Use singleton
export const capturesService = {
  async createCapture(userId: string, content: string) {
    return await supabase.from('captures').insert(...) // ← Direct usage
  }
}
```

## Testing Approaches

### 🎯 **Recommended: Direct Service Layer Testing**

**Use the singleton directly in tests** - this is the simplest and most realistic approach:

```typescript
// tests/integration/service-test.test.ts
import { supabase } from '../../src/lib/supabase/client' // ← Same singleton
import { capturesService } from '../../src/services/captures.service'

describe('Service Integration Tests', () => {
  beforeEach(async () => {
    // Authenticate using the same client the services use
    await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password'
    })
  })

  test('should create capture', async () => {
    // Service uses same authenticated client
    const capture = await capturesService.createCapture(userId, 'test content')
    expect(capture).toBeDefined()
  })

  afterEach(async () => {
    // Clean up and sign out
    await supabase.auth.signOut()
  })
})
```

**✅ Benefits**:
- Simple and straightforward
- Same authentication context as production
- No complex client management
- Tests realistic usage patterns
- Fast to implement and understand

### ⚠️ **Advanced: Session Sharing Pattern**

**Only use when you need separate test client management**:

```typescript
// Only if you need separate test client for specific reasons
import { supabase as serviceClient } from '../../src/lib/supabase/client'

describe('Advanced Service Tests', () => {
  const testClient = createClient(/* test config */)
  
  beforeEach(async () => {
    // Authenticate test client
    await testClient.auth.signInWithPassword({...})
    
    // Share session with service singleton
    const { data: { session } } = await testClient.auth.getSession()
    if (session) {
      await serviceClient.auth.setSession(session)
    }
  })
})
```

**⚠️ Use cases**:
- Testing with different database configurations
- Isolating test data from service layer state
- Complex multi-user testing scenarios

**❌ Avoid unless necessary** - adds complexity without benefits for most tests

### ❌ **Don't Over-Engineer: Dependency Injection**

**Avoid refactoring to dependency injection just for testing**:

```typescript
// DON'T: Over-engineered for our use case
class CapturesService {
  constructor(private client: SupabaseClient) {}
  async createCapture(...) { return this.client.from('captures')... }
}

// Creates unnecessary complexity:
// - More boilerplate code
// - Service instantiation everywhere  
// - No real benefits for single-database app
```

## Testing Strategy by Layer

### **Unit Tests: Service Methods**
```typescript
// Test individual service methods
describe('capturesService', () => {
  test('createCapture validates input', async () => {
    await expect(capturesService.createCapture(userId, ''))
      .rejects.toThrow('Content cannot be empty')
  })
})
```

### **Integration Tests: Complete Workflows**
```typescript
// Test complete user workflows
describe('Triage Workflow', () => {
  test('capture → project → session → XP workflow', async () => {
    const capture = await capturesService.createCapture(userId, content)
    await capturesService.triageCapture(capture.id, userId, 'project')
    const project = await projectsService.createProject({...})
    // ... complete workflow
  })
})
```

### **Database Tests: RPC Functions**
```typescript
// Test database functions directly
describe('Database Functions', () => {
  test('calculate_session_xp formula', async () => {
    const { data: xp } = await supabase.rpc('calculate_session_xp', {
      p_duration: 90,
      p_willpower: 'low'
    })
    expect(xp).toBe(110) // (10 + 45) × 2.0
  })
})
```

## Authentication Testing Patterns

### **Single User Tests** (Most Common)
```typescript
const testUser = {
  email: 'claude@test.com',
  password: 'Test1234'
}

beforeEach(async () => {
  await supabase.auth.signInWithPassword(testUser)
  const { data: { user } } = await supabase.auth.getUser()
  testUserId = user.id
})
```

### **Multi-User Tests** (When Needed)
```typescript
// For testing user isolation, RLS policies
const users = [
  { email: 'user1@test.com', password: 'Test1234' },
  { email: 'user2@test.com', password: 'Test1234' }
]

test('users cannot access each other data', async () => {
  // Test with user1
  await supabase.auth.signInWithPassword(users[0])
  const user1Data = await capturesService.createCapture(user1Id, 'user1 data')
  
  // Switch to user2
  await supabase.auth.signInWithPassword(users[1])
  await expect(capturesService.getCapture(user1Data.id, user2Id))
    .rejects.toThrow() // RLS should block access
})
```

## Data Management

### **Test Data Cleanup**
```typescript
afterEach(async () => {
  // Clean up test data created during test
  await supabase.from('xp_tracking').delete().eq('user_id', testUserId)
  await supabase.from('sessions').delete().eq('user_id', testUserId)
  await supabase.from('projects').delete().eq('user_id', testUserId)
    .ilike('name', '%TEST%') // Only delete test data
  await supabase.from('captures').delete().eq('user_id', testUserId)
    .ilike('content', '%TEST%')
  
  await supabase.auth.signOut()
})
```

### **Test Data Isolation**
```typescript
// Use prefixes to identify test data
const testContent = 'TEST: Create analytics dashboard'
const testProjectName = 'TEST: User Analytics Dashboard'

// Easy cleanup with patterns
.ilike('name', '%TEST%')
.ilike('content', '%TEST%')
```

## Performance Considerations

### **Connection Management**
```typescript
// Good: Single connection per test file
const supabase = createClient(...) // Once at module level

// Bad: Creating multiple connections
beforeEach(() => {
  const client = createClient(...) // Wasteful
})
```

### **Batch Operations**
```typescript
// Good: Clean up in batches
await Promise.all([
  supabase.from('sessions').delete().eq('user_id', testUserId),
  supabase.from('projects').delete().eq('user_id', testUserId),
  supabase.from('captures').delete().eq('user_id', testUserId)
])
```

## Common Patterns

### **Test User Setup**
```typescript
// Use dedicated test user account
const TEST_USER = {
  email: 'claude@test.com', // Real user in test database
  password: 'Test1234',
  // Ensure user exists in test environment
}
```

### **Error Testing**
```typescript
test('handles RLS violations correctly', async () => {
  await supabase.auth.signOut() // Remove authentication
  
  await expect(capturesService.createCapture(userId, 'test'))
    .rejects.toThrow(/row-level security/) // Should fail without auth
})
```

### **Business Logic Validation**
```typescript
test('XP formulas match brief.md specifications', async () => {
  const sessionXP = await sessionsService.completeSession({...})
  expect(sessionXP.xpEarned).toBe(110) // (10 + 45) × 2.0
  
  const projectXP = await projectsService.completeProject(id, userId, '3')
  expect(projectXP.xpEarned).toBe(1120) // 7 × 8 × 10 × 2 (boss battle)
})
```

## Anti-Patterns to Avoid

### ❌ **Don't Mock the Database**
```typescript
// BAD: Mocking loses integration value
const mockSupabase = {
  from: () => ({ insert: jest.fn() })
}
```
**Why**: Database logic (RLS, triggers, functions) won't be tested

### ❌ **Don't Over-Abstract**
```typescript
// BAD: Unnecessary abstraction layer
class TestDatabaseManager {
  constructor(client: SupabaseClient) {}
  // Complex test-specific abstractions
}
```
**Why**: Test code should be simple and direct

### ❌ **Don't Create Artificial Complexity**
```typescript
// BAD: Multiple client instances without purpose
const testClient1 = createClient(config1)
const testClient2 = createClient(config2) 
// Unless you actually need different configs
```

## Conclusion

For Production Rebellion's singleton service architecture:

1. **Use the singleton directly in tests** - simplest and most realistic ✅
2. **Authenticate once per test** - same pattern as production ✅  
3. **Clean up test data properly** - maintain test isolation ✅
4. **Don't over-engineer** - singleton is right for our single-database app ✅

The goal is **realistic, maintainable tests** that validate our business logic without architectural complexity we don't need.

**Quality Score for Testing Approach**: 9/10 - Simple, realistic, and effective for our architecture.
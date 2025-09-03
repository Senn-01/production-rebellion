---
title: Production Rebellion - Next.js Implementation Guide
version: 2.0.0
date: 2025-08-30
rationale: Technical implementation guide for Next.js 15, React 19, and modern stack with breaking changes, patterns, and migration paths
references:
  - /docs/architecture.md
  - /docs/brief.md
  - /database/schemas.sql
  - /docs/neo-brutalist-ui-patterns.md
---

# Production Rebellion - Next.js Implementation Guide

## Table of Contents
1. [Complete Tech Stack](#complete-tech-stack)
2. [Next.js 15 + React 19 Integration](#nextjs-15--react-19-integration)
3. [Tailwind CSS v4 + shadcn/ui v4](#tailwind-css-v4--shadcnui-v4)
4. [Supabase + TanStack Query v5](#supabase--tanstack-query-v5)
5. [TypeScript 5 + Framer Motion 11](#typescript-5--framer-motion-11)
6. [Vercel Deployment](#vercel-deployment)
7. [Integration Patterns](#integration-patterns)
8. [Migration Notes](#migration-notes)

---

## Complete Tech Stack

### Core Framework
- **Next.js 15.0+** - App Router architecture
- **React 19.0+** - Server Components, use() hook, Actions
- **TypeScript 5.5+** - Strict mode, const type parameters

### State & Data Management
- **@tanstack/react-query v5** - Server state management (renamed from React Query)
- **@supabase/supabase-js v2** - Backend as a Service
- **React Context + useState** - UI state only (no Zustand needed for MVP)

### Styling & UI Components
- **Tailwind CSS v4** - Oxide engine, CSS-first configuration
- **shadcn/ui v4** - Component library with neo-brutalist customizations
- **lucide-react** - Icon library
- **Framer Motion v11** - Animation library
- **Recharts v2** - Data visualization

### Backend Infrastructure
- **Supabase**
  - PostgreSQL database (11 tables)
  - Authentication (email/password)
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Edge Functions (Deno runtime)
  - Storage buckets

### Deployment
- **Vercel** - Hosting platform
- **Edge Runtime** - For middleware and API routes
- **ISR/SSG** - Marketing pages
- **CSR** - App pages behind auth

---

## Next.js 15 + React 19 Integration

### Critical Breaking Changes

#### 1. Async Request APIs (WILL BREAK YOUR CODE)
```typescript
// ❌ OLD (Next.js 14)
import { cookies, headers } from 'next/headers';

export function ServerComponent() {
  const cookieStore = cookies();
  const headersList = headers();
}

// ✅ NEW (Next.js 15) - Must be async
import { cookies, headers } from 'next/headers';

export async function ServerComponent() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const params = await params;
  const searchParams = await searchParams;
}
```

**Migration Tool**: `npx @next/codemod@latest next-async-request-api`

#### 2. Caching Behavior Changes
- `GET` Route Handlers: **Uncached by default** (was cached)
- Client Router Cache: `staleTime` defaults to `0` for Page segments
- More server requests but fresher data

#### 3. Sharp Required for Production
```bash
npm install sharp  # squoosh removed, sharp required
```

### React 19 New Features

#### The `use()` Hook Pattern
```typescript
// Server Component passes promise
async function ServerComponent() {
  const dataPromise = fetchUserData(); // Don't await
  return <ClientComponent dataPromise={dataPromise} />;
}

// Client Component consumes promise
'use client';
import { use, Suspense } from 'react';

function ClientComponent({ dataPromise }) {
  const data = use(dataPromise); // Suspends here
  return <div>{data.name}</div>;
}

// Wrap with Suspense
<Suspense fallback={<Loading />}>
  <ClientComponent dataPromise={dataPromise} />
</Suspense>
```

#### Server Actions (API Route Replacement)
```typescript
// app/actions/captures.ts
'use server'

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

export async function createCapture(formData: FormData) {
  const content = formData.get('content') as string;
  
  const { data, error } = await supabase
    .from('captures')
    .insert({ content, status: 'pending' })
    .select()
    .single();
    
  if (!error) {
    revalidatePath('/app/map');
  }
  
  return { data, error };
}

// In component - NO API ROUTES NEEDED
<form action={createCapture}>
  <input name="content" required />
  <button type="submit">Capture</button>
</form>
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Tailwind CSS v4 + shadcn/ui v4

### Tailwind v4 Breaking Changes

#### 1. CSS-First Configuration (No More JS Config)


#### 2. Browser Requirements
- Safari 16.4+
- Chrome 111+
- Firefox 128+
- **No IE11 support**

#### 3. Installation Changes
```bash
# Remove old packages
npm uninstall tailwindcss postcss autoprefixer

# Install v4
npm install tailwindcss @tailwindcss/postcss

# No config file needed!
```
---

## Supabase + TanStack Query v5

### TanStack Query v5 Breaking Changes
```typescript
// ❌ OLD (v4)
useQuery(['todos'], fetchTodos, {
  onSuccess: (data) => console.log(data),
  cacheTime: 5 * 60 * 1000
})

// ✅ NEW (v5) - Single object, renamed options
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  gcTime: 5 * 60 * 1000, // was cacheTime
  // onSuccess removed - handle in component
})
```

### Core Integration Pattern
```typescript
// lib/supabase-query.ts
import { createClient } from '@supabase/supabase-js';
import { QueryClient } from '@tanstack/react-query';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

### Query Keys Pattern
```typescript
// lib/query-keys.ts
export const queryKeys = {
  all: ['production-rebellion'] as const,
  projects: () => [...queryKeys.all, 'projects'] as const,
  project: (id: string) => [...queryKeys.projects(), id] as const,
  captures: () => [...queryKeys.all, 'captures'] as const,
  capturesByStatus: (status: string) => [...queryKeys.captures(), status] as const,
  sessions: () => [...queryKeys.all, 'sessions'] as const,
  achievements: () => [...queryKeys.all, 'achievements'] as const,
  xp: () => [...queryKeys.all, 'xp'] as const,
  weeklyXP: () => [...queryKeys.xp(), 'weekly'] as const,
};
```

### Production Rebellion Specific Patterns

#### Dual Coordinate System
```typescript
// Database stores BOTH cost/benefit AND x,y
interface Project {
  // Business logic fields
  cost: number;      // 1-10
  benefit: number;   // 1-10
  
  // UI rendering fields (auto-calculated)
  x: number;         // 0-100 (percentage)
  y: number;         // 0-100 (percentage)
}

// No runtime transformation needed - UI reads x,y directly
const ProjectIcon = ({ project }) => (
  <div style={{ 
    left: `${project.x}%`,
    top: `${100 - project.y}%`  // Inverted for visual layout
  }}>
    {/* Icon content */}
  </div>
);
```

#### Priority System Mapping
```typescript
// lib/transformers/priority.ts
const priorityMap = {
  // DB -> UI Display
  toUI: {
    'must': 'Urgent',
    'should': 'Normal',
    'nice': 'Low'
  },
  // UI -> DB
  toDB: {
    'Urgent': 'must',
    'Normal': 'should',
    'Low': 'nice'
  }
};

// Service layer transformation
export async function getProjects() {
  const { data } = await supabase.from('projects').select('*');
  return data.map(project => ({
    ...project,
    priority: priorityMap.toUI[project.priority]
  }));
}
```

#### Smart Achievement Triggers
```typescript
// lib/achievements/triggers.ts
const achievementTriggers = {
  'project_complete': ['first_blood', 'double_digits', 'giant_slayer', 'dark_souls_mode'],
  'session_complete': ['the_grind', 'dedicated'],
  'capture_create': ['paths_are_made_by_walking']
};

// Check only relevant achievements
export async function checkAchievements(action: string, userId: string) {
  const relevant = achievementTriggers[action];
  // Check 2-7 achievements instead of all 10
  return checkSpecificAchievements(relevant, userId);
}
```

### Optimistic Updates Pattern
```typescript
// hooks/use-capture-mutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateCapture() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from('captures')
        .insert({ content, status: 'pending' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.captures() });
      
      const previousCaptures = queryClient.getQueryData(queryKeys.captures());
      
      // Optimistic update
      queryClient.setQueryData(queryKeys.captures(), (old: any) => [
        ...old,
        { id: 'temp', content, status: 'pending', created_at: new Date() }
      ]);
      
      return { previousCaptures };
    },
    
    onError: (err, content, context) => {
      // Rollback
      queryClient.setQueryData(queryKeys.captures(), context?.previousCaptures);
    },
    
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.captures() });
    }
  });
}
```

### Real-time Subscriptions
```typescript
// hooks/use-realtime.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeCaptures() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel('captures-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'captures' },
        (payload) => {
          // Invalidate and refetch
          queryClient.invalidateQueries({ queryKey: queryKeys.captures() });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
```

---

## TypeScript 5 + Framer Motion 11

### TypeScript 5 Strict Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    
    // TypeScript 5 features
    "allowImportingTsExtensions": true,
    "moduleDetection": "force",
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    
    // Performance
    "incremental": true,
    "skipLibCheck": true
  }
}
```

### Framer Motion v11 Bundle Optimization
```typescript
// ❌ BAD - Full bundle (34kb)
import { motion } from 'framer-motion';

// ✅ GOOD - Optimized bundle (4.6kb)
import { LazyMotion, m, domAnimation } from 'framer-motion';

export function App() {
  return (
    <LazyMotion features={domAnimation}>
      <m.div animate={{ x: 100 }} />
    </LazyMotion>
  );
}
```

### Type-Safe Animation Variants
```typescript
// animations/variants.ts
interface BrutalVariants {
  initial: any;
  animate: any;
  exit: any;
  hover?: any;
  tap?: any;
}

export const brutalButtonVariants: BrutalVariants = {
  initial: { scale: 1, boxShadow: '8px 8px 0px #000' },
  animate: { scale: 1, boxShadow: '8px 8px 0px #000' },
  hover: { 
    scale: 1.02,
    x: -4,
    y: -4,
    boxShadow: '12px 12px 0px #000',
    transition: { duration: 0.1 }
  },
  tap: {
    scale: 0.98,
    x: 4,
    y: 4,
    boxShadow: '2px 2px 0px #000'
  },
  exit: { scale: 0.9, opacity: 0 }
};
```

### XP Counter Animation
```typescript
// components/xp-counter.tsx
import { useAnimationControls } from 'framer-motion';
import { LazyMotion, m, domAnimation } from 'framer-motion';

export function XPCounter({ xp }: { xp: number }) {
  const controls = useAnimationControls();
  
  useEffect(() => {
    controls.start({
      scale: [1, 1.2, 1],
      rotateY: [0, 360],
      transition: { duration: 0.6, ease: "backOut" }
    });
  }, [xp, controls]);
  
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="text-6xl font-mono font-bold text-gold"
        animate={controls}
      >
        ⚡ {xp.toLocaleString()}
      </m.div>
    </LazyMotion>
  );
}
```

### Achievement Unlock Animation
```typescript
const achievementVariants = {
  hidden: { scale: 0, rotateY: -180, opacity: 0 },
  visible: {
    scale: 1,
    rotateY: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  },
  exit: {
    scale: 0,
    rotateY: 180,
    opacity: 0,
    transition: { duration: 0.4 }
  }
};
```

---

## Vercel Deployment

### Environment Variables Setup
```bash
# Production (Vercel Dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # Server-only

# Development (.env.local)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### vercel.json Configuration
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/revalidate",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### next.config.js for Vercel
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig;
```

### Edge Runtime for Auth Middleware
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Protect app routes
  if (!session && req.nextUrl.pathname.startsWith('/app')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return res;
}

export const config = {
  matcher: ['/app/:path*']
};
```

---

## Integration Patterns

### 1. Server Component Data Fetching
```typescript
// app/app/map/page.tsx
import { supabase } from '@/lib/supabase';
import { MapView } from '@/components/map-view';

export default async function MapPage() {
  // Direct database call in Server Component
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .in('status', ['active', 'inactive'])
    .order('created_at', { ascending: false });
  
  return <MapView initialProjects={projects} />;
}
```

### 2. Client Component with TanStack Query
```typescript
// components/map-view.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export function MapView({ initialProjects }) {
  const { data: projects } = useQuery({
    queryKey: queryKeys.projects(),
    queryFn: fetchProjects,
    initialData: initialProjects,
    staleTime: 5 * 60 * 1000,
  });
  
  return (
    // Your component JSX
  );
}
```

### 3. Form with Server Action
```typescript
// components/capture-form.tsx
'use client';

import { createCapture } from '@/app/actions/captures';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="brutal-button"
    >
      {pending ? 'Capturing...' : 'CAPTURE ⌘C'}
    </button>
  );
}

export function CaptureForm() {
  return (
    <form action={createCapture}>
      <textarea 
        name="content" 
        required
        className="w-full p-4 border-4 border-black"
      />
      <SubmitButton />
    </form>
  );
}
```

### 4. Optimistic UI Pattern
```typescript
// hooks/use-optimistic-projects.ts
import { useOptimistic } from 'react';

export function useOptimisticProjects(projects) {
  const [optimisticProjects, addOptimisticProject] = useOptimistic(
    projects,
    (state, newProject) => [...state, newProject]
  );
  
  async function createProject(formData: FormData) {
    const tempProject = {
      id: 'temp',
      name: formData.get('name'),
      status: 'active',
      created_at: new Date()
    };
    
    addOptimisticProject(tempProject);
    await createProjectAction(formData);
  }
  
  return { optimisticProjects, createProject };
}
```

---

## Migration Notes

### From Next.js 14 to 15
1. **Run codemod**: `npx @next/codemod@latest next-async-request-api`
2. **Install sharp**: `npm install sharp`
3. **Update async APIs**: Add `await` to cookies(), headers(), params, searchParams
4. **Review caching**: GET routes now uncached by default

### From Tailwind v3 to v4
1. **Remove config file**: Delete `tailwind.config.js`
2. **Update packages**: `npm uninstall tailwindcss postcss autoprefixer && npm install tailwindcss @tailwindcss/postcss`
3. **Convert to CSS config**: Move theme to `@theme` in CSS
4. **Update class names**: Some utilities renamed (shadow-sm → shadow-xs)

### From TanStack Query v4 to v5
1. **Update imports**: `@tanstack/react-query` (no change)
2. **Fix query syntax**: Convert to single object pattern
3. **Rename options**: `cacheTime` → `gcTime`, `isLoading` → `isPending`
4. **Remove callbacks**: Handle `onSuccess`, `onError` in components

### From React 18 to 19
1. **No breaking changes**: Fully backward compatible
2. **Adopt new features**: use() hook, Server Actions, improved Suspense
3. **Update types**: `@types/react@19`

### Database Migration
```sql
-- Run these migrations in order
-- 1. Create all tables as defined in architecture.md
-- 2. Enable RLS on all tables
-- 3. Create policies for user data isolation
-- 4. Add indexes for performance
-- 5. Set up real-time subscriptions
```

---

## Quick Reference

### Package Installation
```bash
# Core dependencies
npm install next@15 react@19 react-dom@19
npm install typescript@5 @types/react@19 @types/react-dom@19
npm install @tanstack/react-query@5 @supabase/supabase-js@2
npm install tailwindcss @tailwindcss/postcss
npm install framer-motion@11 lucide-react recharts@2
npm install sharp

# Dev dependencies
npm install -D @types/node eslint eslint-config-next
```

### Common Gotchas
1. **Async components must be marked async** - Server Components using cookies/headers
2. **Tailwind v4 requires CSS-first config** - No more JS config files
3. **TanStack Query v5 removed callbacks** - Handle side effects in components
4. **Supabase Edge Functions run on Deno** - Not directly deployable to Vercel
5. **Sharp is required for production** - Install it or builds will fail
6. **Browser requirements increased** - Safari 16.4+, Chrome 111+
7. **Default caching changed** - GET routes uncached by default

---

## Performance Checklist

- [ ] LazyMotion for Framer Motion (4.6kb vs 34kb)
- [ ] Edge Runtime for middleware
- [ ] ISR for marketing pages
- [ ] Optimistic updates for all mutations
- [ ] Image optimization with next/image
- [ ] Bundle analysis with @next/bundle-analyzer
- [ ] Strict TypeScript for catching errors early
- [ ] Query key patterns for cache management
- [ ] Real-time subscriptions only where needed
- [ ] Server Actions instead of API routes

---

*This document represents the current state of the Production Rebellion tech stack as of August 2025. The bleeding-edge nature of these technologies means things will break, but at least they'll break fast.*
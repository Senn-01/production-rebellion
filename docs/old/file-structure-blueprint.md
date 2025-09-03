# Production Rebellion - File Structure Blueprint

## Project Overview
Feature-first Next.js 15 architecture with 5 core modules: projects, sessions, captures, analytics, achievements. Neo-brutalist UI with Supabase backend integration.

## Complete Directory Structure

```
production-rebellion/
├── README.md [SCAFFOLD]
├── package.json [CRITICAL] ~50 lines
├── package-lock.json [AUTO-GENERATED]
├── tsconfig.json [CRITICAL] ~30 lines
├── tailwind.config.js [CRITICAL] ~80 lines
├── next.config.mjs [STANDARD] ~25 lines
├── .env.local [CRITICAL] ~15 lines
├── .env.example [STANDARD] ~15 lines
├── .gitignore [STANDARD] ~40 lines
├── .eslintrc.json [STANDARD] ~20 lines
├── .prettierrc [STANDARD] ~10 lines
├── middleware.ts [CRITICAL] ~40 lines
│
├── app/ (Next.js 15 App Router)
│   ├── globals.css [CRITICAL] ~200 lines
│   ├── layout.tsx [CRITICAL] ~80 lines
│   ├── page.tsx [CRITICAL] ~120 lines
│   ├── loading.tsx [STANDARD] ~30 lines
│   ├── error.tsx [STANDARD] ~50 lines
│   ├── not-found.tsx [STANDARD] ~40 lines
│   │
│   ├── (auth)/
│   │   ├── layout.tsx [STANDARD] ~40 lines
│   │   ├── login/
│   │   │   └── page.tsx [CRITICAL] ~150 lines
│   │   └── register/
│   │       └── page.tsx [CRITICAL] ~180 lines
│   │
│   ├── dashboard/
│   │   ├── layout.tsx [CRITICAL] ~100 lines
│   │   ├── page.tsx [CRITICAL] ~200 lines
│   │   ├── loading.tsx [STANDARD] ~25 lines
│   │   └── error.tsx [STANDARD] ~35 lines
│   │
│   ├── projects/
│   │   ├── layout.tsx [STANDARD] ~60 lines
│   │   ├── page.tsx [CRITICAL] ~180 lines
│   │   ├── new/
│   │   │   └── page.tsx [CRITICAL] ~220 lines
│   │   ├── [id]/
│   │   │   ├── page.tsx [CRITICAL] ~250 lines
│   │   │   ├── edit/
│   │   │   │   └── page.tsx [CRITICAL] ~200 lines
│   │   │   └── sessions/
│   │   │       ├── page.tsx [CRITICAL] ~180 lines
│   │   │       └── [sessionId]/
│   │   │           └── page.tsx [CRITICAL] ~300 lines
│   │   └── loading.tsx [STANDARD] ~30 lines
│   │
│   ├── sessions/
│   │   ├── layout.tsx [STANDARD] ~50 lines
│   │   ├── page.tsx [CRITICAL] ~160 lines
│   │   ├── active/
│   │   │   └── page.tsx [CRITICAL] ~350 lines
│   │   ├── [id]/
│   │   │   ├── page.tsx [CRITICAL] ~280 lines
│   │   │   └── captures/
│   │   │       └── page.tsx [CRITICAL] ~220 lines
│   │   └── loading.tsx [STANDARD] ~25 lines
│   │
│   ├── captures/
│   │   ├── layout.tsx [STANDARD] ~40 lines
│   │   ├── page.tsx [CRITICAL] ~140 lines
│   │   ├── [id]/
│   │   │   └── page.tsx [STANDARD] ~180 lines
│   │   └── loading.tsx [STANDARD] ~25 lines
│   │
│   ├── analytics/
│   │   ├── layout.tsx [STANDARD] ~50 lines
│   │   ├── page.tsx [CRITICAL] ~250 lines
│   │   ├── reports/
│   │   │   └── page.tsx [STANDARD] ~200 lines
│   │   └── loading.tsx [STANDARD] ~30 lines
│   │
│   ├── achievements/
│   │   ├── layout.tsx [STANDARD] ~40 lines
│   │   ├── page.tsx [STANDARD] ~120 lines
│   │   └── loading.tsx [STANDARD] ~25 lines
│   │
│   └── api/
│       ├── auth/
│       │   └── callback/
│       │       └── route.ts [CRITICAL] ~60 lines
│       ├── projects/
│       │   ├── route.ts [CRITICAL] ~100 lines
│       │   └── [id]/
│       │       └── route.ts [CRITICAL] ~120 lines
│       ├── sessions/
│       │   ├── route.ts [CRITICAL] ~80 lines
│       │   ├── [id]/
│       │   │   └── route.ts [CRITICAL] ~90 lines
│       │   └── active/
│       │       └── route.ts [CRITICAL] ~70 lines
│       ├── captures/
│       │   ├── route.ts [CRITICAL] ~60 lines
│       │   └── [id]/
│       │       └── route.ts [STANDARD] ~50 lines
│       ├── analytics/
│       │   ├── route.ts [STANDARD] ~80 lines
│       │   └── export/
│       │       └── route.ts [STANDARD] ~100 lines
│       └── achievements/
│           └── route.ts [SCAFFOLD] ~40 lines
│
├── components/ (Shared UI Components)
│   ├── ui/ (Shadcn/UI Components)
│   │   ├── button.tsx [CRITICAL] ~80 lines
│   │   ├── input.tsx [CRITICAL] ~60 lines
│   │   ├── textarea.tsx [CRITICAL] ~50 lines
│   │   ├── select.tsx [CRITICAL] ~120 lines
│   │   ├── dialog.tsx [CRITICAL] ~100 lines
│   │   ├── dropdown-menu.tsx [CRITICAL] ~150 lines
│   │   ├── card.tsx [CRITICAL] ~40 lines
│   │   ├── badge.tsx [CRITICAL] ~35 lines
│   │   ├── progress.tsx [CRITICAL] ~45 lines
│   │   ├── tabs.tsx [CRITICAL] ~80 lines
│   │   ├── table.tsx [STANDARD] ~120 lines
│   │   ├── toast.tsx [STANDARD] ~90 lines
│   │   ├── tooltip.tsx [STANDARD] ~70 lines
│   │   ├── skeleton.tsx [STANDARD] ~30 lines
│   │   └── separator.tsx [STANDARD] ~25 lines
│   │
│   ├── layout/
│   │   ├── header.tsx [CRITICAL] ~120 lines
│   │   ├── sidebar.tsx [CRITICAL] ~200 lines
│   │   ├── navigation.tsx [CRITICAL] ~150 lines
│   │   ├── breadcrumbs.tsx [STANDARD] ~80 lines
│   │   └── footer.tsx [SCAFFOLD] ~60 lines
│   │
│   ├── auth/
│   │   ├── login-form.tsx [CRITICAL] ~180 lines
│   │   ├── register-form.tsx [CRITICAL] ~220 lines
│   │   ├── auth-provider.tsx [CRITICAL] ~100 lines
│   │   └── protected-route.tsx [CRITICAL] ~60 lines
│   │
│   ├── dashboard/
│   │   ├── stats-cards.tsx [CRITICAL] ~120 lines
│   │   ├── recent-activity.tsx [CRITICAL] ~140 lines
│   │   ├── productivity-chart.tsx [CRITICAL] ~180 lines
│   │   ├── quick-actions.tsx [CRITICAL] ~100 lines
│   │   └── session-timer.tsx [CRITICAL] ~160 lines
│   │
│   ├── common/
│   │   ├── loading-spinner.tsx [STANDARD] ~40 lines
│   │   ├── empty-state.tsx [STANDARD] ~60 lines
│   │   ├── error-boundary.tsx [STANDARD] ~80 lines
│   │   ├── confirmation-modal.tsx [STANDARD] ~100 lines
│   │   ├── search-bar.tsx [STANDARD] ~80 lines
│   │   ├── pagination.tsx [STANDARD] ~90 lines
│   │   ├── date-picker.tsx [STANDARD] ~120 lines
│   │   └── file-upload.tsx [STANDARD] ~140 lines
│   │
│   └── forms/
│       ├── form-wrapper.tsx [STANDARD] ~60 lines
│       ├── field-error.tsx [STANDARD] ~30 lines
│       ├── form-section.tsx [STANDARD] ~40 lines
│       └── submit-button.tsx [STANDARD] ~50 lines
│
├── features/ (Feature Modules)
│   ├── projects/
│   │   ├── components/
│   │   │   ├── project-card.tsx [CRITICAL] ~120 lines
│   │   │   ├── project-form.tsx [CRITICAL] ~250 lines
│   │   │   ├── project-list.tsx [CRITICAL] ~180 lines
│   │   │   ├── project-detail.tsx [CRITICAL] ~200 lines
│   │   │   ├── project-settings.tsx [CRITICAL] ~160 lines
│   │   │   └── project-stats.tsx [CRITICAL] ~140 lines
│   │   ├── hooks/
│   │   │   ├── use-projects.ts [CRITICAL] ~80 lines
│   │   │   ├── use-project.ts [CRITICAL] ~60 lines
│   │   │   └── use-project-mutations.ts [CRITICAL] ~100 lines
│   │   ├── services/
│   │   │   └── project-service.ts [CRITICAL] ~200 lines
│   │   └── types/
│   │       └── project.types.ts [CRITICAL] ~80 lines
│   │
│   ├── sessions/
│   │   ├── components/
│   │   │   ├── session-card.tsx [CRITICAL] ~100 lines
│   │   │   ├── session-timer.tsx [CRITICAL] ~200 lines
│   │   │   ├── session-controls.tsx [CRITICAL] ~150 lines
│   │   │   ├── session-list.tsx [CRITICAL] ~160 lines
│   │   │   ├── session-detail.tsx [CRITICAL] ~220 lines
│   │   │   ├── session-notes.tsx [CRITICAL] ~120 lines
│   │   │   └── active-session.tsx [CRITICAL] ~300 lines
│   │   ├── hooks/
│   │   │   ├── use-sessions.ts [CRITICAL] ~90 lines
│   │   │   ├── use-session-timer.ts [CRITICAL] ~120 lines
│   │   │   ├── use-active-session.ts [CRITICAL] ~100 lines
│   │   │   └── use-session-mutations.ts [CRITICAL] ~80 lines
│   │   ├── services/
│   │   │   └── session-service.ts [CRITICAL] ~180 lines
│   │   └── types/
│   │       └── session.types.ts [CRITICAL] ~60 lines
│   │
│   ├── captures/
│   │   ├── components/
│   │   │   ├── capture-card.tsx [STANDARD] ~80 lines
│   │   │   ├── capture-form.tsx [CRITICAL] ~150 lines
│   │   │   ├── capture-list.tsx [STANDARD] ~120 lines
│   │   │   ├── capture-detail.tsx [STANDARD] ~100 lines
│   │   │   └── capture-timeline.tsx [STANDARD] ~140 lines
│   │   ├── hooks/
│   │   │   ├── use-captures.ts [STANDARD] ~70 lines
│   │   │   └── use-capture-mutations.ts [STANDARD] ~60 lines
│   │   ├── services/
│   │   │   └── capture-service.ts [STANDARD] ~120 lines
│   │   └── types/
│   │       └── capture.types.ts [STANDARD] ~40 lines
│   │
│   ├── analytics/
│   │   ├── components/
│   │   │   ├── productivity-chart.tsx [CRITICAL] ~200 lines
│   │   │   ├── time-breakdown.tsx [CRITICAL] ~150 lines
│   │   │   ├── trend-analysis.tsx [STANDARD] ~180 lines
│   │   │   ├── analytics-filters.tsx [STANDARD] ~120 lines
│   │   │   ├── export-options.tsx [STANDARD] ~100 lines
│   │   │   └── analytics-summary.tsx [CRITICAL] ~160 lines
│   │   ├── hooks/
│   │   │   ├── use-analytics.ts [CRITICAL] ~100 lines
│   │   │   └── use-productivity-data.ts [CRITICAL] ~80 lines
│   │   ├── services/
│   │   │   └── analytics-service.ts [CRITICAL] ~150 lines
│   │   └── types/
│   │       └── analytics.types.ts [STANDARD] ~60 lines
│   │
│   └── achievements/
│       ├── components/
│       │   ├── achievement-card.tsx [SCAFFOLD] ~60 lines
│       │   ├── achievement-list.tsx [SCAFFOLD] ~80 lines
│       │   ├── progress-ring.tsx [SCAFFOLD] ~40 lines
│       │   └── milestone-tracker.tsx [SCAFFOLD] ~70 lines
│       ├── hooks/
│       │   └── use-achievements.ts [SCAFFOLD] ~50 lines
│       ├── services/
│       │   └── achievement-service.ts [SCAFFOLD] ~80 lines
│       └── types/
│           └── achievement.types.ts [SCAFFOLD] ~30 lines
│
├── lib/ (Utilities and Services)
│   ├── supabase/
│   │   ├── client.ts [CRITICAL] ~40 lines
│   │   ├── server.ts [CRITICAL] ~30 lines
│   │   ├── middleware.ts [CRITICAL] ~50 lines
│   │   └── types.ts [CRITICAL] ~200 lines
│   │
│   ├── auth/
│   │   ├── config.ts [CRITICAL] ~30 lines
│   │   ├── session.ts [CRITICAL] ~60 lines
│   │   └── utils.ts [CRITICAL] ~40 lines
│   │
│   ├── utils/
│   │   ├── cn.ts [CRITICAL] ~10 lines
│   │   ├── format.ts [STANDARD] ~80 lines
│   │   ├── date.ts [STANDARD] ~100 lines
│   │   ├── validation.ts [STANDARD] ~120 lines
│   │   ├── constants.ts [STANDARD] ~60 lines
│   │   ├── storage.ts [STANDARD] ~50 lines
│   │   └── api.ts [STANDARD] ~70 lines
│   │
│   ├── hooks/
│   │   ├── use-local-storage.ts [STANDARD] ~40 lines
│   │   ├── use-debounce.ts [STANDARD] ~25 lines
│   │   ├── use-media-query.ts [STANDARD] ~30 lines
│   │   └── use-mount.ts [STANDARD] ~20 lines
│   │
│   └── providers/
│       ├── query-provider.tsx [CRITICAL] ~40 lines
│       ├── theme-provider.tsx [STANDARD] ~60 lines
│       └── toast-provider.tsx [STANDARD] ~40 lines
│
├── hooks/ (Custom React Hooks)
│   ├── use-auth.ts [CRITICAL] ~80 lines
│   ├── use-timer.ts [CRITICAL] ~100 lines
│   ├── use-keyboard-shortcuts.ts [STANDARD] ~70 lines
│   ├── use-notifications.ts [STANDARD] ~50 lines
│   ├── use-offline-sync.ts [STANDARD] ~120 lines
│   └── use-analytics-tracking.ts [STANDARD] ~60 lines
│
├── types/ (TypeScript Definitions)
│   ├── global.d.ts [STANDARD] ~30 lines
│   ├── database.types.ts [CRITICAL] ~300 lines
│   ├── api.types.ts [STANDARD] ~100 lines
│   ├── auth.types.ts [CRITICAL] ~50 lines
│   ├── ui.types.ts [STANDARD] ~40 lines
│   └── index.ts [STANDARD] ~20 lines
│
├── styles/ (Additional Styling)
│   ├── components.css [STANDARD] ~150 lines
│   └── utilities.css [STANDARD] ~100 lines
│
├── public/
│   ├── favicon.ico [STATIC]
│   ├── logo.svg [STATIC]
│   ├── icons/
│   │   ├── icon-192.png [STATIC]
│   │   └── icon-512.png [STATIC]
│   └── manifest.json [STANDARD] ~20 lines
│
└── docs/ (Documentation)
    ├── api.md [SCAFFOLD] ~200 lines
    ├── deployment.md [SCAFFOLD] ~150 lines
    └── architecture.md [SCAFFOLD] ~300 lines
```

## Implementation Priority Matrix

### Phase 1: Core Foundation (CRITICAL files - 2-3 days)
1. **Configuration & Setup**
   - package.json, tsconfig.json, tailwind.config.js
   - .env files, middleware.ts
   - Supabase client setup

2. **Authentication System**
   - Auth components, hooks, and services
   - Login/register pages
   - Protected route logic

3. **Basic UI Components**
   - Core Shadcn/UI components (button, input, card, dialog)
   - Layout components (header, sidebar, navigation)
   - Form components

### Phase 2: Core Features (CRITICAL business logic - 3-4 days)
1. **Projects Module**
   - Full CRUD operations
   - Project dashboard integration
   - Service layer with Supabase

2. **Sessions Module**
   - Timer functionality
   - Session tracking
   - Real-time updates

3. **Dashboard**
   - Stats display
   - Recent activity
   - Quick actions

### Phase 3: Enhanced Features (STANDARD - 2-3 days)
1. **Analytics Module**
   - Data visualization
   - Trend analysis
   - Export functionality

2. **Captures Module**
   - Note-taking system
   - Timeline view
   - Search functionality

### Phase 4: Polish & Optimization (SCAFFOLD → STANDARD - 1-2 days)
1. **Achievements System**
2. **Error Handling & Loading States**
3. **Performance Optimizations**

## File Dependencies & Templates

### Template Files (Can be copied/generated):
- All Shadcn/UI components
- Basic CRUD service templates
- React hook templates
- API route templates
- Error/loading page templates

### Custom Implementation Required:
- Business logic in feature services
- Complex UI components (timers, charts)
- Authentication flow
- Database schema integration
- Analytics calculations

### External Dependencies:
- Shadcn/UI components
- Chart.js/Recharts for analytics
- React Query for state management
- Supabase client libraries
- Tailwind CSS plugins

## Estimated Total Lines of Code: ~12,500
- Configuration: ~300 lines
- Components: ~4,200 lines
- Features: ~3,800 lines
- Services/Utils: ~2,200 lines
- Types: ~600 lines
- Pages: ~1,400 lines

## Critical Success Factors:
1. **Supabase Integration** - Must be bulletproof
2. **Timer Functionality** - Core feature accuracy
3. **Authentication Flow** - Security & UX
4. **Real-time Updates** - Session synchronization
5. **Mobile Responsiveness** - Neo-brutalist design system

## Quality Score: 9/10
- **Conciseness**: Clear file purpose and structure
- **Clarity**: Detailed annotations and priority levels
- **Completeness**: Full file tree with implementation details

Trade-off: Comprehensive structure vs initial complexity - this gives you a complete roadmap but requires disciplined implementation sequencing.
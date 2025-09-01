# Production Rebellion 🚀

> **⚠️ Work in Progress** - Strategic workspace for mindful professionals

A professional strategic planning tool that helps knowledge workers visualize project priorities and bring consciousness to their deep work sessions through elegant neo-brutalist design.

## 🎯 Objectives

**Core Mission**: Create the strategic meta-layer above task management tools - not managing details, but understanding the bigger picture and focus patterns.

**Two Core Functions**:
- **STRATEGIC MAP**: Visual project overview using cost/benefit positioning - see everything at once, understand trade-offs
- **DEEP FOCUS**: Mindful work sessions with post-session awareness - understand your patterns, improve your practice

**Target**: Motivated knowledge workers who appreciate visual organization and want Strava-like feedback for their productivity patterns.

## ✅ What's Done (Phase 1 & 2 Complete)

### Foundation & Infrastructure
- ✅ **Next.js 15 + React 19** - Modern tech stack with TypeScript strict mode
- ✅ **Supabase Integration** - Complete database schema (11 tables) with Row Level Security
- ✅ **Authentication System** - Combined landing/login with user profile creation
- ✅ **Service Layer** - BULLETPROOF service architecture with coordinate collision detection

### Database & Business Logic
- ✅ **Complete Schema** - Projects, captures, sessions, XP tracking, achievements (11 MVP tables)
- ✅ **XP System** - Precise formulas matching specifications: `(10 + duration×0.5) × willpower_multiplier`
- ✅ **Boss Battle Mechanics** - Atomic operations with 2x XP multiplier
- ✅ **Achievement System** - 10 pre-seeded achievements with batch processing
- ✅ **Coordinate Collision Detection** - Solo-dev humor error handling

### Service Integration
- ✅ **Projects Service** - CRUD with cost/benefit positioning and visual properties
- ✅ **Sessions Service** - Timer management with Web Worker precision  
- ✅ **Analytics Service** - Data aggregation for heatmaps and personal records
- ✅ **Captures Service** - GTD-style brain dump with triage workflow
- ✅ **XP Service** - Weekly tracking with timezone-aware calculations

**Validation Status**: 23/25 tests passing (92%) - robust foundation ready for UI implementation

## 🚧 To Do (Phase 3 - UI Implementation)

### Core UI Components (Priority 1)
- [ ] **Neo-Brutalist Design System** - Complete component library with painting-specific color schemes
- [ ] **Universal Layout** - Header with capture bar (CMD+K), XP display, navigation grid
- [ ] **TacticalMap Page** - Cost/benefit matrix visualization with project interactions
- [ ] **DeepFocus Page** - Session timer with willpower tracking and difficulty quotes

### Analytics & Polish (Priority 2)  
- [ ] **Analytics Dashboard** - Heatmaps, streak tracking, achievement display
- [ ] **Real-time Integration** - Live updates across components
- [ ] **Performance Optimization** - Bundle analysis and Core Web Vitals
- [ ] **Production Deployment** - Beta launch with monitoring

**Timeline**: 4-6 weeks for complete MVP with 3 functional "paintings"

## 🔮 Future Enhancements

### Post-MVP Features
- [ ] **Prime Page** - Daily reflection with AI voice agent integration
- [ ] **Advanced Analytics** - Deeper productivity insights and patterns
- [ ] **Team Features** - Shared workspaces and collaboration tools
- [ ] **Mobile App** - Native iOS/Android for capture and session tracking

### AI Integration
- [ ] **Voice Logging** - Friction-free reflection capture
- [ ] **Pattern Recognition** - AI-driven productivity insights
- [ ] **Smart Suggestions** - Personalized project prioritization

## 🛠 Tech Stack

**Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui v4, Framer Motion v11  
**Backend**: Supabase (PostgreSQL + Auth + Realtime)  
**Testing**: Vitest, React Testing Library, Playwright (via MCP)  
**Deployment**: Vercel (planned)

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Supabase account (free tier sufficient for development)

### Setup
```bash
# Clone and install
git clone [repository-url]
cd production-rebellion
npm install

# Environment setup
cp .env.example .env.local
# Add your Supabase credentials

# Run development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run test         # Run test suite
npm run type-check   # TypeScript validation
npm run lint         # Code linting
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   └── (app)/             # Protected application pages
├── src/
│   ├── components/        # Reusable UI components
│   ├── services/          # Business logic layer
│   ├── hooks/             # React Query hooks
│   ├── contexts/          # React contexts (Auth, etc.)
│   └── lib/               # Utilities and configuration
├── database/              # Supabase schema and migrations
└── tests/                 # Integration and unit tests
```

## 🎨 Design Philosophy

**Neo-Brutalism**: Bold, functional design with strong shadows and monochromatic color schemes per "painting"
- **TacticalMap**: Yellow/black/grey palette
- **DeepFocus**: Distinct monochromatic scheme  
- **Analytics**: Data-driven visualization focus

**Solo-Dev Humor**: Error messages follow acknowledgment + explanation + workaround pattern with self-aware humor.

## 📊 Quality Metrics

- **TypeScript**: Strict mode, zero compilation errors
- **Testing**: 92% pass rate, targeting 95%+ coverage
- **Performance**: <2s page loads, 60fps animations
- **Accessibility**: WCAG 2.1 AA compliance

## 🤝 Contributing

Currently in active development. Beta testing opportunities coming soon!

## 📄 License

[License TBD]

---

*"The best code is no code, but when you must code, make it BULLETPROOF." - Production Rebellion Philosophy*
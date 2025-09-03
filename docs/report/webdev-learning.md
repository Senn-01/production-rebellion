★ Insight ─────────────────────────────────────
  • TanStack Query is NOT a state management tool - it's a "server state synchronization" library
  • The distinction matters: it manages the ASYNC FLOW of data, not the data itself
  • Adding these tools later is actually easier than removing them if over-engineered
  ─────────────────────────────────────────────────

  Precise Technical Definitions

  TanStack Query - "Async State Manager" / "Data Fetching Library"

  Official term: Server state management libraryWhat it actually is: A cache coordinator between your frontend and backend

  // It's NOT managing state like this:
  const [projects, setProjects] = useState([])

  // It's managing the LIFECYCLE of async operations:
  const {
    data,        // The eventual result
    isLoading,   // Am I fetching?
    isError,     // Did it fail?
    refetch,     // Try again
    isFetching,  // Currently updating?
  } = useQuery({...})

  Think of it as: A smart middleman that knows WHEN to fetch, HOW to cache, and WHAT status to report.

  Zod - "Runtime Type Validator" / "Schema Validation Library"

  Official term: TypeScript-first schema validationWhat it actually is: A bouncer that checks if data matches expected shape at runtime

  // TypeScript checks at COMPILE TIME:
  type Project = { cost: number } // TS happy if code LOOKS right

  // Zod checks at RUNTIME:
  const ProjectSchema = z.object({ cost: z.number() })
  ProjectSchema.parse(unknownData) // Actually VERIFIES at execution

  Think of it as: TypeScript's paranoid friend who doesn't trust anyone, not even the database.

  Zustand - "Client State Manager" / "Global Store"

  Official term: Small, fast, scalable state management solutionWhat it actually is: A global JavaScript object with React hooks attached

  // Instead of prop drilling:
  <App modalOpen={modalOpen}>
    <Layout modalOpen={modalOpen}>
      <Header modalOpen={modalOpen}>

  // Zustand gives you:
  const modalOpen = useStore(state => state.modalOpen) // Anywhere!

  Think of it as: Redux's chill younger brother who doesn't require a PhD to use.

  The Real Cost Analysis of Adding vs Removing

  Scenario A: Adding These Tools Later (Month 3)

  // BEFORE (MVP - What you have now):
  function TacticalMap() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      fetchProjects().then(data => {
        setProjects(data)
        setLoading(false)
      })
    }, [])
  }

  // AFTER (Adding TanStack Query later):
  function TacticalMap() {
    const { data: projects, isLoading } = useQuery({
      queryKey: ['projects'],
      queryFn: fetchProjects
    })
  }

  // Cost: 2 hours to migrate, improves code
  // Risk: ✅ Low - Makes code BETTER

  Adding Zod Later:
  // Just wrap your existing queries:
  const fetchProjects = async () => {
    const data = await supabase.from('projects').select()
    return ProjectSchema.array().parse(data) // One line added!
  }

  // Cost: 1 hour to add schemas
  // Risk: ✅ Low - Only strengthens validation

  Scenario B: Removing Over-Engineering (The Real Pain)

  // You built this complex system:
  const useProjectStore = create((set, get) => ({
    projects: [],
    filters: {},
    sortOrder: 'asc',

    // 50 lines of complex state logic
    updateProjectWithOptimisticUpdate: (id, data) => {
      const tempId = generateTempId()
      set(state => ({
        projects: [...state.projects, { ...data, id: tempId }]
      }))

      api.updateProject(id, data)
        .then(real => {
          set(state => ({
            projects: state.projects.map(p =>
              p.id === tempId ? real : p
            )
          }))
        })
        .catch(() => {
          set(state => ({
            projects: state.projects.filter(p => p.id !== tempId)
          }))
        })
    }
  }))

  // Now you need to REMOVE Zustand:
  // - Touching 47 files
  // - Rewriting all state logic
  // - Breaking 12 components
  // - Testing everything again

  // Cost: 2-3 DAYS of refactoring
  // Risk: 🔴 High - Might break working features

  The Hidden Costs of Early Abstraction

  What Happens When You Over-Engineer from Day 1:

  // You write this "scalable" architecture:
  // ❌ stores/index.ts
  // ❌ stores/projects.ts  
  // ❌ stores/ui.ts
  // ❌ stores/user.ts
  // ❌ schemas/project.schema.ts
  // ❌ schemas/user.schema.ts
  // ❌ validators/index.ts

  // For an app with... 4 pages and 10 users 🤦

  // Meanwhile, this would work fine:
  function App() {
    const [projects, setProjects] = useState([])
    // 200 lines of simple, readable code
  }

  The real cost isn't refactoring - it's:
  1. Velocity Loss: Every feature takes 2x longer
  2. Debugging Complexity: Stack traces through 5 abstractions
  3. Onboarding Pain: "Why do we have 7 state managers?"
  4. Decision Fatigue: "Should this go in Zustand or component state?"

  My Recommendation Based on Your Architecture

  Start with this (Week 1-4):

  // hooks/useProjects.ts
  export function useProjects() {
    return useQuery({
      queryKey: ['projects'],
      queryFn: async () => {
        const { data } = await supabase
          .from('projects')
          .select('*')
        return data
      }
    })
  }

  // components/TacticalMap.tsx
  function TacticalMap() {
    const { data: projects } = useProjects()
    const [filter, setFilter] = useState('active')

    // That's it. Ship it.
  }

  Add Zod when (Week 8-12):

  - You have paying users
  - You're accepting data from webhooks
  - You build that Quick Capture API
  - Someone's project has cost: "ten" in the database

  Add Zustand when (Month 3+):

  - Timer state needs sharing across 3+ components
  - You have complex modal orchestration
  - Performance actually matters (100+ projects)
  - You need undo/redo

  The Refactoring Cost Reality

  Easy to Add Later (Low Cost):
  - TanStack Query over useState ✅ (2-4 hours)
  - Zod validation on top ✅ (1-2 hours)
  - Sentry error tracking ✅ (30 minutes)
  - PostHog analytics ✅ (1 hour)

  Hard to Remove Later (High Cost):
  - Zustand if unnecessary ❌ (2-3 days)
  - Complex type systems ❌ (1-2 days)
  - Premature abstractions ❌ (1 week)
  - Over-engineered architecture ❌ (Might need rewrite)

  The Bottom Line

  You're building a commitment firewall, not Facebook. Your MVP needs:
  1. Projects on a scatter plot that doesn't lag
  2. Capture that actually captures
  3. XP that counts up smoothly
  4. Focus timer that doesn't lose state on refresh

  That's it. Everything else is procrastination disguised as engineering.

  Your instinct is correct: TanStack Query is worth it NOW (makes life easier). Zod and Zustand are not (make life complex).

  Want me to show you the absolute minimal code structure to ship your MVP in 2 weeks instead of 2 months?

  ★ Insight ─────────────────────────────────────
  • useState doesn't connect to backend - it just holds data in your component's memory
  • Hooks are React's way of adding capabilities to components (like memory, effects, connections)
  • Think of hooks as "plugins" that give your components superpowers
  ─────────────────────────────────────────────────

  The Mental Model: Hooks as Component Superpowers

  Let me explain with a real analogy:

  Your Component is Like a Person

  function TacticalMap() {
    // This component is born with NOTHING
    // No memory, no abilities, just renders once and dies

    return <div>I can only display things</div>
  }

  Hooks Give It Abilities

  function TacticalMap() {
    // 🧠 useState = Gives it MEMORY
    const [filter, setFilter] = useState('active')
    // "I can remember that filter is 'active'"

    // 📡 useEffect = Gives it AWARENESS of the outside world
    useEffect(() => {
      console.log('Component mounted!')
    }, [])
    // "I know when I'm born and when things change"

    // 🌐 Custom hooks = Specialized abilities
    const { data } = useQuery({...})
    // "I can fetch data from the internet"

    return <div>Now I'm powerful!</div>
  }

  What Each Hook Actually Does

  useState - Local Memory 🧠

  What it does: Stores data in THIS component only
  Does NOT: Connect to backend, share with other components, survive page refresh

  function TacticalMap() {
    // This is like a Post-it note on your desk
    const [filter, setFilter] = useState('active')

    // When you change it:
    setFilter('all') // Component re-renders with new value

    // But if you refresh the page... it's gone!
    // Other components can't see this value
  }

  useEffect - Side Effects Handler 🎬

  What it does: Runs code at specific moments (mount, update, unmount)
  Common uses: Fetch data, set up subscriptions, sync with external systems

  function TacticalMap() {
    const [projects, setProjects] = useState([])

    // "When component mounts, fetch projects"
    useEffect(() => {
      // This is where you COULD connect to backend
      fetch('/api/projects')
        .then(res => res.json())
        .then(data => setProjects(data))
    }, []) // Empty array = run once on mount
  }

  useQuery (TanStack Query) - Smart Data Fetcher 🚀

  What it does: Fetches from backend AND manages all the complexity
  Handles: Loading states, errors, caching, refetching, retries

  function TacticalMap() {
    // This ONE LINE replaces 50 lines of useState + useEffect
    const { data: projects, isLoading, error } = useQuery({
      queryKey: ['projects'],
      queryFn: () => fetch('/api/projects').then(r => r.json())
    })

    // It handles:
    // - Initial fetch
    // - Loading state
    // - Error state
    // - Caching (won't refetch if data is fresh)
    // - Retry on failure
    // - Background refetching
  }

  The Frontend-Backend Connection Truth

  Here's how data ACTUALLY flows:

  // BACKEND (Supabase/PostgreSQL)
  Database Table: projects
  | id | name        | cost | benefit |
  |----|-------------|------|---------|
  | 1  | "Refactor"  | 7    | 9       |

  ⬇️

  // API LAYER (Supabase automatically provides this)
  GET /rest/v1/projects
  Returns: JSON array of projects

  ⬇️

  // FRONTEND - Three ways to get this data:

  // 1. ❌ PRIMITIVE WAY (useState + useEffect)
  function TacticalMap() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
      supabase.from('projects').select('*')
        .then(({ data, error }) => {
          if (error) setError(error)
          else setProjects(data)
          setLoading(false)
        })
    }, [])

    // 15 lines just to fetch data!
  }

  // 2. ✅ BETTER WAY (TanStack Query)
  function TacticalMap() {
    const { data: projects, isLoading, error } = useQuery({
      queryKey: ['projects'],
      queryFn: async () => {
        const { data } = await supabase.from('projects').select('*')
        return data
      }
    })

    // 5 lines, plus caching, refetching, etc.
  }

  // 3. ✅ BEST WAY (Custom hook)
  function TacticalMap() {
    const { data: projects, isLoading } = useProjects()
    // 1 line! All complexity hidden in the hook
  }

  Why useState Alone Isn't Enough

  // ❌ What useState CAN'T do:
  function TacticalMap() {
    const [projects, setProjects] = useState([])

    // Problems:
    // 1. Projects is empty until you fetch
    // 2. No loading state
    // 3. No error handling
    // 4. Refetches every time component mounts
    // 5. No caching between page navigations
    // 6. No optimistic updates
  }

  // ✅ What TanStack Query gives you:
  function TacticalMap() {
    const { data: projects = [] } = useQuery({
      queryKey: ['projects'],
      queryFn: fetchProjects,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      retry: 3, // Retry failed requests
    })

    // Automatically handles:
    // - Initial loading
    // - Error states with retry
    // - Caching between navigations
    // - Background refetching
    // - Request deduplication
  }

  The Simplest Mental Model

  Think of it like a restaurant:

  1. Database (Supabase) = The Kitchen
    - Where your data lives
    - Tables, rows, columns
  2. API (Supabase Client) = The Waiter
    - Takes orders (queries)
    - Brings food (data)
  3. useState = Your Table's Notepad
    - Remember who ordered what
    - Track if someone wants extra napkins
    - Lost when you leave the restaurant
  4. TanStack Query = Smart Waiter with Perfect Memory
    - Remembers recent orders (caching)
    - Knows when to check if your food is ready
    - Handles when kitchen is busy (retry)
    - Tells you "your food is coming" (loading state)
  5. useEffect = Your Rules for the Waiter
    - "When we sit down, bring water"
    - "When we finish appetizers, bring mains"
    - "Every 5 minutes, check if we need refills"

  For Your Production Rebellion MVP

  You need:
  // This is ALL the "state management" you need:

  // 1. TanStack Query for server data
  const { data: projects } = useProjects()

  // 2. useState for UI state
  const [filterMode, setFilterMode] = useState('active')
  const [hoveredProject, setHoveredProject] = useState(null)

  // That's it. No Zustand. No Redux. No Context API.

  The beauty is that your components stay simple. Each hook does ONE thing well. Need data from database? useQuery. Need to remember a UI toggle? useState. Need to run code on mount?
  useEffect.

  Does this clarify how hooks work and why useState alone isn't enough for backend connections?


⏺ ★ Insight ─────────────────────────────────────
  • Redux is Zustand's over-engineered grandfather - same goal, 10x more ceremony
  • Without these tools, you're not coding "low level" - React's built-in tools ARE the foundation
  • The "prop drilling" problem they solve only matters when data needs to travel through 4+ components
  ─────────────────────────────────────────────────

  Redux vs Zustand: The Evolution Story

  Redux (2015) - The Enterprise Grandfather 👴

  // Redux: "You must follow THE PATTERN"
  // 1. ACTION TYPES
  const ADD_PROJECT = 'ADD_PROJECT'

  // 2. ACTION CREATORS
  const addProject = (project) => ({
    type: ADD_PROJECT,
    payload: project
  })

  // 3. REDUCER
  const projectsReducer = (state = [], action) => {
    switch (action.type) {
      case ADD_PROJECT:
        return [...state, action.payload]
      default:
        return state
    }
  }

  // 4. STORE
  const store = createStore(projectsReducer)

  // 5. CONNECT COMPONENT
  const mapStateToProps = (state) => ({ projects: state })
  const mapDispatchToProps = { addProject }
  export default connect(mapStateToProps, mapDispatchToProps)(TacticalMap)

  // 50+ LINES FOR ONE SIMPLE STATE! 🤯

  Zustand (2019) - The Chill Grandson 😎

  // Zustand: "Just tell me what you want"
  const useStore = create((set) => ({
    projects: [],
    addProject: (project) => set((state) => ({
      projects: [...state.projects, project]
    }))
  }))

  // Component
  function TacticalMap() {
    const projects = useStore(state => state.projects)
    const addProject = useStore(state => state.addProject)
    // 5 lines. Done. Same functionality.
  }

  Why Redux Became "Enterprise"

  Redux Philosophy:
  - Everything must be predictable
  - Time-travel debugging
  - Every state change is traceable
  - Enforces strict patterns

  Great for:
  - Facebook-scale apps (literally, they made it)
  - Teams of 50+ developers
  - Apps with complex state dependencies
  - When you need audit logs of every action

  Terrible for:
  - Your MVP
  - Solo developers
  - Apps with <20 components
  - Anything that needs to ship fast

  What "Low Level" Actually Means

  Without Any State Management:

  // This is NOT "low level" - this is React's DEFAULT!
  function App() {
    const [projects, setProjects] = useState([])

    return (
      <Layout>
        <Header />
        {/* Problem: Map needs projects but it's 3 levels deep */}
        <Main projects={projects} setProjects={setProjects} />
      </Layout>
    )
  }

  function Main({ projects, setProjects }) {
    return (
      <Container>
        {/* Passing through without using = "Prop Drilling" */}
        <TacticalMap projects={projects} setProjects={setProjects} />
      </Container>
    )
  }

  function TacticalMap({ projects, setProjects }) {
    // Finally! We can use projects
    return <div>{projects.map(...)}</div>
  }

  The "Prop Drilling" Problem:

  // When data needs to travel through components that don't use it:
  <App>                    // ← Has the data
    <Layout>               // ← Doesn't need it (but must pass it)
      <Sidebar />
      <Main>               // ← Doesn't need it (but must pass it)
        <Container>        // ← Doesn't need it (but must pass it)
          <TacticalMap />  // ← NEEDS the data!
        </Container>
      </Main>
    </Layout>
  </App>

  // You end up with:
  // <Container projects={projects} setProjects={setProjects} user={user} theme={theme} ...>
  // Even though Container doesn't use ANY of these!

  The Solutions Hierarchy

  Level 1: React's Built-in (You Are Here) ✅

  // For Production Rebellion MVP - PERFECT!
  function TacticalMap() {
    const [filter, setFilter] = useState('active')
    const [hoveredId, setHoveredId] = useState(null)

    // If child needs it, pass it directly
    return <ProjectNode 
      onHover={setHoveredId} 
      isHovered={hoveredId === project.id} 
    />
  }

  Level 2: React Context (Built-in Global State)

  // When 3-4 components need the same data
  const ThemeContext = createContext()

  function App() {
    const [theme, setTheme] = useState('dark')

    return (
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <DeepChildComponent /> {/* Can access theme without props */}
      </ThemeContext.Provider>
    )
  }

  // Any child can access:
  function DeepChildComponent() {
    const { theme } = useContext(ThemeContext)
    return <div className={theme}>No prop drilling!</div>
  }

  Level 3: Zustand (External Store)

  // When you have complex state logic or 5+ components sharing
  const useStore = create((set) => ({
    projects: [],
    filter: 'active',
    setFilter: (filter) => set({ filter }),

    // Complex derived state
    get activeProjects() {
      return this.projects.filter(p => p.status === 'active')
    }
  }))

  // ANY component can access without props:
  function RandomDeepComponent() {
    const activeProjects = useStore(state => state.activeProjects)
  }

  Level 4: Redux (Nuclear Option)

  // When you need:
  // - Middleware for every action
  // - DevTools time travel
  // - Strict action patterns
  // - Team of 20+ developers
  // - Your therapist said you need more structure in your life

  // 200+ lines of boilerplate...

  For Production Rebellion: What You Actually Need

  // 1. Component state for UI (90% of your needs)
  function TacticalMap() {
    const [filterMode, setFilterMode] = useState('active')
    const [selectedProject, setSelectedProject] = useState(null)

    // That's it. No libraries needed.
  }

  // 2. TanStack Query for server state
  function TacticalMap() {
    const { data: projects } = useQuery({
      queryKey: ['projects'],
      queryFn: fetchProjects
    })
  }

  // 3. Maybe ONE Context for user/auth
  const AuthContext = createContext()

  function App() {
    const [user, setUser] = useState(null)

    return (
      <AuthContext.Provider value={{ user, setUser }}>
        <Router />
      </AuthContext.Provider>
    )
  }

  // THAT'S ALL YOU NEED FOR MVP!

  The Cost of Each Approach

  | Solution | Setup Time | Learning Curve | Lines of Code | When to Use                          |
  |----------|------------|----------------|---------------|--------------------------------------|
  | useState | 0 minutes  | None           | 2             | Single component state               |
  | Props    | 0 minutes  | None           | 1 per level   | Parent → Child (1-2 levels)          |
  | Context  | 10 minutes | Low            | 10            | Theme, Auth (3-5 components)         |
  | Zustand  | 30 minutes | Medium         | 20            | Complex shared state (5+ components) |
  | Redux    | 2 hours    | High           | 200+          | Enterprise apps, large teams         |

  Real Talk for Your MVP

  You're building 4 "paintings" with maybe 20 components total:

  // Your ENTIRE state needs:
  // 1. Projects list → TanStack Query
  // 2. Current filter → useState in TacticalMap
  // 3. Timer countdown → useState in FocusPage
  // 4. Modal open/close → useState in each modal
  // 5. User auth → Context or Supabase hook

  // You literally need ZERO state management libraries

  The "Low Level" Fear is Backwards:
  - React's built-in tools ARE the foundation
  - Libraries like Redux add LAYERS on top
  - You're not missing anything by using useState
  - You're actually closer to the metal (faster, simpler)

  Want me to show you the exact component structure for Production Rebellion with just React's built-in tools? No Zustand, no Redux, just clean, simple components that will actually ship?

★ Insight ─────────────────────────────────────
  • TanStack Query and Zustand solve COMPLETELY different problems - they're not alternatives
  • TanStack Query = Managing server/database data (async, remote)
  • Zustand = Managing client/UI state (sync, local)
  ─────────────────────────────────────────────────

  No! They Solve Completely Different Problems

  Let me clarify with a concrete example from Production Rebellion:

  TanStack Query - Manages SERVER Data (From Database)

  // TanStack Query: "I fetch and cache data from Supabase"
  function TacticalMap() {
    // This fetches projects from your DATABASE
    const { data: projects, isLoading } = useQuery({
      queryKey: ['projects'],
      queryFn: async () => {
        const { data } = await supabase
          .from('projects')  // <-- REMOTE DATABASE
          .select('*')
        return data
      }
    })

    // TanStack Query handles:
    // - Is it loading?
    // - Did it error?
    // - Should I refetch?
    // - Is my cache stale?
    // - Should I retry if it fails?
  }

  Zustand - Manages CLIENT State (UI/Local)

  // Zustand: "I remember UI state across components"
  const useUIStore = create((set) => ({
    // This is LOCAL state - not from database!
    currentFilter: 'active',      // Which filter is selected
    modalOpen: false,             // Is modal showing?
    hoveredProjectId: null,       // Which project is hovered?
    timerSeconds: 3600,          // Countdown timer

    // Actions to change LOCAL state
    setFilter: (filter) => set({ currentFilter: filter }),
    openModal: () => set({ modalOpen: true }),
    tick: () => set(state => ({
      timerSeconds: state.timerSeconds - 1
    }))
  }))

  // Any component can access this:
  function RandomComponent() {
    const filter = useUIStore(state => state.currentFilter)
    // No props needed!
  }

  The Restaurant Analogy (Better Version)

  TanStack Query = The Waiter (Server ↔ Client)

  - Goes to kitchen (database) to get your food (data)
  - Remembers recent orders (caching)
  - Knows when to check if food is ready (polling)
  - Handles when kitchen is busy (retry logic)
  - Deals with ASYNC operations to EXTERNAL sources

  Zustand = The Notepad at Your Table (Client Only)

  - Remembers who ordered what at YOUR table
  - Tracks if you want extra napkins
  - Knows music volume preference
  - Remembers if lights should be dimmed
  - Deals with LOCAL state that multiple people at your table need to know

  Real Production Rebellion Examples

  What TanStack Query Handles:

  // All of these are DATABASE operations:
  useQuery({ queryKey: ['projects'] })        // Fetch all projects
  useQuery({ queryKey: ['sessions'] })        // Fetch focus sessions
  useQuery({ queryKey: ['achievements'] })    // Fetch unlocked achievements
  useMutation({ mutationFn: createProject })  // Save new project to DB

  What Zustand Would Handle (if you needed it):

  // All of these are LOCAL UI state:
  const useAppStore = create(() => ({
    // Shared across multiple components
    currentPainting: 'map',        // Which page we're on
    sidebarCollapsed: false,       // Is sidebar open?
    notifications: [],             // Toast notifications
    theme: 'dark',                // Dark/light mode
    soundEnabled: true,           // Sound effects on/off
  }))

  What useState Handles (Your current approach):

  // Local to ONE component only:
  function TacticalMap() {
    const [filterMode, setFilterMode] = useState('active')
    const [hoveredId, setHoveredId] = useState(null)
    // This is FINE for Production Rebellion!
  }

  The Key Differences

  | Aspect      | TanStack Query                       | Zustand                               |
  |-------------|--------------------------------------|---------------------------------------|
  | Purpose     | Fetch & cache server data            | Share UI state between components     |
  | Data Source | External (API, Database)             | Local (Memory)                        |
  | Async?      | Yes (Promises, loading states)       | No (Synchronous)                      |
  | Use When    | Getting data from Supabase           | Sharing UI state across 5+ components |
  | Handles     | Loading, errors, caching, refetching | Simple state updates                  |
  | Example     | User's projects from DB              | Which modal is open                   |

  Common Confusion

  People get confused because both can "store" data:

  // TanStack Query stores CACHED SERVER DATA
  const { data: projects } = useQuery({ ... })
  // projects = [{id: 1, name: "Refactor"}] from DATABASE

  // Zustand stores LOCAL UI STATE
  const filter = useStore(state => state.filter)
  // filter = "active" from MEMORY

  But they're storing different TYPES of data for different REASONS.

  Do You Need Both?

  For Production Rebellion:

  You NEED TanStack Query ✅

  Because you're fetching from Supabase constantly:
  - Projects list
  - Focus sessions
  - Achievements
  - User data

  You DON'T NEED Zustand ❌

  Because your UI state is simple:
  - 4 pages total
  - ~20 components
  - Most state is local to one component
  - useState + props work fine

  When WOULD you need Zustand?

  // If you had complex UI state like:
  - Theme preferences used in 10+ components
  - Complex modal orchestration (wizard with 5 steps)
  - Global notification system
  - Collaborative features (other users' cursors)
  - Undo/redo across multiple components

  The Bottom Line

  They're not alternatives - they're for different jobs:
  - TanStack Query: Getting data FROM somewhere else (database, API)
  - Zustand: Sharing data BETWEEN your components (UI state)
  - useState: Keeping data IN one component (local state)

  For Production Rebellion, you need:
  1. TanStack Query for all Supabase operations ✅
  2. useState for component-specific UI ✅
  3. Maybe Context for auth ✅
  4. Zustand... probably never ❌

  Think of it this way:
  - Server state (from database) → TanStack Query
  - Global UI state (shared everywhere) → Zustand
  - Local UI state (one component) → useState
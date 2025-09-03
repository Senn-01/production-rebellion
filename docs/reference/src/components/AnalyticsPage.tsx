import { useState } from 'react';
import { Clock, Zap, Target, Trophy, Calendar, Crown, Lock, TrendingUp, Timer, Star, Award, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SessionData {
  date: string;
  sessions: Array<{
    duration: 60 | 90 | 120;
    willpower: 'high' | 'medium' | 'low';
    mindset: 'excellent' | 'good' | 'challenging';
    project: string;
  }>;
}

interface ProjectCompleted {
  id: number;
  title: string;
  completedDate: string;
  addedDate: string;
  category: 'WORK' | 'LEARN' | 'BUILD' | 'MANAGE';
  quadrant: 'No-Brainer' | 'Breakthrough' | 'Side-Quest' | 'Trap-Zone';
  costScore: number;
  benefitScore: number;
  confidence: 'high' | 'medium' | 'low';
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
}

export function AnalyticsPage() {
  // Mock data for the last 14 days
  const generateMockData = (): SessionData[] => {
    const data: SessionData[] = [];
    const today = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate random sessions (0-4 per day)
      const sessionCount = Math.floor(Math.random() * 5);
      const sessions = [];
      
      for (let j = 0; j < sessionCount; j++) {
        const durations: (60 | 90 | 120)[] = [60, 90, 120];
        const willpowers: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
        const mindsets: ('excellent' | 'good' | 'challenging')[] = ['excellent', 'good', 'challenging'];
        const projects = ['Q4 Revenue Push', 'MVP Launch', 'Process Optimization', 'Client Presentation', 'API Redesign'];
        
        sessions.push({
          duration: durations[Math.floor(Math.random() * durations.length)],
          willpower: willpowers[Math.floor(Math.random() * willpowers.length)],
          mindset: mindsets[Math.floor(Math.random() * mindsets.length)],
          project: projects[Math.floor(Math.random() * projects.length)]
        });
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        sessions
      });
    }
    
    return data;
  };

  const [sessionData] = useState<SessionData[]>(generateMockData());

  // Mock completed projects - expanded for this month
  const completedProjects: ProjectCompleted[] = [
    {
      id: 1,
      title: 'Client Dashboard Redesign',
      completedDate: '2024-08-20',
      addedDate: '2024-08-12',
      category: 'WORK',
      quadrant: 'Breakthrough',
      costScore: 8,
      benefitScore: 9,
      confidence: 'high'
    },
    {
      id: 2,
      title: 'React Hooks Course',
      completedDate: '2024-08-18',
      addedDate: '2024-08-10',
      category: 'LEARN',
      quadrant: 'No-Brainer',
      costScore: 4,
      benefitScore: 8,
      confidence: 'medium'
    },
    {
      id: 3,
      title: 'Team Onboarding Process',
      completedDate: '2024-08-15',
      addedDate: '2024-08-05',
      category: 'MANAGE',
      quadrant: 'No-Brainer',
      costScore: 3,
      benefitScore: 7,
      confidence: 'high'
    },
    {
      id: 4,
      title: 'API Documentation',
      completedDate: '2024-08-25',
      addedDate: '2024-08-18',
      category: 'WORK',
      quadrant: 'No-Brainer',
      costScore: 2,
      benefitScore: 6,
      confidence: 'high'
    },
    {
      id: 5,
      title: 'Performance Optimization',
      completedDate: '2024-08-22',
      addedDate: '2024-08-14',
      category: 'BUILD',
      quadrant: 'Breakthrough',
      costScore: 7,
      benefitScore: 8,
      confidence: 'medium'
    },
    {
      id: 6,
      title: 'User Testing Report',
      completedDate: '2024-08-28',
      addedDate: '2024-08-20',
      category: 'LEARN',
      quadrant: 'Side-Quest',
      costScore: 4,
      benefitScore: 5,
      confidence: 'high'
    }
  ];

  // Mock achievements - exactly 10 for proper layout
  const achievements: Achievement[] = [
    { id: 'first-blood', name: 'First Blood', description: 'Complete your first project - breaking the ice with productivity', unlocked: true, unlockedAt: '2024-08-15', icon: '🩸' },
    { id: 'double-digits', name: 'Double Digits', description: 'Reach 10 completed projects - building momentum and consistency', unlocked: true, unlockedAt: '2024-07-25', icon: '🔟' },
    { id: 'giant-slayer', name: 'Giant Slayer', description: 'Complete your first 10/10 cost project - tackling the impossible', unlocked: false, icon: '⚔️' },
    { id: 'dark-souls', name: 'Dark Souls Mode', description: 'Complete a Boss Battle marked "Total Guess" confidence level', unlocked: true, unlockedAt: '2024-08-12', icon: '💀' },
    { id: 'frame-perfect', name: 'Frame Perfect', description: 'Complete a project exactly on its deadline - perfect timing', unlocked: false, icon: '🎯' },
    { id: 'centurion', name: 'Centurion', description: 'Accumulate 100 total deep focus hours - becoming a focus warrior', unlocked: true, unlockedAt: '2024-08-20', icon: '💯' },
    { id: 'dedicated', name: 'Dedicated', description: 'Maintain a 4-week focus streak - showing true commitment', unlocked: false, icon: '📅' },
    { id: 'the-grind', name: 'The Grind', description: 'Complete a 10+ hour focus day - going beyond limits', unlocked: false, icon: '⚡' },
    { id: 'estimator', name: 'The Estimator', description: 'Get 5 accurate project estimates where confidence matches outcome', unlocked: true, unlockedAt: '2024-08-18', icon: '🎲' },
    { id: 'no-brainer-king', name: 'No-Brainer King', description: 'Complete 10 projects from the No-Brainer quadrant - efficiency master', unlocked: false, icon: '👑' }
  ];

  // Calculations
  const getThisWeekData = () => {
    const weekData = sessionData.slice(-7);
    const totalSessions = weekData.reduce((acc, day) => acc + day.sessions.length, 0);
    const totalHours = weekData.reduce((acc, day) => 
      acc + day.sessions.reduce((sessionAcc, session) => sessionAcc + (session.duration / 60), 0), 0
    );
    return { totalSessions, totalHours };
  };

  const getCurrentStreak = () => {
    let streak = 0;
    for (let i = sessionData.length - 1; i >= 0; i--) {
      if (sessionData[i].sessions.length > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getWeeklyProjectData = () => {
    const weekData = sessionData.slice(-7);
    const projectHours: { [key: string]: number } = {};
    
    weekData.forEach(day => {
      day.sessions.forEach(session => {
        const hours = session.duration / 60;
        projectHours[session.project] = (projectHours[session.project] || 0) + hours;
      });
    });

    return Object.entries(projectHours)
      .map(([project, hours]) => ({ project, hours: Number(hours.toFixed(1)) }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5); // Top 5 projects
  };

  const getHeatmapData = () => {
    return sessionData.map(day => ({
      date: day.date,
      sessionCount: day.sessions.length,
      isToday: day.date === new Date().toISOString().split('T')[0]
    }));
  };

  const getHeatmapColor = (sessionCount: number): string => {
    if (sessionCount === 0) return 'bg-white';
    if (sessionCount === 1) return 'bg-[#E5B6E5]/30';
    if (sessionCount === 2) return 'bg-[#E5B6E5]/60';
    if (sessionCount === 3) return 'bg-[#E5B6E5]/80';
    return 'bg-[#E5B6E5]';
  };

  const getProjectCompletionData = () => {
    // Group projects by cost/benefit coordinates for scatter plot
    const projectMap = new Map();
    
    completedProjects.forEach(project => {
      const key = `${project.costScore}-${project.benefitScore}`;
      if (projectMap.has(key)) {
        projectMap.set(key, projectMap.get(key) + 1);
      } else {
        projectMap.set(key, 1);
      }
    });
    
    return Array.from(projectMap.entries()).map(([key, count]) => {
      const [cost, benefit] = key.split('-').map(Number);
      return { cost, benefit, count };
    });
  };

  const getPersonalRecords = () => {
    const allSessions = sessionData.flatMap(day => 
      day.sessions.map(session => ({ ...session, date: day.date }))
    );
    
    // Best day (most sessions)
    const sessionsByDay = sessionData.map(day => ({
      date: day.date,
      sessionCount: day.sessions.length
    }));
    
    const bestDay = sessionsByDay.reduce((best, current) => 
      current.sessionCount > best.sessionCount ? current : best
    );

    return {
      bestDay: `${bestDay.sessionCount} SESSIONS (${new Date(bestDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()})`,
      bestWeek: `22 SESSIONS (AUG 15-21)`,
      maxPoints: `2200 POINTS (WEEK OF AUG 15)`,
      longestStreak: `14 DAYS (AUG 15-28)`
    };
  };

  // Calculate data
  const thisWeekData = getThisWeekData();
  const currentStreak = getCurrentStreak();
  const weeklyProjectData = getWeeklyProjectData();
  const heatmapData = getHeatmapData();
  const projectCompletionData = getProjectCompletionData();
  const personalRecords = getPersonalRecords();
  
  // Filter projects completed this month
  const thisMonth = new Date().toISOString().slice(0, 7); // "2024-08"
  const thisMonthProjects = completedProjects.filter(project => 
    project.completedDate.startsWith(thisMonth)
  );

  return (
    <main className="px-8 py-10">
      {/* Title Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black uppercase tracking-wider mb-4 text-white">DATA ANALYTICS</h1>
        <p className="text-xl font-bold uppercase tracking-wide text-[#E5B6E5]">PERFORMANCE METRICS & PROGRESS INSIGHTS</p>
      </div>

      {/* Bento Box Layout */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 1. Hero Stats Row */}
        <div className="grid grid-cols-2 gap-8">
          {/* This Week */}
          <div className="bg-[#451969] border-4 border-black p-8 shadow-[4px_4px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] transition-all duration-100">
            <div className="text-6xl font-black text-[#E5B6E5] font-mono mb-3">{thisWeekData.totalSessions}</div>
            <div className="text-xl font-black uppercase tracking-wider text-white mb-2">SESSIONS</div>
            <div className="text-base font-bold uppercase tracking-wide text-white/70">{thisWeekData.totalHours.toFixed(1)} HOURS TOTAL</div>
          </div>

          {/* Current Streak */}
          <div className="bg-[#451969] border-4 border-black p-8 shadow-[4px_4px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] transition-all duration-100">
            <div className="text-6xl font-black text-[#E5B6E5] font-mono mb-3">{currentStreak}</div>
            <div className="text-xl font-black uppercase tracking-wider text-white mb-2">DAYS</div>
            <div className="text-base font-bold uppercase tracking-wide text-white/70">CURRENT STREAK</div>
          </div>
        </div>

        {/* 2. Weekly Activity Chart */}
        <div className="bg-[#451969] border-4 border-black shadow-[4px_4px_0px_#000000]">
          <div className="bg-gradient-to-r from-[#451969] to-[#6d28a3] border-b-4 border-black p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-[#E5B6E5]" />
              <h2 className="text-2xl font-black uppercase tracking-wider text-white">WEEKLY PROJECT ACTIVITY</h2>
            </div>
          </div>
          <div className="p-8">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyProjectData} layout="horizontal">
                  <XAxis 
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#E5B6E5', fontWeight: 'bold', fontSize: 12, fontFamily: 'monospace' }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="project"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#E5B6E5', fontWeight: 'bold', fontSize: 12, fontFamily: 'monospace' }}
                    width={150}
                  />
                  <Bar 
                    dataKey="hours" 
                    fill="#E5B6E5"
                    stroke="#000"
                    strokeWidth={2}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm font-bold uppercase tracking-wide text-white/70 font-mono text-center mt-4">
              DEEP FOCUS HOURS PER PROJECT THIS WEEK
            </div>
          </div>
        </div>

        {/* 3. Session Heatmap */}
        <div className="bg-[#451969] border-4 border-black p-8 shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-[#E5B6E5]" />
            <h2 className="text-2xl font-black uppercase tracking-wider text-white">LAST TWO WEEKS</h2>
          </div>
          
          {/* First row - Days 1-7 */}
          <div className="grid grid-cols-7 gap-4 mb-4 justify-center">
            {heatmapData.slice(0, 7).map((day, index) => (
              <div key={index} className="text-center">
                <div 
                  className={`w-16 h-16 border-4 border-black shadow-[4px_4px_0px_#000000] ${getHeatmapColor(day.sessionCount)} ${
                    day.isToday ? 'ring-4 ring-[#E5B6E5]' : ''
                  }`}
                  title={`${day.date}: ${day.sessionCount} sessions`}
                />
              </div>
            ))}
          </div>
          
          {/* Second row - Days 8-14 */}
          <div className="grid grid-cols-7 gap-4 mb-6 justify-center">
            {heatmapData.slice(7, 14).map((day, index) => (
              <div key={index + 7} className="text-center">
                <div 
                  className={`w-16 h-16 border-4 border-black shadow-[4px_4px_0px_#000000] ${getHeatmapColor(day.sessionCount)} ${
                    day.isToday ? 'ring-4 ring-[#E5B6E5]' : ''
                  }`}
                  title={`${day.date}: ${day.sessionCount} sessions`}
                />
              </div>
            ))}
          </div>
          
          <div className="text-sm font-bold uppercase tracking-wide text-white/70 font-mono text-center">
            COLOR INTENSITY: 0 SESSIONS = WHITE • 1 = LIGHT • 2-3 = MEDIUM • 4+ = DARK
          </div>
        </div>

        {/* 4. Project Completion Chart and Summary */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left: Scatter Plot */}
          <div className="bg-[#451969] border-4 border-black shadow-[4px_4px_0px_#000000]">
            <div className="bg-gradient-to-r from-[#451969] to-[#6d28a3] border-b-4 border-black p-6">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-[#E5B6E5]" />
                <h2 className="text-xl font-black uppercase tracking-wider text-white">COMPLETION MAP</h2>
              </div>
            </div>
            <div className="p-6">
              <div 
                className="relative bg-white border-4 border-black shadow-[4px_4px_0px_#000000] mx-auto"
                style={{ height: '300px', width: '300px' }}
              >
                {/* Grid lines */}
                <div className="absolute inset-0 opacity-20">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <div
                      key={`v-${i}`}
                      className="absolute top-0 bottom-0 border-l border-gray-400"
                      style={{ left: `${i * 10}%` }}
                    />
                  ))}
                  {Array.from({ length: 11 }).map((_, i) => (
                    <div
                      key={`h-${i}`}
                      className="absolute left-0 right-0 border-t border-gray-400"
                      style={{ top: `${i * 10}%` }}
                    />
                  ))}
                </div>

                {/* Project dots */}
                {projectCompletionData.map((project, index) => (
                  <div
                    key={index}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ 
                      left: `${project.cost * 10}%`, 
                      top: `${100 - (project.benefit * 10)}%`
                    }}
                    title={`${project.count} project(s) at cost ${project.cost}, benefit ${project.benefit}`}
                  >
                    <div 
                      className={`border-2 border-black rounded-full ${
                        project.count === 1 ? 'bg-[#E5B6E5]/60 w-3 h-3' :
                        project.count <= 3 ? 'bg-[#E5B6E5]/80 w-4 h-4' :
                        'bg-[#E5B6E5] w-5 h-5'
                      }`}
                    />
                  </div>
                ))}

                {/* Axis labels */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs font-black uppercase tracking-wide text-black/80 pb-2 font-mono">
                  COST →
                </div>
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -rotate-90 text-xs font-black uppercase tracking-wide text-black/80 pl-2 font-mono">
                  BENEFIT →
                </div>
              </div>
            </div>
          </div>

          {/* Right: Project Summary */}
          <div className="bg-[#451969] border-4 border-black shadow-[4px_4px_0px_#000000]">
            <div className="bg-gradient-to-r from-[#451969] to-[#6d28a3] border-b-4 border-black p-6">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-[#E5B6E5]" />
                <h2 className="text-xl font-black uppercase tracking-wider text-white">THIS MONTH</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {thisMonthProjects.map((project) => (
                  <div key={project.id} className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_#000000]">
                    <h3 className="text-sm font-black uppercase tracking-wider text-black mb-2">{project.title}</h3>
                    <div className="text-xs font-bold uppercase tracking-wide text-black/70 font-mono">
                      COST/BENEFIT: {project.costScore}/{project.benefitScore}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <div className="text-3xl font-black uppercase tracking-wider text-[#E5B6E5] font-mono">
                  {completedProjects.length} PROJECTS
                </div>
                <div className="text-sm font-bold uppercase tracking-wide text-white/70">
                  COMPLETED THIS YEAR
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Personal Records */}
        <div className="bg-[#451969] border-4 border-black shadow-[4px_4px_0px_#000000]">
          <div className="bg-gradient-to-r from-[#451969] to-[#6d28a3] border-b-4 border-black p-6">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-[#E5B6E5]" />
              <h2 className="text-2xl font-black uppercase tracking-wider text-white">PERSONAL RECORDS</h2>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 gap-6 font-mono">
              <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] transition-all duration-100">
                <div className="text-lg font-black uppercase tracking-wider">
                  BEST DAY: <span className="text-[#451969]">{personalRecords.bestDay}</span>
                </div>
              </div>
              
              <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] transition-all duration-100">
                <div className="text-lg font-black uppercase tracking-wider">
                  BEST WEEK: <span className="text-[#451969]">{personalRecords.bestWeek}</span>
                </div>
              </div>
              
              <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] transition-all duration-100">
                <div className="text-lg font-black uppercase tracking-wider">
                  MAX POINTS: <span className="text-[#451969]">{personalRecords.maxPoints}</span>
                </div>
              </div>
              
              <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] transition-all duration-100">
                <div className="text-lg font-black uppercase tracking-wider">
                  LONGEST STREAK: <span className="text-[#451969]">{personalRecords.longestStreak}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Achievements */}
        <div className="bg-[#451969] border-4 border-black shadow-[4px_4px_0px_#000000] mb-20">
          <div className="bg-gradient-to-r from-[#451969] to-[#6d28a3] border-b-4 border-black p-6">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-[#E5B6E5]" />
              <h2 className="text-2xl font-black uppercase tracking-wider text-white">ACHIEVEMENTS</h2>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-5 gap-6">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`p-6 border-4 border-black shadow-[4px_4px_0px_#000000] text-center transition-all duration-100 ${
                    achievement.unlocked 
                      ? 'bg-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000]' 
                      : 'bg-gray-400 opacity-60'
                  }`}
                  title={achievement.unlocked ? achievement.description : `Locked: ${achievement.description}`}
                >
                  <div className="text-2xl mb-3">
                    {achievement.unlocked ? achievement.icon : <Lock className="w-6 h-6 mx-auto text-gray-600" />}
                  </div>
                  <div className={`text-xs font-black uppercase tracking-wider ${
                    achievement.unlocked ? 'text-[#451969]' : 'text-gray-600'
                  }`}>
                    {achievement.name}
                  </div>
                  {achievement.unlocked && (
                    <div className="text-xs font-mono text-black/70 mt-2">
                      {achievement.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
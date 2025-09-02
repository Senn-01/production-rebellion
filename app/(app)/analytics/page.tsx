'use client';

import React from 'react';
import { TrendingUp, Target, Trophy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { WeeklyActivityChart } from '@/components/analytics/WeeklyActivityChart';
import { SessionHeatmap } from '@/components/analytics/SessionHeatmap';
import { ProjectCompletionScatter } from '@/components/analytics/ProjectCompletionScatter';
import { useAchievements } from '@/hooks/useAchievements';

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  
  // Get analytics data using the real hook
  const {
    heroStats,
    isLoadingHeroStats,
    personalRecords,
    sessionHeatmap,
    projectCompletions,
    weeklyTrend,
    isLoadingWeeklyTrend,
    isLoadingHeatmap,
    isLoadingCompletions,
    isLoadingRecords
  } = useAnalytics({ 
    userId: user?.id || '', 
    enableRealtime: true 
  });

  // Get achievement data
  const { data: achievements, isLoading: isLoadingAchievements } = useAchievements();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="font-bold uppercase">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32"> {/* Extra bottom padding for navigation grid */}
      {/* Hero Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-[var(--theme-background)] border-4 border-black">
          <CardContent className="p-8 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-[var(--theme-primary)]" />
            {isLoadingHeroStats ? (
              <div className="animate-pulse">
                <div className="h-12 w-16 bg-gray-200 rounded mx-auto mb-2"></div>
                <div className="h-6 w-24 bg-gray-200 rounded mx-auto mb-1"></div>
                <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
              </div>
            ) : (
              <>
                <div className="text-5xl font-black font-mono mb-2">
                  {heroStats?.currentWeek.sessions || 0}
                </div>
                <div className="font-black uppercase tracking-wider text-lg mb-1">SESSIONS</div>
                <div className="font-bold uppercase text-sm opacity-75">
                  {heroStats?.currentWeek.hours.toFixed(1) || '0.0'} HOURS TOTAL
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[var(--theme-background)] border-4 border-black">
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-[var(--theme-primary)]" />
            {isLoadingHeroStats ? (
              <div className="animate-pulse">
                <div className="h-12 w-16 bg-gray-200 rounded mx-auto mb-2"></div>
                <div className="h-6 w-24 bg-gray-200 rounded mx-auto mb-1"></div>
                <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
              </div>
            ) : (
              <>
                <div className="text-5xl font-black font-mono mb-2">
                  {heroStats?.currentStreak.weeks || 0}
                </div>
                <div className="font-black uppercase tracking-wider text-lg mb-1">WEEKS</div>
                <div className="font-bold uppercase text-sm opacity-75">
                  {heroStats?.currentStreak.weeks === 0 ? 'START YOUR STREAK!' : 'CURRENT STREAK'}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Chart */}
      <Card className="mb-8 border-4 border-black">
        <CardHeader className="border-b-4 border-black">
          <CardTitle>Weekly Activity (Sessions)</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <WeeklyActivityChart 
            data={weeklyTrend} 
            isLoading={isLoadingWeeklyTrend}
            height={280}
          />
        </CardContent>
      </Card>

      {/* Session Heatmap */}
      <Card className="mb-8 border-4 border-black">
        <CardHeader className="border-b-4 border-black">
          <CardTitle>Session Heatmap (Last 14 Days)</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <SessionHeatmap 
            data={sessionHeatmap} 
            isLoading={isLoadingHeatmap}
            days={14}
          />
        </CardContent>
      </Card>

      {/* Project Completion Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="border-4 border-black">
          <CardHeader className="border-b-4 border-black">
            <CardTitle>Project Completions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ProjectCompletionScatter 
              data={projectCompletions} 
              isLoading={isLoadingCompletions}
              height={240}
              compact={true}
            />
          </CardContent>
        </Card>

        <Card className="border-4 border-black">
          <CardHeader className="border-b-4 border-black">
            <CardTitle>Completed This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoadingCompletions ? (
              <div className="text-center py-8 animate-pulse">
                <div className="h-12 w-16 bg-gray-200 rounded mx-auto mb-2"></div>
                <div className="h-6 w-48 bg-gray-200 rounded mx-auto mb-1"></div>
                <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl font-black font-mono mb-2">
                  {projectCompletions?.completedThisMonth?.length || 0}
                </div>
                <div className="font-black uppercase tracking-wider">PROJECTS COMPLETED</div>
                <div className="text-sm opacity-75 mt-2">
                  {(projectCompletions?.completedThisMonth?.length || 0) === 0 
                    ? 'Ready to complete your first project?' 
                    : 'Keep up the momentum!'
                  }
                </div>
                {(projectCompletions?.completedThisMonth?.length || 0) > 0 && projectCompletions && (
                  <div className="mt-4 text-left">
                    <div className="text-xs font-bold uppercase opacity-75 mb-2">Recent Completions:</div>
                    {projectCompletions.completedThisMonth.slice(0, 3).map((project) => (
                      <div key={project.id} className="text-xs mb-1 flex justify-between">
                        <span className="truncate flex-1 mr-2">{project.name}</span>
                        <span className="font-mono font-bold text-[var(--theme-primary)]">
                          {project.xpEarned} XP
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Personal Records */}
      <Card className="mb-8 border-4 border-black">
        <CardHeader className="border-b-4 border-black">
          <CardTitle>Personal Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRecords ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-36 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-28 bg-gray-200 rounded"></div>
                    <div className="h-4 w-40 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : personalRecords ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase text-sm">Best Day:</span>
                  <span className="font-black font-mono">
                    {personalRecords.bestDaySessions 
                      ? `${personalRecords.bestDaySessions.value} SESSIONS (${new Date(personalRecords.bestDaySessions.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()})`
                      : 'NOT SET YET'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase text-sm">Best Week:</span>
                  <span className="font-black font-mono">
                    {personalRecords.bestWeekSessions 
                      ? `${personalRecords.bestWeekSessions.value} SESSIONS (WEEK ${new Date(personalRecords.bestWeekSessions.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()})`
                      : 'NOT SET YET'
                    }
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase text-sm">Max Points:</span>
                  <span className="font-black font-mono">
                    {personalRecords.maxWeekPoints 
                      ? `${personalRecords.maxWeekPoints.value} POINTS (${new Date(personalRecords.maxWeekPoints.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()})`
                      : 'NOT SET YET'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase text-sm">Longest Streak:</span>
                  <span className="font-black font-mono">
                    {personalRecords.longestStreak 
                      ? `${personalRecords.longestStreak.value} WEEKS (ENDED ${new Date(personalRecords.longestStreak.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()})`
                      : 'NOT SET YET'
                    }
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏆</div>
              <p className="font-bold uppercase text-sm opacity-50">
                Start building your legacy!
              </p>
              <p className="text-xs opacity-30 mt-2">
                Your personal records will appear here as you complete sessions and projects
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements Gallery */}
      <Card className="mb-8 border-4 border-black">
        <CardHeader className="border-b-4 border-black">
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAchievements ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="text-center p-4 border-4 border-gray-300">
                    <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : achievements ? (
            <div className="grid grid-cols-5 gap-6">
              {achievements.map((achievement) => {
                // Map achievement keys to emojis
                const emojiMap: Record<string, string> = {
                  'paths_are_made_by_walking': '🚶',
                  'first_blood': '🩸',
                  'double_digits': '🔢',
                  'giant_slayer': '⚔️',
                  'dark_souls_mode': '💀',
                  'frame_perfect': '🎯',
                  'dedicated': '💪',
                  'the_grind': '⚡',
                  'the_estimator': '📊',
                  'no_brainer_king': '👑'
                };

                return (
                  <div
                    key={achievement.key}
                    className={`text-center p-4 border-4 border-black transition-all duration-200 ${
                      achievement.unlockedAt 
                        ? 'bg-[var(--theme-accent)] hover:shadow-[6px_6px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px]' 
                        : 'bg-gray-100 opacity-60'
                    }`}
                    title={achievement.unlockedAt ? achievement.description : achievement.teaser}
                  >
                    <div className="text-3xl mb-2">
                      {achievement.unlockedAt ? (emojiMap[achievement.key] || '🏆') : '🔒'}
                    </div>
                    <div className="font-black uppercase text-xs">
                      {achievement.name}
                    </div>
                    {achievement.unlockedAt && (
                      <div className="text-xs opacity-75 mt-1 font-mono">
                        {new Date(achievement.unlockedAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        }).toUpperCase()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏆</div>
              <p className="font-bold uppercase text-sm opacity-50">
                Achievement system loading...
              </p>
              <p className="text-xs opacity-30 mt-2">
                Your achievement progress will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Notice */}
      <Card className="bg-[var(--theme-accent)] border-8">
        <CardContent>
          <div className="flex items-start gap-3">
            <Trophy className="w-8 h-8 text-[var(--theme-primary)] mt-1" />
            <div>
              <h3 className="font-black uppercase tracking-wider mb-2">
                Analytics Dashboard Operational
              </h3>
              <p className="font-bold text-sm">
                You&apos;re viewing the complete Analytics dashboard with live data from your database. 
                Real Recharts visualizations, session heatmaps, project completion tracking, and achievement progress are fully integrated. 
                {heroStats?.allTimeStats.totalSessions === 0 
                  ? 'Complete your first session to see the magic happen! ⚡'
                  : `Tracking ${heroStats?.allTimeStats.totalSessions || 0} sessions and ${heroStats?.allTimeStats.projectsCompleted || 0} completed projects.`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
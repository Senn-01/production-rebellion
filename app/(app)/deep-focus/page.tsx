'use client';

import React, { useState, useEffect } from 'react';
import { Play, Target, CheckCircle, Zap, Coffee, BatteryLow } from 'lucide-react';
// import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/use-projects';
import { useSessions } from '@/hooks/useSessions';
import { toast } from 'sonner';
import { preloadCompletionSound } from '@/lib/audio-utils';
import { DailyCommitmentModal } from '@/components/deep-focus/DailyCommitmentModal';
import { SessionCompletionModal } from '@/components/deep-focus/SessionCompletionModal';
import { SessionTimerDisplay } from '@/components/deep-focus/SessionTimerDisplay';
import { InterruptConfirmDialog } from '@/components/deep-focus/InterruptConfirmDialog';
import type { Database } from '@/types/database';

type SessionWillpower = Database['public']['Enums']['session_willpower'];
type SessionMindset = Database['public']['Enums']['session_mindset'];
type SessionState = 'setup' | 'willpower' | 'active' | 'completed' | 'interrupted';
type ModalState = 'none' | 'commitment' | 'completion' | 'interrupt';

export default function DeepFocusPage() {
  const { user, loading } = useAuth();
  const { data: projects = [] } = useProjects();
  
  // Session state management
  const [sessionState, setSessionState] = useState<SessionState>('setup');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [duration, setDuration] = useState<60 | 90 | 120>(60);
  const [willpower, setWillpower] = useState<SessionWillpower | null>(null);
  const [modalState, setModalState] = useState<ModalState>('none');
  const [needsCommitmentCheck, setNeedsCommitmentCheck] = useState(true);
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  
  // Sessions hook integration
  const {
    activeSession,
    todayProgress,
    timerState,
    startSession,
    completeSession,
    interruptSession,
    setDailyCommitment,
    isLoadingActiveSession,
    getDifficultyQuote
  } = useSessions({ userId: user?.id || '', enableRealtime: true });

  // Preload completion sound for better UX
  useEffect(() => {
    preloadCompletionSound();
  }, []);

  // Check for daily commitment on mount - only if no active session
  useEffect(() => {
    if (user && needsCommitmentCheck && !isLoadingActiveSession) {
      // Priority: Active session recovery takes precedence over commitment modal
      if (!activeSession && !todayProgress?.commitment) {
        // First visit after midnight - show commitment modal
        setModalState('commitment');
      }
      setNeedsCommitmentCheck(false);
    }
  }, [user, needsCommitmentCheck, isLoadingActiveSession, todayProgress, activeSession]);
  
  // Handle session recovery - restore state if active session exists
  useEffect(() => {
    if (activeSession && sessionState === 'setup') {
      // Session already active - jump to active state
      setSelectedProject(activeSession.project_id);
      setDuration(activeSession.duration as 60 | 90 | 120);
      setWillpower(activeSession.willpower);
      setSessionState('active');
    } else if (!activeSession && sessionState === 'active') {
      // No active session but we think we're active - return to setup
      setSessionState('setup');
    }
  }, [activeSession, sessionState]);
  
  // Handle timer completion
  useEffect(() => {
    if (timerState.state === 'completed' && sessionState === 'active') {
      setSessionState('completed');
      setModalState('completion');
    }
  }, [timerState.state, sessionState]);

  if (loading || isLoadingActiveSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="font-bold uppercase">Loading your focus workspace...</p>
        </div>
      </div>
    );
  }
  
  // Get selected project data
  const selectedProjectData = projects.find(p => p.id === selectedProject);
  
  // Session handlers
  const handleStartSession = async () => {
    if (!selectedProject || !willpower) return;
    
    try {
      await startSession({
        projectId: selectedProject,
        duration,
        willpower
      });
      setSessionState('active');
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };
  
  const handleCompleteSession = async (mindset: SessionMindset) => {
    setIsCompletingSession(true);
    try {
      await completeSession(mindset);
      // Success path - reset all state
      setSessionState('setup');
      setModalState('none');
      setSelectedProject('');
      setWillpower(null);
    } catch (error) {
      console.error('Failed to complete session:', error);
      toast.error('Failed to save session. Please try again.');
      // Still close modal on error to unblock UI
      setModalState('none');
    } finally {
      setIsCompletingSession(false);
    }
  };
  
  const handleInterruptSession = async () => {
    try {
      await interruptSession();
      setSessionState('setup');
      setModalState('none');
      
      // Reset form
      setSelectedProject('');
      setWillpower(null);
    } catch (error) {
      console.error('Failed to interrupt session:', error);
    }
  };
  
  const handleDailyCommitment = async (sessionCount: number) => {
    try {
      await setDailyCommitment(sessionCount);
      setModalState('none');
    } catch (error) {
      console.error('Failed to set commitment:', error);
    }
  };
  
  const handleSkipCommitment = () => {
    setModalState('none');
  };

  // Modal priority system - ensures only one modal at a time
  const getActiveModal = (): ModalState => {
    // Priority order: interrupt > completion > commitment
    if (modalState === 'interrupt' && timerState.formattedTime) {
      return 'interrupt';
    }
    if (modalState === 'completion') {
      return 'completion';
    }
    if (modalState === 'commitment' && !activeSession) {
      return 'commitment';
    }
    return 'none';
  };

  // Today's Progress Display
  const renderProgressSummary = () => {
    if (!todayProgress) return null;
    
    const { completed, commitment } = todayProgress;
    const target = commitment?.target_sessions || 0;
    
    return (
      <Card className="bg-[var(--theme-accent)] border-4 border-black mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-[var(--theme-text)]" />
              <div>
                <div className="font-black uppercase text-sm text-[var(--theme-text)]">
                  Today&apos;s Progress
                </div>
                <div className="text-xs font-bold text-[var(--theme-text)] opacity-75">
                  {completed} of {target} sessions completed
                </div>
              </div>
            </div>
            {completed >= target && target > 0 && (
              <CheckCircle className="w-8 h-8 text-green-600" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Setup State - Project and Duration Selection  
  const renderSetupState = () => (
    <div className="min-h-[80vh] flex items-center justify-center" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="max-w-lg w-full">
        {renderProgressSummary()}
        
        <Card className="bg-[var(--theme-primary)] border-4 border-black p-12 shadow-[4px_4px_0px_#000000]">
          <CardContent className="space-y-8">
            {/* Title with Pink Icon - LEFT ALIGNED */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Target className="w-10 h-10 text-[var(--theme-accent)] flex-shrink-0" />
                <h1 className="text-3xl font-black uppercase tracking-wider text-[var(--theme-text)]">
                  Deep Focus Session
                </h1>
              </div>
            </div>

            {/* Project Selection */}
            <div>
              <label className="text-lg font-black uppercase tracking-wider text-[var(--theme-text)] mb-4 block">
                What are you working on?
              </label>
              {projects.length > 0 ? (
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="bg-white border-4 border-black shadow-[4px_4px_0px_#000000] font-black uppercase tracking-wider text-black focus:shadow-[6px_6px_0px_#000000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-100 h-12 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000000] w-full"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}{project.is_boss_battle ? ' ★' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-center p-4 bg-white border-4 border-black shadow-[4px_4px_0px_#000000]">
                  <p className="font-black uppercase text-sm">
                    No active projects found
                  </p>
                  <p className="text-xs mt-1 opacity-75">
                    Create a project in TacticalMap first
                  </p>
                </div>
              )}
            </div>

            {/* Duration Selection */}
            <div>
              <label className="text-lg font-black uppercase tracking-wider text-[var(--theme-text)] mb-4 block">
                For how long?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {([60, 90, 120] as const).map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins)}
                    className={`p-4 border-4 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 text-center font-black uppercase tracking-wider ${
                      duration === mins ? 'bg-[var(--theme-accent)] text-black' : 'bg-white text-black'
                    }`}
                  >
                    <div className="text-lg mb-1">{mins}</div>
                    <div className="text-xs">min</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={() => setSessionState('willpower')}
              disabled={!selectedProject}
              className="w-full bg-[var(--theme-accent)] text-black border-4 border-black font-black uppercase tracking-wider px-8 py-4 hover:bg-[var(--theme-accent)]/90 transition-all duration-200 hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[7px_7px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5 inline mr-3" />
              Start Deep Focus
            </button>

            {projects.length === 0 && (
              <p className="text-xs text-[var(--theme-text)] opacity-50 mt-4">
                Add projects in TacticalMap to start focusing
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Willpower Assessment State
  const renderWillpowerState = () => {
    const willpowerOptions = [
      { value: "high" as SessionWillpower, label: "PIECE OF CAKE", sublabel: "HIGH WILLPOWER", icon: Zap },
      { value: "medium" as SessionWillpower, label: "CAFFEINATED", sublabel: "MEDIUM WILLPOWER", icon: Coffee },
      { value: "low" as SessionWillpower, label: "DON'T TALK TO ME", sublabel: "LOW WILLPOWER", icon: BatteryLow }
    ];

    return (
      <div className="max-w-2xl mx-auto text-center" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <h1 className="text-4xl font-black uppercase tracking-wider mb-8 text-[var(--theme-accent)]">WILLPOWER CHECK</h1>
        
        <div className="space-y-6">
          {willpowerOptions.map((option, _index) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setWillpower(option.value)}
                className={`w-full p-6 border-4 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/90 ${
                  willpower === option.value ? 'ring-4 ring-[var(--theme-accent)]' : ''
                }`}
              >
                <IconComponent className="w-8 h-8 mx-auto mb-3 text-[var(--theme-text)] fill-[var(--theme-text)]" />
                <div className="text-xl font-black uppercase tracking-wider text-[var(--theme-text)]">{option.label}</div>
                <div className="text-sm font-bold uppercase tracking-wide text-[var(--theme-text)]/70">{option.sublabel}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          <button
            onClick={handleStartSession}
            disabled={!willpower}
            className="bg-[var(--theme-text)] text-[var(--theme-textSecondary)] border-4 border-black font-black uppercase tracking-wider px-12 py-4 hover:bg-[var(--theme-text)]/90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CONFIRM & START
          </button>
        </div>
      </div>
    );
  };

  // Active Session State - Use SessionTimerDisplay Component
  const renderActiveState = () => {
    if (!selectedProjectData || !willpower || !activeSession) {
      return (
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p className="font-bold uppercase">Starting your focus session...</p>
          </div>
        </div>
      );
    }
    
    return (
      <div>
        {/* Navigation Warning Message */}
        <Card className="bg-yellow-100 border-4 border-yellow-600 mb-4 max-w-4xl mx-auto">
          <CardContent className="p-4 text-center">
            <div className="font-black uppercase text-yellow-800 mb-1">
              ⚠️ STAY ON THIS PAGE
            </div>
            <div className="text-sm font-bold text-yellow-700">
              Navigating to other paintings during your session will freeze the timer. 
              Beta limitation - we&apos;ll fix this post-launch!
            </div>
          </CardContent>
        </Card>
        
        <SessionTimerDisplay
          timerState={{
            remainingTime: timerState.remainingTime,
            formattedTime: timerState.formattedTime,
            progress: timerState.progress,
            isRunning: timerState.isRunning,
            isPaused: timerState.isPaused,
            difficultyQuote: getDifficultyQuote(willpower, duration)
          }}
          sessionData={{
            projectName: selectedProjectData.name,
            duration,
            willpower
          }}
          onInterrupt={() => setModalState('interrupt')}
        />
      </div>
    );
  };

  // Render based on current state
  const renderCurrentState = () => {
    switch (sessionState) {
      case 'setup':
        return renderSetupState();
      case 'willpower':
        return renderWillpowerState();
      case 'active':
        return renderActiveState();
      case 'completed':
        return renderSetupState(); // Show setup while completion modal is open
      default:
        return renderSetupState();
    }
  };

  const activeModal = getActiveModal();

  return (
    <div className="pb-32"> {/* Extra bottom padding for navigation grid */}
      {renderCurrentState()}
      
      {/* Daily Commitment Modal */}
      <DailyCommitmentModal
        isOpen={activeModal === 'commitment'}
        onCommit={handleDailyCommitment}
        onSkip={handleSkipCommitment}
      />
      
      {/* Session Completion Modal */}
      {selectedProjectData && willpower && (
        <SessionCompletionModal
          isOpen={activeModal === 'completion'}
          onComplete={handleCompleteSession}
          sessionData={{
            projectName: selectedProjectData.name,
            duration,
            willpower,
            difficultyQuote: getDifficultyQuote(willpower, duration)
          }}
          xpEarned={0} // Not used - XP shown in toast after completion
          isLoading={isCompletingSession}
        />
      )}
      
      {/* Interrupt Confirmation Dialog */}
      {timerState.formattedTime && (
        <InterruptConfirmDialog
          isOpen={activeModal === 'interrupt'}
          onConfirm={handleInterruptSession}
          onCancel={() => setModalState('none')}
          sessionData={{
            projectName: selectedProjectData?.name || '',
            remainingTime: timerState.formattedTime,
            progress: timerState.progress
          }}
        />
      )}
    </div>
  );
}
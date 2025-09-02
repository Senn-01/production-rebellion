'use client';

import React, { useState, useEffect } from 'react';
import { Play, Timer, Target, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/use-projects';
import { useSessions } from '@/hooks/useSessions';
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
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  
  // Session state management
  const [sessionState, setSessionState] = useState<SessionState>('setup');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [duration, setDuration] = useState<60 | 90 | 120>(60);
  const [willpower, setWillpower] = useState<SessionWillpower | null>(null);
  const [modalState, setModalState] = useState<ModalState>('none');
  const [needsCommitmentCheck, setNeedsCommitmentCheck] = useState(true);
  
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
    getDifficultyQuote,
    formatTime
  } = useSessions({ userId: user?.id || '', enableRealtime: true });

  // Check for daily commitment on mount
  useEffect(() => {
    if (user && needsCommitmentCheck && !isLoadingActiveSession) {
      // Check if we already have a commitment today
      if (!todayProgress?.commitment) {
        // First visit after midnight - show commitment modal
        setModalState('commitment');
      }
      setNeedsCommitmentCheck(false);
    }
  }, [user, needsCommitmentCheck, isLoadingActiveSession, todayProgress]);
  
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
    try {
      await completeSession(mindset);
      setSessionState('setup');
      setModalState('none');
      
      // Reset form
      setSelectedProject('');
      setWillpower(null);
    } catch (error) {
      console.error('Failed to complete session:', error);
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
                  Today's Progress
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
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-lg w-full">
        {renderProgressSummary()}
        
        <Card className="bg-[var(--theme-primary)] border-4 border-black p-12">
          <CardContent className="text-center space-y-6">
            <Timer className="w-16 h-16 mx-auto text-[var(--theme-text)]" />
            
            <h1 className="font-black uppercase tracking-wider text-3xl text-[var(--theme-text)]">
              Deep Focus Session
            </h1>
            
            <p className="font-bold uppercase text-sm text-[var(--theme-text)] opacity-75">
              Choose your project and focus duration
            </p>

            {/* Project Selection */}
            <div className="space-y-3">
              <label className="block font-black uppercase text-sm text-[var(--theme-text)]">
                Select Project
              </label>
              {projects.length > 0 ? (
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="brutal-select w-full text-[var(--theme-text)] bg-[var(--theme-background)]"
                >
                  <option value="">Choose a project...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} {project.is_boss_battle ? '⭐' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-center p-4 bg-[var(--theme-background)] border-4 border-black">
                  <p className="font-bold uppercase text-sm">
                    No active projects found
                  </p>
                  <p className="text-xs mt-1 opacity-75">
                    Create a project in TacticalMap first
                  </p>
                </div>
              )}
            </div>

            {/* Duration Selection */}
            <div className="space-y-3">
              <label className="block font-black uppercase text-sm text-[var(--theme-text)]">
                Focus Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[60, 90, 120].map((mins) => (
                  <Button
                    key={mins}
                    variant={duration === mins ? "primary" : "secondary"}
                    size="md"
                    onClick={() => setDuration(mins as 60 | 90 | 120)}
                    className="bg-[var(--theme-background)] text-[var(--theme-text)]"
                  >
                    {mins}M
                  </Button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <Button
              variant="primary"
              size="lg"
              disabled={!selectedProject}
              onClick={() => setSessionState('willpower')}
              className="w-full mt-8"
            >
              <Play className="w-5 h-5 mr-2" />
              START SESSION
            </Button>

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
  const renderWillpowerState = () => (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="max-w-lg bg-[var(--theme-primary)] border-8 border-black p-12">
        <CardContent className="text-center space-y-6">
          <h2 className="font-black uppercase tracking-wider text-2xl text-[var(--theme-text)]">
            Willpower Check
          </h2>
          
          <p className="font-bold text-sm text-[var(--theme-text)] opacity-75">
            How are you feeling right now? This affects your XP multiplier.
          </p>

          <div className="space-y-3">
            {[
              { value: 'high' as SessionWillpower, label: 'PIECE OF CAKE 🔥', description: '1.0x XP - Feeling energized' },
              { value: 'medium' as SessionWillpower, label: 'CAFFEINATED ☕', description: '1.5x XP - Moderate energy' },
              { value: 'low' as SessionWillpower, label: "DON'T TALK TO ME 🥱", description: '2.0x XP - Low energy but pushing through' }
            ].map((option) => (
              <Button
                key={option.value}
                variant={willpower === option.value ? "primary" : "secondary"}
                size="lg"
                onClick={() => setWillpower(option.value)}
                className="w-full bg-[var(--theme-background)] text-[var(--theme-text)] text-left flex-col items-start py-4"
              >
                <div className="font-black uppercase text-sm">{option.label}</div>
                <div className="text-xs opacity-75 normal-case">{option.description}</div>
              </Button>
            ))}
          </div>

          <div className="flex gap-3 mt-8">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setSessionState('setup')}
              className="flex-1"
            >
              BACK
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={!willpower}
              onClick={handleStartSession}
              className="flex-1"
            >
              CONTINUE
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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

  return (
    <div className="pb-32"> {/* Extra bottom padding for navigation grid */}
      {renderCurrentState()}
      
      {/* Daily Commitment Modal */}
      <DailyCommitmentModal
        isOpen={modalState === 'commitment'}
        onCommit={handleDailyCommitment}
        onSkip={handleSkipCommitment}
      />
      
      {/* Session Completion Modal */}
      {selectedProjectData && willpower && (
        <SessionCompletionModal
          isOpen={modalState === 'completion'}
          onComplete={handleCompleteSession}
          sessionData={{
            projectName: selectedProjectData.name,
            duration,
            willpower,
            difficultyQuote: getDifficultyQuote(willpower, duration)
          }}
          xpEarned={0} // Not used - XP shown in toast after completion
        />
      )}
      
      {/* Interrupt Confirmation Dialog */}
      {timerState.formattedTime && (
        <InterruptConfirmDialog
          isOpen={modalState === 'interrupt'}
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
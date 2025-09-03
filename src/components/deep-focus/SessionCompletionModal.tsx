/**
 * Session Completion Modal - DeepFocus Mindset Assessment
 * 
 * Shows after successful session completion to assess flow state and award XP.
 * Captures mindset data for analytics and provides positive reinforcement.
 */

'use client';

import React from 'react';
// import { Trophy, Zap, Coffee, Target } from 'lucide-react'; // For future celebration animations
import { Modal } from '@/components/ui/Modal';
// import { Button } from '@/components/ui/Button'; // May be used for enhanced completion actions
// import { Card, CardContent } from '@/components/ui/Card'; // May be used for stats display
import type { Database } from '@/types/database';

type SessionMindset = Database['public']['Enums']['session_mindset'];

export interface SessionCompletionModalProps {
  isOpen: boolean;
  onComplete: (mindset: SessionMindset) => void;
  sessionData: {
    projectName: string;
    duration: number;
    willpower: string;
    difficultyQuote: string;
  };
  xpEarned?: number;
  isLoading?: boolean;
}

export const SessionCompletionModal: React.FC<SessionCompletionModalProps> = ({
  isOpen,
  onComplete,
  sessionData,
  xpEarned: _xpEarned = 0, // Reserved for future XP display enhancement
  isLoading = false
}) => {

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing - must assess mindset
      size="lg"
      className="z-50"
    >
      <div className="max-w-2xl mx-auto text-center" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {/* Celebration Box */}
        <div className="bg-[var(--theme-primary)] border-4 border-black p-8 shadow-[4px_4px_0px_#000000] mb-8">
          <div className="text-4xl font-black uppercase tracking-wider text-[var(--theme-text)] mb-4">
            SESSION COMPLETED! 🎉
          </div>
          <div className="text-xl font-bold uppercase tracking-wide text-[var(--theme-text)]/70">
            {sessionData.duration} MINUTES OF DEEP WORK
          </div>
        </div>


        {/* Mindset Assessment */}
        <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_#000000] mb-8">
          <div className="text-xl font-black uppercase tracking-wider text-[var(--theme-accent)] mb-6">
            WERE YOU IN THE ZONE?
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => onComplete('excellent')}
              disabled={isLoading}
              className="w-full p-4 border-4 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-lg font-black uppercase tracking-wider text-[var(--theme-text)]">SHAOLIN</div>
              <div className="text-sm font-bold uppercase tracking-wide text-[var(--theme-text)]/70">EXCELLENT FOCUS</div>
            </button>

            <button
              onClick={() => onComplete('good')}
              disabled={isLoading}
              className="w-full p-4 border-4 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 bg-[var(--theme-timer-background)] hover:bg-[var(--theme-timer-background)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-lg font-black uppercase tracking-wider text-black">GETTING THERE</div>
              <div className="text-sm font-bold uppercase tracking-wide text-black/70">GOOD PROGRESS</div>
            </button>

            <button
              onClick={() => onComplete('challenging')}
              disabled={isLoading}
              className="w-full p-4 border-4 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 bg-white hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-lg font-black uppercase tracking-wider text-black">WHAT THE HECK IS THE ZONE?</div>
              <div className="text-sm font-bold uppercase tracking-wide text-black/70">CHALLENGING SESSION</div>
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
};
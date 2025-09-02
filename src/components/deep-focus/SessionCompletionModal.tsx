/**
 * Session Completion Modal - DeepFocus Mindset Assessment
 * 
 * Shows after successful session completion to assess flow state and award XP.
 * Captures mindset data for analytics and provides positive reinforcement.
 */

'use client';

import React, { useState } from 'react';
import { Trophy, Zap, Coffee, Target } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
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
  xpEarned = 0,
  isLoading = false
}) => {
  const [selectedMindset, setSelectedMindset] = useState<SessionMindset | null>(null);

  const mindsetOptions = [
    {
      value: 'excellent' as SessionMindset,
      label: 'SHAOLIN 🧘‍♂️',
      description: 'Deep flow state achieved - you were completely absorbed',
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      value: 'good' as SessionMindset,
      label: 'GETTING THERE ⚡',
      description: 'Good focus with some distractions - solid progress made',
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      value: 'challenging' as SessionMindset,
      label: 'WHAT THE HECK IS THE ZONE? 😅',
      description: 'Struggled with focus but showed up anyway - that counts!',
      icon: Coffee,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const handleComplete = () => {
    if (selectedMindset) {
      onComplete(selectedMindset);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing - must assess mindset
      size="lg"
      className="z-50"
    >
      <div className="bg-[var(--theme-primary)] p-8">
        {/* Session Summary */}
        <div className="text-center mb-6">
          <div className="text-6xl font-black font-mono text-[var(--theme-text)] mb-2">
            COMPLETE!
          </div>
          <h2 className="font-black uppercase tracking-wider text-xl text-[var(--theme-text)] mb-2">
            {sessionData.projectName}
          </h2>
          <div className="text-sm font-bold text-[var(--theme-text)] opacity-75">
            {sessionData.duration}min • {sessionData.difficultyQuote}
          </div>
        </div>


        {/* Mindset Assessment */}
        <Card className="bg-[var(--theme-background)] border-4 border-black mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <Target className="w-8 h-8 mx-auto text-[var(--theme-text)] mb-3" />
              <h3 className="font-black uppercase text-lg text-[var(--theme-text)] mb-2">
                Were you in the zone for that session?
              </h3>
              <p className="text-xs font-bold text-[var(--theme-text)] opacity-75">
                This helps us understand your focus patterns
              </p>
            </div>

            <div className="space-y-3">
              {mindsetOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={selectedMindset === option.value ? "primary" : "secondary"}
                    size="lg"
                    onClick={() => setSelectedMindset(option.value)}
                    disabled={isLoading}
                    className="w-full h-auto py-4 px-6 flex items-start text-left"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className={`p-2 rounded ${option.bgColor}`}>
                        <Icon className={`w-6 h-6 ${option.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-black uppercase text-sm mb-1">
                          {option.label}
                        </div>
                        <div className="text-xs opacity-75 normal-case font-medium">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Complete Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleComplete}
          disabled={!selectedMindset || isLoading}
          className="w-full mb-4"
        >
          <Trophy className="w-5 h-5 mr-2" />
          COMPLETE SESSION
        </Button>

        {/* Encouragement Message */}
        <Card className="bg-[var(--theme-accent)] border-2 border-black">
          <CardContent className="p-4 text-center">
            <p className="font-bold text-sm text-[var(--theme-text)] mb-2">
              🎉 <strong>Great job! Reward yourself and take a break.</strong>
            </p>
            {xpEarned > 0 && (
              <p className="text-xs text-[var(--theme-text)] opacity-75">
                You've earned <strong>{xpEarned.toLocaleString()} points</strong> for this session
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
};
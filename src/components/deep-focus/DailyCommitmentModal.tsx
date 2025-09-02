/**
 * Daily Commitment Modal - DeepFocus Session Planning
 * 
 * Shows on first visit after midnight to set daily session targets.
 * Follows GTD principles by creating intentional commitment before action.
 */

'use client';

import React, { useState } from 'react';
import { Target, Clock, SkipForward } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export interface DailyCommitmentModalProps {
  isOpen: boolean;
  onCommit: (sessionCount: number) => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export const DailyCommitmentModal: React.FC<DailyCommitmentModalProps> = ({
  isOpen,
  onCommit,
  onSkip,
  isLoading = false
}) => {
  const [selectedCount, setSelectedCount] = useState<number>(1);

  const handleCommit = () => {
    onCommit(selectedCount);
  };

  const sessionOptions = Array.from({ length: 10 }, (_, i) => ({
    count: i + 1,
    label: String(i + 1)
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing - must make decision
      size="lg"
      className="z-50"
    >
      <div className="bg-[var(--theme-primary)] p-8">
        <div className="text-center mb-8">
          <Target className="w-16 h-16 mx-auto text-[var(--theme-text)] mb-4" />
          <h2 className="font-black uppercase tracking-wider text-3xl text-[var(--theme-text)] mb-2">
            Daily Commitment
          </h2>
          <p className="font-bold text-sm text-[var(--theme-text)] opacity-75">
            Set your intention before you begin. Quality over quantity.
          </p>
        </div>

        <Card className="bg-[var(--theme-background)] border-4 border-black mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-[var(--theme-text)]" />
              <span className="font-black uppercase text-sm text-[var(--theme-text)]">
                How many focus sessions today?
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {sessionOptions.map((option) => (
                <Button
                  key={option.count}
                  variant={selectedCount === option.count ? "primary" : "secondary"}
                  size="md"
                  onClick={() => setSelectedCount(option.count)}
                  disabled={isLoading}
                  className="h-auto py-3 px-4 text-center font-black text-2xl"
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-[var(--theme-accent)] border-2 border-black">
              <p className="text-xs font-bold text-[var(--theme-text)] opacity-75">
                💡 <strong>Tip:</strong> Start small and build consistency. 
                Even 1 quality session beats grand plans that never happen.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={onSkip}
            disabled={isLoading}
            className="flex-1 bg-[var(--theme-background)] text-[var(--theme-text)]"
          >
            <SkipForward className="w-5 h-5 mr-2" />
            NAH
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleCommit}
            disabled={isLoading}
            className="flex-2"
          >
            <Target className="w-5 h-5 mr-2" />
            COMMIT TO {selectedCount} SESSION{selectedCount > 1 ? 'S' : ''}
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-[var(--theme-text)] opacity-50">
            You can adjust this anytime during the day
          </p>
        </div>
      </div>
    </Modal>
  );
};
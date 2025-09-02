/**
 * Interrupt Confirm Dialog - DeepFocus Session Abandonment
 * 
 * Confirmation dialog to prevent accidental session interruptions.
 * Provides clear consequences and alternative actions.
 */

'use client';

import React from 'react';
import { AlertTriangle, Square, ArrowLeft, Clock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export interface InterruptConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  sessionData: {
    projectName: string;
    remainingTime: string; // formatted time like "25:30"
    progress: number; // 0 to 1
  };
  isLoading?: boolean;
}

export const InterruptConfirmDialog: React.FC<InterruptConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  sessionData,
  isLoading = false
}) => {
  const progressPercentage = Math.round(sessionData.progress * 100);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="md"
      className="z-50"
    >
      <div className="bg-[var(--theme-primary)] p-6">
        
        {/* Warning Header */}
        <div className="text-center mb-6">
          <div className="bg-orange-100 border-4 border-orange-400 rounded p-4 mb-4">
            <AlertTriangle className="w-12 h-12 mx-auto text-orange-600 mb-2" />
            <h2 className="font-black uppercase tracking-wider text-xl text-orange-800 mb-1">
              Interrupt Session?
            </h2>
            <p className="text-sm font-bold text-orange-700">
              You're about to abandon your focus session
            </p>
          </div>
        </div>

        {/* Session Progress */}
        <Card className="bg-[var(--theme-background)] border-4 border-black mb-6">
          <CardContent className="p-4">
            <div className="text-center mb-4">
              <h3 className="font-black uppercase text-lg text-[var(--theme-text)] mb-2">
                {sessionData.projectName}
              </h3>
              <div className="text-3xl font-black font-mono text-[var(--theme-text)]">
                {sessionData.remainingTime}
              </div>
              <div className="text-xs font-bold text-[var(--theme-text)] opacity-75">
                remaining • {progressPercentage}% complete
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-300 h-2 border-2 border-black">
              <div 
                className="h-full bg-[var(--theme-text)] transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Consequences */}
        <Card className="bg-red-50 border-4 border-red-400 mb-6">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <Clock className="w-8 h-8 mx-auto text-red-600" />
              <h4 className="font-black uppercase text-sm text-red-800">
                What happens if you interrupt:
              </h4>
              <ul className="text-xs text-red-700 space-y-1">
                <li>• You'll receive only <strong>10 XP</strong> for the attempt</li>
                <li>• Progress on this session will be lost</li>
                <li>• The session won't count toward your daily commitment</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full bg-green-500 text-white border-4 border-black"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            CONTINUE SESSION
          </Button>
          
          <Button
            variant="danger"
            size="lg"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full bg-red-500 text-white border-4 border-black"
          >
            <Square className="w-5 h-5 mr-2" />
            YES, INTERRUPT SESSION (+10 XP)
          </Button>
        </div>

        {/* Encouragement */}
        <div className="mt-4 text-center">
          <p className="text-xs text-[var(--theme-text)] opacity-75">
            💪 You've come this far - why not push through to the end?
          </p>
        </div>
      </div>
    </Modal>
  );
};
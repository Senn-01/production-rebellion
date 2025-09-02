/**
 * TriageModal Component - Brain Dump Processing
 * 
 * Processes pending captures one by one with 5 decision actions:
 * - Track Project: Creates project from capture
 * - Parking Lot: Moves to someday/maybe 
 * - Doing Now: Removes with encouragement
 * - Routing: Future integration placeholder
 * - Delete: Removes permanently
 */

'use client';

import React from 'react';
import { Target, Archive, CheckCircle2, ExternalLink, Trash2, Calendar } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { CaptureWithAge } from '@/services/captures.service';

interface TriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  captures: CaptureWithAge[];
  currentIndex: number;
  onTriageAction: (action: 'track' | 'parking' | 'doing' | 'routing' | 'delete') => void;
}

export function TriageModal({ 
  isOpen, 
  onClose, 
  captures, 
  currentIndex, 
  onTriageAction 
}: TriageModalProps) {
  // Empty state - all captures processed
  if (captures.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="TRIAGE COMPLETE" size="md">
        <div className="text-center py-8">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-[#525252]" />
          <p className="text-lg font-black uppercase tracking-wider text-black mb-6">
            ALL CAUGHT UP!
          </p>
          <p className="text-sm font-bold uppercase tracking-wide text-black/70 mb-6">
            NO ITEMS TO PROCESS
          </p>
          <Button onClick={onClose}>
            CLOSE
          </Button>
        </div>
      </Modal>
    );
  }

  const currentCapture = captures[currentIndex];
  
  if (!currentCapture) {
    return null;
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg"
      className="bg-[var(--theme-background)]"
    >
      {/* Header */}
      <div className="bg-[var(--theme-primary)] border-4 border-black p-6 -m-6 mb-6">
        <h2 className="text-2xl font-black uppercase tracking-wider text-black">
          TRIAGE
        </h2>
        <p className="text-sm font-bold uppercase tracking-wide text-black/70 mt-1">
          ITEM {currentIndex + 1} OF {captures.length}
        </p>
      </div>

      <div className="space-y-6">
        {/* Current Capture Display */}
        <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-[#525252]" />
            <span className="text-xs font-bold uppercase tracking-wide text-black/70 font-mono">
              ADDED {new Date(currentCapture.created_at || '').toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <p className="font-mono text-black leading-tight">
            {currentCapture.content}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => onTriageAction('track')}
            variant="primary"
            size="lg"
            className="w-full flex items-center justify-center gap-3"
          >
            <Target className="w-5 h-5" />
            TRACK PROJECT
          </Button>

          <Button
            onClick={() => onTriageAction('parking')}
            variant="secondary"
            size="lg"
            className="w-full bg-[#525252] text-white hover:bg-[#525252]/90 flex items-center justify-center gap-3"
          >
            <Archive className="w-5 h-5" />
            PARKING LOT
          </Button>

          <Button
            onClick={() => onTriageAction('doing')}
            variant="secondary"
            size="lg"
            className="w-full bg-[#9ca3af] text-white hover:bg-[#9ca3af]/90 flex items-center justify-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5" />
            DOING IT NOW
          </Button>

          <Button
            onClick={() => onTriageAction('routing')}
            variant="secondary"
            size="lg"
            className="w-full bg-[#f7f7f5] text-black hover:bg-[#f7f7f5]/90 flex items-center justify-center gap-3"
          >
            <ExternalLink className="w-5 h-5" />
            ROUTING <span className="text-xs ml-2">(SOON)</span>
          </Button>

          <Button
            onClick={() => onTriageAction('delete')}
            variant="danger"
            size="lg"
            className="w-full flex items-center justify-center gap-3"
          >
            <Trash2 className="w-5 h-5" />
            DELETE
          </Button>
        </div>
      </div>
    </Modal>
  );
}
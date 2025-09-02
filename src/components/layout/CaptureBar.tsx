/**
 * Capture Bar Component
 * 
 * GTD-inspired brain dump capture with triage workflow.
 * Integrates with captures service for seamless data flow.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { usePendingCapturesCount, useCreateCapture } from '@/hooks/use-captures';

interface CaptureBarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CaptureBar: React.FC<CaptureBarProps> = ({ isOpen, onOpenChange }) => {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const createCaptureMutation = useCreateCapture();
  const { data: pendingCount = 0 } = usePendingCapturesCount();

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createCaptureMutation.mutateAsync(content.trim());
      setContent('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to capture:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onOpenChange(false);
      setContent('');
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  // Static button state (not expanded)
  if (!isOpen) {
    return (
      <div className="flex items-center gap-4">
        <Button
          onClick={() => onOpenChange(true)}
          variant="primary"
          size="md"
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          BRAIN DUMP
        </Button>
        
        {/* Show triage count if there are pending items */}
        {pendingCount > 0 && (
          <div className="bg-[var(--theme-primary)] border-4 border-black px-3 py-1 font-black uppercase text-sm">
            {pendingCount} TO TRIAGE
          </div>
        )}
      </div>
    );
  }

  // Expanded input state
  return (
    <div className="flex items-center gap-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Brain dump anything..."
          className={`transition-all duration-200 ${
            isExpanded ? 'w-96' : 'w-48'
          }`}
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!content.trim() || createCaptureMutation.isPending}
        >
          CAPTURE
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(false)}
        >
          ESC
        </Button>
      </form>
      
      {/* Show triage count if there are pending items */}
      {pendingCount > 0 && (
        <div className="bg-[var(--theme-primary)] border-4 border-black px-3 py-1 font-black uppercase text-sm">
          {pendingCount} TO TRIAGE
        </div>
      )}
    </div>
  );
};

export default CaptureBar;
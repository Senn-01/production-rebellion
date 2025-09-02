/**
 * AccuracyDialog Component
 * 
 * Dialog for rating project completion accuracy (1-5 scale).
 * Triggers XP calculation and shows achievement animation.
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SelectionButton } from '@/components/forms/SelectionButton';
import { ProjectWithComputedFields } from '@/services/projects.service';
import { useCompleteProject } from '@/hooks/use-projects';
import type { Database } from '@/types/database';

type ProjectAccuracy = Database['public']['Enums']['project_accuracy'];

interface AccuracyDialogProps {
  project: ProjectWithComputedFields | null;
  onClose: () => void;
}

const ACCURACY_OPTIONS = [
  {
    value: '1' as ProjectAccuracy,
    label: 'MUCH HARDER',
    description: 'Way more complex than expected'
  },
  {
    value: '2' as ProjectAccuracy,
    label: 'HARDER',
    description: 'Somewhat more difficult'
  },
  {
    value: '3' as ProjectAccuracy,
    label: 'ACCURATE',
    description: 'Pretty much as expected'
  },
  {
    value: '4' as ProjectAccuracy,
    label: 'EASIER',
    description: 'Less work than anticipated'
  },
  {
    value: '5' as ProjectAccuracy,
    label: 'MUCH EASIER',
    description: 'Way simpler than expected'
  }
];

export function AccuracyDialog({ project, onClose }: AccuracyDialogProps) {
  const [selectedAccuracy, setSelectedAccuracy] = useState<ProjectAccuracy | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const completeProject = useCompleteProject();

  if (!project) return null;

  const handleSubmit = async () => {
    if (!selectedAccuracy) return;

    setIsSubmitting(true);

    try {
      await completeProject.mutateAsync({
        projectId: project.id,
        accuracy: selectedAccuracy
      });

      // Close dialog
      handleClose();
    } catch (error) {
      // Error handled by hook
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedAccuracy('');
    setIsSubmitting(false);
    onClose();
  };

  const selectedOption = ACCURACY_OPTIONS.find(opt => opt.value === selectedAccuracy);

  return (
    <Modal
      isOpen={!!project}
      onClose={handleClose}
      title="MISSION ACCOMPLISHED! 🎉"
      size="lg"
    >
      <div className="space-y-6">
        {/* Project Summary */}
        <div className="bg-[var(--theme-primary)] border-4 border-black p-4">
          <div className="font-black uppercase tracking-wider text-lg mb-2">
            {project.name}
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm font-mono">
            <div>
              <span className="font-bold uppercase">Cost:</span> {project.cost}/10
            </div>
            <div>
              <span className="font-bold uppercase">Benefit:</span> {project.benefit}/10
            </div>
            <div>
              <span className="font-bold uppercase">Category:</span> {project.category.toUpperCase()}
            </div>
          </div>
          {project.is_boss_battle && (
            <div className="mt-2 text-sm font-bold">
              ⭐ <span className="uppercase tracking-wide">Boss Battle Complete!</span>
            </div>
          )}
        </div>

        {/* Accuracy Question */}
        <div>
          <div className="font-black uppercase tracking-wider text-center mb-4">
            How accurate was your initial estimate?
          </div>
          <div className="text-sm font-bold uppercase tracking-wide text-center text-black/70 mb-6">
            This helps improve your future estimates and affects XP calculation
          </div>

          {/* Accuracy Scale */}
          <div className="space-y-3">
            {ACCURACY_OPTIONS.map((option) => (
              <div key={option.value}>
                <SelectionButton
                  value={option.value}
                  label={`${option.value}. ${option.label}`}
                  isSelected={selectedAccuracy === option.value}
                  onSelect={(value) => setSelectedAccuracy(value as ProjectAccuracy)}
                  className="text-left"
                />
                {selectedAccuracy === option.value && (
                  <div className="mt-2 p-3 bg-[var(--theme-accent)] border-2 border-black text-sm font-bold uppercase tracking-wide">
                    {option.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* XP Preview */}
        {selectedOption && (
          <div className="bg-green-100 border-4 border-green-600 p-4">
            <div className="font-black uppercase tracking-wider mb-2">
              🏆 XP PREVIEW
            </div>
            <div className="text-sm font-mono">
              <div>Base XP: {project.cost * project.benefit * 10}</div>
              {project.is_boss_battle && <div>Boss Battle Bonus: x2</div>}
              <div className="font-bold mt-2">
                Estimated Total: ~{project.cost * project.benefit * 10 * (project.is_boss_battle ? 2 : 1)} XP
              </div>
            </div>
            <div className="text-xs font-bold uppercase tracking-wide text-green-700 mt-2">
              Final XP calculated by server based on accuracy rating
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={!selectedAccuracy || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'COMPLETING...' : 'COMPLETE PROJECT'}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            CANCEL
          </Button>
        </div>
      </div>
    </Modal>
  );
}
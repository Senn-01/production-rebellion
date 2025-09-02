/**
 * ProjectActions Component
 * 
 * Action menu for project operations: edit, complete, boss battle, abandon, delete.
 * Appears when a project node is clicked.
 */

'use client';

import React, { useState } from 'react';
import { Edit, CheckCircle, Crown, Archive, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ProjectWithComputedFields } from '@/services/projects.service';
import { 
  useUpdateProject, 
  useCompleteProject,
  useSetBossBattle,
  useClearBossBattle,
  useAbandonProject,
  useDeleteProject
} from '@/hooks/use-projects';

interface ProjectActionsProps {
  project: ProjectWithComputedFields | null;
  onClose: () => void;
  onEdit: (project: ProjectWithComputedFields) => void;
  onComplete: (project: ProjectWithComputedFields) => void;
}

export function ProjectActions({ 
  project, 
  onClose, 
  onEdit, 
  onComplete 
}: ProjectActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  
  const updateProject = useUpdateProject();
  const setBossBattle = useSetBossBattle();
  const clearBossBattle = useClearBossBattle();
  const abandonProject = useAbandonProject();
  const deleteProject = useDeleteProject();

  if (!project) return null;

  const handleEdit = () => {
    onEdit(project);
    onClose();
  };

  const handleComplete = () => {
    onComplete(project);
    onClose();
  };

  const handleToggleBossBattle = async () => {
    try {
      if (project.is_boss_battle) {
        await clearBossBattle.mutateAsync();
      } else {
        await setBossBattle.mutateAsync(project.id);
      }
      onClose();
    } catch (error) {
      // Error handled by hooks
    }
  };

  const handleAbandon = async () => {
    if (!showAbandonConfirm) {
      setShowAbandonConfirm(true);
      return;
    }

    try {
      await abandonProject.mutateAsync(project.id);
      onClose();
    } catch (error) {
      // Error handled by hooks
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      await deleteProject.mutateAsync(project.id);
      onClose();
    } catch (error) {
      // Error handled by hooks
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = project.status === 'active' ? 'inactive' : 'active';
      await updateProject.mutateAsync({
        projectId: project.id,
        updates: { status: newStatus }
      });
      onClose();
    } catch (error) {
      // Error handled by hooks
    }
  };

  return (
    <Modal
      isOpen={!!project}
      onClose={onClose}
      title={project.name}
      size="md"
    >
      <div className="space-y-4">
        {/* Project Info */}
        <div className="bg-[var(--theme-accent)] border-4 border-black p-4">
          <div className="grid grid-cols-2 gap-4 text-sm font-mono">
            <div>
              <span className="font-bold uppercase tracking-wide">Category:</span>
              <br />
              <span className="uppercase">{project.category}</span>
            </div>
            <div>
              <span className="font-bold uppercase tracking-wide">Priority:</span>
              <br />
              <span className="uppercase">{project.priority}</span>
            </div>
            <div>
              <span className="font-bold uppercase tracking-wide">Cost:</span>
              <br />
              <span>{project.cost}/10</span>
            </div>
            <div>
              <span className="font-bold uppercase tracking-wide">Benefit:</span>
              <br />
              <span>{project.benefit}/10</span>
            </div>
          </div>
          
          {project.due_date && (
            <div className="mt-3 text-sm font-mono">
              <span className="font-bold uppercase tracking-wide">Due:</span> {project.due_date}
              {project.isApproachingDeadline && (
                <span className="ml-2 text-red-600 font-bold">⚠️ APPROACHING</span>
              )}
            </div>
          )}
        </div>

        {/* Confirmation States */}
        {showAbandonConfirm && (
          <div className="bg-orange-100 border-4 border-orange-600 p-4">
            <div className="font-bold uppercase tracking-wide mb-2">
              ⚠️ CONFIRM ABANDON
            </div>
            <p className="text-sm mb-3">
              This will mark the project as abandoned. You can still view it in analytics.
            </p>
            <div className="flex gap-2">
              <Button variant="danger" size="sm" onClick={handleAbandon}>
                YES, ABANDON
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowAbandonConfirm(false)}>
                CANCEL
              </Button>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="bg-red-100 border-4 border-red-600 p-4">
            <div className="font-bold uppercase tracking-wide mb-2">
              🗑️ CONFIRM DELETE
            </div>
            <p className="text-sm mb-3">
              This will permanently delete the project. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button variant="danger" size="sm" onClick={handleDelete}>
                YES, DELETE
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                CANCEL
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        {!showAbandonConfirm && !showDeleteConfirm && (
          <div className="space-y-3">
            {/* Primary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={handleEdit}
                className="justify-start"
              >
                <Edit className="w-4 h-4 mr-2" />
                EDIT
              </Button>
              
              <Button
                variant="primary"
                size="md"
                onClick={handleComplete}
                className="justify-start"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                COMPLETE
              </Button>
            </div>

            {/* Status Toggle */}
            <Button
              variant="secondary"
              size="md"
              onClick={handleToggleStatus}
              className="w-full justify-start"
            >
              {project.status === 'active' ? '👁️ MAKE VISIBLE ONLY' : '🎯 MAKE FOCUS'}
            </Button>

            {/* Boss Battle Toggle */}
            <Button
              variant={project.is_boss_battle ? 'danger' : 'secondary'}
              size="md"
              onClick={handleToggleBossBattle}
              className="w-full justify-start"
            >
              <Crown className="w-4 h-4 mr-2" />
              {project.is_boss_battle ? 'CLEAR BOSS BATTLE' : 'SET BOSS BATTLE'}
            </Button>

            {/* Destructive Actions */}
            <div className="pt-2 border-t-2 border-black/20">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAbandon}
                  className="w-full justify-start text-orange-600 hover:bg-orange-50"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  ABANDON PROJECT
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="w-full justify-start text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  DELETE PROJECT
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
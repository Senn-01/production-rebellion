'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ProjectNode } from '@/components/tactical-map/ProjectNode';
import { ProjectActions } from '@/components/tactical-map/ProjectActions';
import { AddProjectModal } from '@/components/modals/AddProjectModal';
import { AccuracyDialog } from '@/components/modals/AccuracyDialog';
import { TriageModal } from '@/components/modals/TriageModal';
import { ParkingLotModal } from '@/components/modals/ParkingLotModal';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/use-projects';
import { usePendingCapturesCount, usePendingCaptures, useTriageCapture, useParkingLotItems, useDeleteParkingLotItem } from '@/hooks/use-captures';
import { ProjectWithComputedFields } from '@/services/projects.service';

export default function TacticalMapPage() {
  const { loading } = useAuth();
  
  // Get user's projects for the grid
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  
  // Get pending captures count and data for triage button
  const { data: pendingCount = 0 } = usePendingCapturesCount();
  const { data: pendingCaptures = [] } = usePendingCaptures();
  
  // Get parking lot items and mutation for delete
  const { data: parkingLotItems = [] } = useParkingLotItems();
  const deleteParkingLotItem = useDeleteParkingLotItem();
  
  // Triage mutation for processing captures
  const triageCapture = useTriageCapture();

  // Modal states
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithComputedFields | null>(null);
  const [projectToComplete, setProjectToComplete] = useState<ProjectWithComputedFields | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectWithComputedFields | null>(null);
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [isParkingLotOpen, setIsParkingLotOpen] = useState(false);
  const [currentTriageIndex, setCurrentTriageIndex] = useState(0);
  const [triageContent, setTriageContent] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="font-bold uppercase">Loading your strategic workspace...</p>
        </div>
      </div>
    );
  }

  const handleProjectClick = (project: ProjectWithComputedFields) => {
    setSelectedProject(project);
  };

  const handleProjectEdit = (project: ProjectWithComputedFields) => {
    setEditingProject(project);
  };

  const handleProjectComplete = (project: ProjectWithComputedFields) => {
    setProjectToComplete(project);
  };

  const handleCloseActions = () => {
    setSelectedProject(null);
  };

  const handleCloseAccuracy = () => {
    setProjectToComplete(null);
  };

  const handleCloseAddProject = () => {
    setIsAddProjectOpen(false);
    setEditingProject(null);
    setTriageContent(null);
  };

  const handleTriageAction = async (action: 'track' | 'parking' | 'doing' | 'routing' | 'delete') => {
    if (pendingCaptures.length === 0 || currentTriageIndex >= pendingCaptures.length) {
      return;
    }

    const currentCapture = pendingCaptures[currentTriageIndex];
    
    try {
      if (action === 'track') {
        // Track as project - store content and open AddProjectModal
        setTriageContent(currentCapture.content);
        setIsTriageOpen(false);
        setIsAddProjectOpen(true);
        
        // Process the triage decision
        await triageCapture.mutateAsync({
          captureId: currentCapture.id,
          decision: 'project'
        });
      } else {
        // Handle other decisions
        const decisionMap = {
          parking: 'parking_lot' as const,
          doing: 'doing_now' as const,
          routing: 'routing' as const,
          delete: 'deleted' as const
        };
        
        await triageCapture.mutateAsync({
          captureId: currentCapture.id,
          decision: decisionMap[action]
        });
        
        // Move to next item or close if done
        if (currentTriageIndex >= pendingCaptures.length - 1) {
          setIsTriageOpen(false);
          setCurrentTriageIndex(0);
        } else {
          setCurrentTriageIndex(currentTriageIndex + 1);
        }
      }
    } catch (error) {
      // Error handling is done by the mutation
      console.error('Triage action failed:', error);
    }
  };
  
  const handleCloseTriage = () => {
    setIsTriageOpen(false);
    setCurrentTriageIndex(0);
  };

  const handlePromoteParkingItem = (item: { id: string; content: string; parked_at: string }) => {
    setTriageContent(item.content);
    setIsParkingLotOpen(false);
    setIsAddProjectOpen(true);
  };

  const handleDeleteParkingItem = async (itemId: string) => {
    try {
      await deleteParkingLotItem.mutateAsync(itemId);
    } catch (error) {
      // Error handling is done by the mutation
      console.error('Delete parking lot item failed:', error);
    }
  };

  return (
    <div className="p-8 pb-32">
      {/* Modals */}
      <AddProjectModal
        isOpen={isAddProjectOpen || !!editingProject}
        onClose={handleCloseAddProject}
        initialData={editingProject ? {
          name: editingProject.name,
          cost: editingProject.cost,
          benefit: editingProject.benefit,
          category: editingProject.category,
          priority: editingProject.priority,
          status: editingProject.status,
          confidence: editingProject.confidence,
          dueDate: editingProject.due_date || '',
          description: editingProject.description || '',
          tags: editingProject.tags?.join(', ') || ''
        } : triageContent ? {
          name: triageContent,
          cost: 1,
          benefit: 1,
          category: 'work',
          priority: 'should',
          status: 'active',
          confidence: 'medium',
          dueDate: '',
          description: '',
          tags: ''
        } : undefined}
      />

      <TriageModal
        isOpen={isTriageOpen}
        onClose={handleCloseTriage}
        captures={pendingCaptures}
        currentIndex={currentTriageIndex}
        onTriageAction={handleTriageAction}
      />

      <ParkingLotModal
        isOpen={isParkingLotOpen}
        onClose={() => setIsParkingLotOpen(false)}
        parkingLotItems={parkingLotItems}
        onPromoteToProject={handlePromoteParkingItem}
        onDeleteItem={handleDeleteParkingItem}
      />

      <ProjectActions
        project={selectedProject}
        onClose={handleCloseActions}
        onEdit={handleProjectEdit}
        onComplete={handleProjectComplete}
      />

      <AccuracyDialog
        project={projectToComplete}
        onClose={handleCloseAccuracy}
      />

      {/* Action Buttons Row */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="primary" 
          size="lg"
          onClick={() => setIsAddProjectOpen(true)}
        >
          ADD PROJECT
        </Button>
        <Button 
          variant="secondary" 
          size="lg"
          onClick={() => setIsTriageOpen(true)}
          disabled={pendingCount === 0}
        >
          {pendingCount > 0 ? `TRIAGE (${pendingCount})` : 'TRIAGE (0)'}
        </Button>
        <Button 
          variant="secondary" 
          size="lg"
          onClick={() => setIsParkingLotOpen(true)}
        >
          PARKING LOT ({parkingLotItems.length})
        </Button>
      </div>

      {/* Chart Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-black uppercase tracking-wider text-2xl mb-2">
            Cost vs Benefit Analysis
          </h2>
          <p className="font-bold uppercase tracking-wide text-sm opacity-75">
            {projects.length} projects visible
          </p>
        </div>
        
        {/* Legend */}
        <Card className="p-4">
          <div className="space-y-2 text-sm">
            <div className="font-bold uppercase tracking-wide mb-3">Legend</div>
            
            {/* Categories */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#9ca3af] border border-black"></div>
                <span>Work</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#f7f7f5] border border-black relative">
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#9ca3af_2px,#9ca3af_3px)]"></div>
                </div>
                <span>Learn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#f7f7f5] border border-black relative">
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#9ca3af_2px,#9ca3af_3px)]"></div>
                </div>
                <span>Build</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#f7f7f5] border border-black relative">
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#9ca3af_2px,#9ca3af_3px)]"></div>
                </div>
                <span>Manage</span>
              </div>
            </div>
            
            {/* Priorities */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-white border-2 border-black shadow-[2px_2px_0px_#FFD700]"></div>
                <span>Must-Do</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-white border-2 border-black shadow-[2px_2px_0px_#000000]"></div>
                <span>Should-Do</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-white border-2 border-black shadow-[2px_2px_0px_#666666]"></div>
                <span>Nice-to-Have</span>
              </div>
            </div>
            
            {/* Boss Battle */}
            <div className="flex items-center gap-2 text-xs mt-2">
              <span>⭐</span>
              <span>Boss Battle</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Cost/Benefit Grid */}
      <Card className="relative w-full h-[600px] overflow-hidden bg-[#f7f7f5]">
        <CardContent className="p-0 h-full">
          <div className="relative w-full h-full">
            {/* Grid Lines */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 21 }).map((_, i) => (
                <div
                  key={`v-${i}`}
                  className="absolute top-0 bottom-0 border-l border-gray-400"
                  style={{ left: `${i * 5}%` }}
                />
              ))}
              {Array.from({ length: 21 }).map((_, i) => (
                <div
                  key={`h-${i}`}
                  className="absolute left-0 right-0 border-t border-gray-400"
                  style={{ top: `${i * 5}%` }}
                />
              ))}
            </div>

            {/* Main Axes */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[4px] bg-black transform -translate-x-1/2" />
            <div className="absolute left-0 right-0 top-1/2 h-[4px] bg-black transform -translate-y-1/2" />

            {/* Quadrant Labels */}
            <div className="absolute top-4 left-4 font-black uppercase text-sm">
              NO-BRAINER
              <div className="text-xs font-bold text-black/60 mt-1">Low Cost, High Impact</div>
            </div>
            <div className="absolute top-4 right-4 font-black uppercase text-sm text-right">
              BREAKTHROUGH
              <div className="text-xs font-bold text-black/60 mt-1">High Cost, High Impact</div>
            </div>
            <div className="absolute bottom-4 left-4 font-black uppercase text-sm">
              SIDE-QUEST
              <div className="text-xs font-bold text-black/60 mt-1">Low Cost, Low Impact</div>
            </div>
            <div className="absolute bottom-4 right-4 font-black uppercase text-sm text-right">
              TRAP-ZONE
              <div className="text-xs font-bold text-black/60 mt-1">High Cost, Low Impact</div>
            </div>

            {/* Axis Labels */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 font-black uppercase text-xs">
              EFFORT (COST) →
            </div>
            <div className="absolute top-1/2 left-2 transform -translate-y-1/2 -rotate-90 font-black uppercase text-xs">
              ← IMPACT (BENEFIT)
            </div>

            {/* Project Nodes */}
            {projectsLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                  <p className="font-bold uppercase text-sm">Loading projects...</p>
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <h3 className="font-black uppercase text-xl mb-4">
                    Time to Start Strategizing
                  </h3>
                  <p className="font-bold uppercase text-sm mb-6 opacity-75">
                    Your tactical map is empty. Add your first project to begin visualizing your strategic priorities.
                  </p>
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={() => setIsAddProjectOpen(true)}
                  >
                    ADD YOUR FIRST PROJECT
                  </Button>
                </div>
              </div>
            ) : (
              // Render project nodes at their calculated positions
              projects.map((project) => (
                <div
                  key={project.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ 
                    left: `${(project.cost / 10) * 100}%`, 
                    top: `${100 - (project.benefit / 10) * 100}%`
                  }}
                >
                  <ProjectNode 
                    project={project}
                    onClick={handleProjectClick}
                  />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
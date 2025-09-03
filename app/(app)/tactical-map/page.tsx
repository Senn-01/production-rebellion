'use client';

import React, { useState } from 'react';
import { Plus, Zap, Archive } from 'lucide-react';
import { Button } from '@/components/ui/Button';
// import { Card, CardContent } from '@/components/ui/Card'; // Will be used for stats cards
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

  const handlePromoteParkingItem = (item: { id: string; content: string; parked_at: string | null }) => {
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

      {/* Title Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black uppercase tracking-wider mb-4">Strategic View</h1>
        <p className="text-xl font-bold uppercase tracking-wide text-black/70">Visual Decision-Making Arena</p>
      </div>

      {/* Action Buttons Row */}
      <div className="flex justify-center gap-6 mb-12">
        <button 
          onClick={() => setIsAddProjectOpen(true)}
          className="bg-[#FDE047] border-4 border-black font-black uppercase tracking-wider px-8 py-4 hover:bg-[#FDE047]/90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000]"
        >
          <Plus className="w-5 h-5 inline mr-3" />
          ADD PROJECT
        </button>
        
        <button 
          onClick={() => setIsTriageOpen(true)}
          disabled={pendingCount === 0}
          className="bg-[#FDE047] border-4 border-black font-black uppercase tracking-wider px-8 py-4 hover:bg-[#FDE047]/90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="w-5 h-5 inline mr-3" />
          TRIAGE ({pendingCount})
        </button>
        
        <button 
          onClick={() => setIsParkingLotOpen(true)}
          className="bg-[#FDE047] border-4 border-black font-black uppercase tracking-wider px-8 py-4 hover:bg-[#FDE047]/90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000]"
        >
          <Archive className="w-5 h-5 inline mr-3" />
          PARKING LOT ({parkingLotItems.length})
        </button>
      </div>

      {/* Project Map with Integrated Header */}
      <div className="max-w-7xl mx-auto mb-12">
        {/* Integrated Header */}
        <div className="bg-[#FDE047] border-4 border-black border-b-0 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-wider mb-2">COST VS BENEFIT ANALYSIS</h2>
              <p className="text-base font-bold uppercase tracking-wide text-black/70 font-mono">{projects.length} PROJECTS VISIBLE</p>
            </div>
            <div className="flex flex-col gap-3 text-sm font-bold uppercase tracking-wide">
              <div className="flex items-center gap-6">
                <span>CATEGORIES:</span>
                
                {/* Inline Pattern Legend */}
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black shadow-[2px_2px_0px_#000000] bg-[#9ca3af]"></div>
                  <span>WORK</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black shadow-[2px_2px_0px_#000000] bg-[#f7f7f5] relative overflow-hidden">
                    <svg width="100%" height="100%" className="absolute inset-0">
                      <defs>
                        <pattern id="legend-learn" patternUnits="userSpaceOnUse" width="8" height="8">
                          <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#9ca3af" strokeWidth="1.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#legend-learn)" />
                    </svg>
                  </div>
                  <span>LEARN</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black shadow-[2px_2px_0px_#000000] bg-[#f7f7f5] relative overflow-hidden">
                    <svg width="100%" height="100%" className="absolute inset-0">
                      <defs>
                        <pattern id="legend-build" patternUnits="userSpaceOnUse" width="6" height="6">
                          <path d="M 6 0 L 0 0 0 6" fill="none" stroke="#9ca3af" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#legend-build)" />
                    </svg>
                  </div>
                  <span>BUILD</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black shadow-[2px_2px_0px_#000000] bg-[#f7f7f5] relative overflow-hidden">
                    <svg width="100%" height="100%" className="absolute inset-0">
                      <defs>
                        <pattern id="legend-manage" patternUnits="userSpaceOnUse" width="8" height="6">
                          <path d="M0,3 L8,3" stroke="#9ca3af" strokeWidth="1.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#legend-manage)" />
                    </svg>
                  </div>
                  <span>MANAGE</span>
                </div>
              </div>
              <div className="text-black/60 font-mono text-sm">
                <span>★ = BOSS BATTLE (WEEKLY FOCUS) • GOLD SHADOW = HIGH PRIORITY</span>
              </div>
            </div>
          </div>
        </div>

      {/* Cost/Benefit Grid */}
      <div className="relative bg-[#f7f7f5] border-4 border-black shadow-[4px_4px_0px_#000000]" style={{ height: '800px', width: '100%' }}>
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
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

        {/* Main Axes - Thicker and more prominent */}
        <div className="absolute top-0 bottom-0 left-1/2 w-[6px] bg-black transform -translate-x-1/2" />
        <div className="absolute left-0 right-0 top-1/2 h-[6px] bg-black transform -translate-y-1/2" />

        {/* Axis Labels */}
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -rotate-90 text-lg font-black uppercase tracking-wide text-black/80 pl-6 font-mono">
          BENEFIT (IMPACT SCORE) →
        </div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-lg font-black uppercase tracking-wide text-black/80 pb-6 font-mono">
          COST (EFFORT SCORE) →
        </div>

        {/* Quadrant Labels - Enhanced typography */}
        <div className="absolute top-8 left-8">
          <div className="text-xl font-black uppercase tracking-wider text-black mb-2">NO-BRAINER</div>
          <div className="text-sm font-bold uppercase tracking-wide text-black/60 font-mono">LOW EFFORT, HIGH IMPACT</div>
        </div>

        <div className="absolute top-8 right-8 text-right">
          <div className="text-xl font-black uppercase tracking-wider text-black mb-2">BREAKTHROUGH</div>
          <div className="text-sm font-bold uppercase tracking-wide text-black/60 font-mono">HIGH EFFORT, HIGH IMPACT</div>
        </div>

        <div className="absolute bottom-8 left-8">
          <div className="text-xl font-black uppercase tracking-wider text-black mb-2">SIDE-QUEST</div>
          <div className="text-sm font-bold uppercase tracking-wide text-black/60 font-mono">LOW EFFORT, LOW IMPACT</div>
        </div>

        <div className="absolute bottom-8 right-8 text-right">
          <div className="text-xl font-black uppercase tracking-wider text-black mb-2">TRAP-ZONE</div>
          <div className="text-sm font-bold uppercase tracking-wide text-black/60 font-mono">HIGH EFFORT, LOW IMPACT</div>
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
                left: `${project.x}%`, 
                top: `${100 - project.y}%`
              }}
              title={`${project.name} - Priority: ${project.priority}`}
            >
              <ProjectNode 
                project={project}
                onClick={handleProjectClick}
              />
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
}
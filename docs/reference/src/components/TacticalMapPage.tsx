import { useState } from 'react';
import { Plus, Zap, Archive } from 'lucide-react';
import { ProjectIcon } from './ProjectIcon';
import { PatternLegend } from './PatternLegend';
import { TriageModal } from './modals/TriageModal';
import { ParkingLotModal } from './modals/ParkingLotModal';
import { AddProjectModal } from './modals/AddProjectModal';
import { useTriageSystem } from '../hooks/useTriageSystem';
import { useProjectForm } from '../hooks/useProjectForm';
import { sampleProjects } from '../data/sampleProjects';

export function TacticalMapPage() {
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [isParkingLotOpen, setIsParkingLotOpen] = useState(false);

  const {
    triageItems,
    parkingLotItems,
    currentTriageIndex,
    handleTriageAction,
    handlePromoteToProject,
    handleDeleteParkingItem
  } = useTriageSystem();

  const { formData, updateField, resetForm, handleSubmit, setFormData } = useProjectForm();

  const handleTriageActionWithModal = (action: string) => {
    handleTriageAction(action, (text: string) => {
      setIsTriageOpen(false);
      setIsAddProjectOpen(true);
      setFormData(prev => ({ ...prev, projectName: text }));
    });

    if (currentTriageIndex >= triageItems.length - 1) {
      setIsTriageOpen(false);
    }
  };

  const handlePromoteWithModal = (item: any) => {
    handlePromoteToProject(item, (text: string) => {
      setIsParkingLotOpen(false);
      setIsAddProjectOpen(true);
      setFormData(prev => ({ ...prev, projectName: text }));
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    const submittedData = handleSubmit(e);
    setIsAddProjectOpen(false);
    resetForm();
    // Handle the submitted data as needed
  };

  return (
    <main className="px-8 py-10">
      {/* Modals */}
      <TriageModal
        isOpen={isTriageOpen}
        onClose={() => setIsTriageOpen(false)}
        triageItems={triageItems}
        currentTriageIndex={currentTriageIndex}
        onTriageAction={handleTriageActionWithModal}
      />
      
      <ParkingLotModal
        isOpen={isParkingLotOpen}
        onClose={() => setIsParkingLotOpen(false)}
        parkingLotItems={parkingLotItems}
        onPromoteToProject={handlePromoteWithModal}
        onDeleteItem={handleDeleteParkingItem}
      />

      <AddProjectModal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        formData={formData}
        onUpdateField={updateField}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setIsAddProjectOpen(false);
          resetForm();
        }}
      />

      {/* Title Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black uppercase tracking-wider mb-4">Strategic View</h1>
        <p className="text-xl font-bold uppercase tracking-wide text-black/70">Visual Decision-Making Arena</p>
      </div>

      {/* Action Buttons */}
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
          className="bg-[#FDE047] border-4 border-black font-black uppercase tracking-wider px-8 py-4 hover:bg-[#FDE047]/90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000]"
        >
          <Zap className="w-5 h-5 inline mr-3" />
          TRIAGE ({triageItems.length})
        </button>
        
        <button 
          onClick={() => setIsParkingLotOpen(true)}
          className="bg-[#FDE047] border-4 border-black font-black uppercase tracking-wider px-8 py-4 hover:bg-[#FDE047]/90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000]"
        >
          <Archive className="w-5 h-5 inline mr-3" />
          PARKING LOT ({parkingLotItems.length})
        </button>
      </div>

      {/* Project Map */}
      <div className="max-w-7xl mx-auto mb-12">
        {/* Header */}
        <div className="bg-[#FDE047] border-4 border-black border-b-0 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-wider mb-2">COST VS BENEFIT ANALYSIS</h2>
              <p className="text-base font-bold uppercase tracking-wide text-black/70 font-mono">{sampleProjects.length} PROJECTS VISIBLE</p>
            </div>
            <div className="flex flex-col gap-3 text-sm font-bold uppercase tracking-wide">
              <div className="flex items-center gap-6">
                <span>CATEGORIES:</span>
                <PatternLegend category="WORK" label="WORK" />
                <PatternLegend category="LEARN" label="LEARN" />
                <PatternLegend category="BUILD" label="BUILD" />
                <PatternLegend category="MANAGE" label="MANAGE" />
              </div>
              <div className="text-black/60 font-mono text-sm">
                <span>★ = BOSS BATTLE (WEEKLY FOCUS) • GOLD SHADOW = HIGH PRIORITY</span>
              </div>
            </div>
          </div>
        </div>

        <div 
          className="relative bg-[#f7f7f5] border-4 border-black shadow-[4px_4px_0px_#000000]"
          style={{ height: '800px', width: '100%' }}
        >
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
          <div 
            className="absolute top-1/2 left-0 transform -translate-y-1/2 -rotate-90 text-lg font-black uppercase tracking-wide text-black/80 pl-6 font-mono"
          >
            BENEFIT (IMPACT SCORE) →
          </div>
          <div 
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-lg font-black uppercase tracking-wide text-black/80 pb-6 font-mono"
          >
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

          {/* Sample Projects */}
          {sampleProjects.map((project) => (
            <div
              key={project.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                left: `${project.x}%`, 
                top: `${100 - project.y}%`
              }}
              title={`${project.title} - Priority: ${project.priority}`}
            >
              <ProjectIcon 
                category={project.category} 
                isBossBattle={project.isBossBattle}
                priority={project.priority}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto mb-20">
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-[#FDE047] border-4 border-black p-8 shadow-[4px_4px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] transition-all duration-100">
            <div className="text-7xl font-black text-black font-mono mb-3">{sampleProjects.filter(p => p.isBossBattle).length}</div>
            <div className="text-2xl font-black uppercase tracking-wider text-black mb-2">ACTIVE PROJECTS</div>
            <div className="text-base font-bold uppercase tracking-wide text-black/70">THIS WEEK'S FOCUS</div>
          </div>
          
          <div className="bg-[#f7f7f5] border-4 border-black p-8 shadow-[4px_4px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] transition-all duration-100">
            <div className="text-7xl font-black text-black font-mono mb-3">{sampleProjects.filter(p => !p.isBossBattle).length}</div>
            <div className="text-2xl font-black uppercase tracking-wider text-black mb-2">INACTIVE PROJECTS</div>
            <div className="text-base font-bold uppercase tracking-wide text-black/70">AVAILABLE OPTIONS</div>
          </div>
        </div>
      </div>
    </main>
  );
}
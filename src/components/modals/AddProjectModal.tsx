/**
 * AddProjectModal Component
 * 
 * Modal for creating new projects with all 11 fields as specified in brief.md.
 * Handles form validation, coordinate collision detection, and database integration.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { CompactGuidance } from '@/components/forms/CompactGuidance';
import { CategoryBlock } from '@/components/forms/CategoryBlock';
import { SelectionButton } from '@/components/forms/SelectionButton';
import { useCreateProject, useCheckCoordinateAvailability } from '@/hooks/use-projects';
import type { Database } from '@/types/database';

type ProjectCategory = Database['public']['Enums']['project_category'];
type ProjectPriority = Database['public']['Enums']['project_priority'];
type ProjectStatus = Database['public']['Enums']['project_status'];
type ProjectConfidence = Database['public']['Enums']['project_confidence'];

interface ProjectFormData {
  name: string;
  cost: number | '';
  benefit: number | '';
  category: ProjectCategory | '';
  priority: ProjectPriority | '';
  status: ProjectStatus | '';
  confidence: ProjectConfidence | '';
  dueDate: string;
  description: string;
  tags: string;
}

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<ProjectFormData>;
}

export function AddProjectModal({ isOpen, onClose, initialData }: AddProjectModalProps) {
  const createProject = useCreateProject();
  const checkCoordinate = useCheckCoordinateAvailability();
  
  // Form state
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    cost: '',
    benefit: '',
    category: '',
    priority: '',
    status: 'active', // Default to active (focus mode)
    confidence: '',
    dueDate: '',
    description: '',
    tags: '',
    ...initialData
  });

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        name: '',
        cost: '',
        benefit: '',
        category: '',
        priority: '',
        status: 'active',
        confidence: '',
        dueDate: '',
        description: '',
        tags: ''
      });
    }
  }, [initialData, isOpen]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinateError, setCoordinateError] = useState<string | null>(null);
  const [isCheckingCoordinates, setIsCheckingCoordinates] = useState(false);

  // Check coordinate availability in real-time
  const checkCoordinates = async (cost: number, benefit: number) => {
    if (!cost || !benefit) {
      setCoordinateError(null);
      return;
    }

    setIsCheckingCoordinates(true);
    try {
      const isAvailable = await checkCoordinate.mutateAsync({
        cost,
        benefit,
        excludeProjectId: initialData ? undefined : undefined // TODO: Pass project ID for edit mode
      });

      if (!isAvailable) {
        setCoordinateError("That spot's taken! Try different cost/benefit scores.");
      } else {
        setCoordinateError(null);
      }
    } catch (error) {
      setCoordinateError("Error checking coordinates. Please try again.");
    } finally {
      setIsCheckingCoordinates(false);
    }
  };

  // Update form field
  const updateField = <K extends keyof ProjectFormData>(field: K, value: ProjectFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Check coordinates when cost or benefit changes
    if (field === 'cost' || field === 'benefit') {
      const newFormData = { ...formData, [field]: value };
      const cost = Number(newFormData.cost);
      const benefit = Number(newFormData.benefit);
      
      if (cost && benefit && cost >= 1 && cost <= 10 && benefit >= 1 && benefit <= 10) {
        // Debounce the check to avoid too many API calls
        setTimeout(() => checkCoordinates(cost, benefit), 300);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.cost || !formData.benefit || 
        !formData.category || !formData.priority || !formData.confidence) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (typeof formData.cost !== 'number' || typeof formData.benefit !== 'number') {
      toast.error('Cost and benefit must be numbers');
      return;
    }

    // Block submission if there's a coordinate collision
    if (coordinateError) {
      toast.error('Please resolve the coordinate collision before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create project (coordinate check already done in real-time)
      await createProject.mutateAsync({
        name: formData.name,
        cost: formData.cost,
        benefit: formData.benefit,
        category: formData.category as ProjectCategory,
        priority: formData.priority as ProjectPriority,
        status: formData.status as ProjectStatus,
        confidence: formData.confidence as ProjectConfidence,
        due_date: formData.dueDate || null,
        description: formData.description || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : null
      });

      // Reset form and close modal
      handleReset();
      onClose();
      
    } catch (error) {
      // Error is already handled by the hook with toast
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      name: '',
      cost: '',
      benefit: '',
      category: '',
      priority: '',
      status: 'active',
      confidence: '',
      dueDate: '',
      description: '',
      tags: ''
    });
    setIsSubmitting(false);
    setCoordinateError(null);
    setIsCheckingCoordinates(false);
  };

  // Cancel and close
  const handleCancel = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="ADD NEW PROJECT"
      size="xl"
      className="max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div>
          <Label required>PROJECT NAME</Label>
          <Input
            required
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="ENTER PROJECT TITLE"
            className="font-bold uppercase"
          />
        </div>

        {/* Cost and Benefit Scores */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label required>COST SCORE (1-10)</Label>
            <Select
              required
              value={formData.cost.toString()}
              onChange={(e) => updateField('cost', Number(e.target.value) || '')}
              className={coordinateError ? 'border-red-500' : ''}
            >
              <option value="" disabled>SELECT EFFORT LEVEL</option>
              {Array.from({length: 10}, (_, i) => (
                <option key={i+1} value={(i+1).toString()}>
                  {i+1}
                </option>
              ))}
            </Select>
            <CompactGuidance type="cost" />
          </div>

          <div>
            <Label required>BENEFIT SCORE (1-10)</Label>
            <Select
              required
              value={formData.benefit.toString()}
              onChange={(e) => updateField('benefit', Number(e.target.value) || '')}
              className={coordinateError ? 'border-red-500' : ''}
            >
              <option value="" disabled>SELECT IMPACT LEVEL</option>
              {Array.from({length: 10}, (_, i) => (
                <option key={i+1} value={(i+1).toString()}>
                  {i+1}
                </option>
              ))}
            </Select>
            <CompactGuidance type="benefit" />
          </div>
        </div>

        {/* Coordinate Error Display */}
        {coordinateError && (
          <div className="bg-red-100 border-4 border-red-600 p-4 rounded-none">
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-700">⚠️ COLLISION DETECTED</span>
              {isCheckingCoordinates && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              )}
            </div>
            <p className="text-sm font-mono text-red-800 mt-2">
              {coordinateError}
            </p>
          </div>
        )}

        {/* Category */}
        <div>
          <Label required>CATEGORY</Label>
          <div className="grid grid-cols-2 gap-3">
            <CategoryBlock
              value="work"
              label="WORK"
              description="Career, clients, income"
              isSelected={formData.category === 'work'}
              onSelect={(value) => updateField('category', value as ProjectCategory)}
            />
            <CategoryBlock
              value="learn"
              label="LEARN"
              description="Education, skills, growth"
              isSelected={formData.category === 'learn'}
              onSelect={(value) => updateField('category', value as ProjectCategory)}
            />
            <CategoryBlock
              value="build"
              label="BUILD"
              description="Creating, ventures, projects"
              isSelected={formData.category === 'build'}
              onSelect={(value) => updateField('category', value as ProjectCategory)}
            />
            <CategoryBlock
              value="manage"
              label="MANAGE"
              description="Health, relationships, personal"
              isSelected={formData.category === 'manage'}
              onSelect={(value) => updateField('category', value as ProjectCategory)}
            />
          </div>
        </div>

        {/* Priority and Status */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label required>PRIORITY LEVEL</Label>
            <div className="space-y-3">
              <SelectionButton
                value="must"
                label="MUST-DO"
                isSelected={formData.priority === 'must'}
                onSelect={(value) => updateField('priority', value as ProjectPriority)}
              />
              <SelectionButton
                value="should"
                label="SHOULD-DO"
                isSelected={formData.priority === 'should'}
                onSelect={(value) => updateField('priority', value as ProjectPriority)}
              />
              <SelectionButton
                value="nice"
                label="NICE-TO-HAVE"
                isSelected={formData.priority === 'nice'}
                onSelect={(value) => updateField('priority', value as ProjectPriority)}
              />
            </div>
          </div>

          <div>
            <Label required>STATUS</Label>
            <div className="space-y-3">
              <SelectionButton
                value="active"
                label="FOCUS"
                isSelected={formData.status === 'active'}
                onSelect={(value) => updateField('status', value as ProjectStatus)}
              />
              <SelectionButton
                value="inactive"
                label="VISIBLE"
                isSelected={formData.status === 'inactive'}
                onSelect={(value) => updateField('status', value as ProjectStatus)}
              />
              <div className="h-12"></div> {/* Spacer */}
            </div>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <Label>DUE DATE (OPTIONAL)</Label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => updateField('dueDate', e.target.value)}
          />
        </div>

        {/* Tags */}
        <div>
          <Label>TAGS (OPTIONAL)</Label>
          <Input
            value={formData.tags}
            onChange={(e) => updateField('tags', e.target.value)}
            placeholder="ENTER COMMA-SEPARATED TAGS"
          />
          <p className="text-xs font-mono uppercase tracking-wide text-black/60 mt-2">
            EXAMPLE: URGENT, CLIENT-WORK, DEADLINE
          </p>
        </div>

        {/* Description */}
        <div>
          <Label>DESCRIPTION/LINKS (OPTIONAL)</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="ADDITIONAL CONTEXT OR LINKS..."
            rows={3}
          />
        </div>

        {/* Confidence Level */}
        <div>
          <Label required>CONFIDENCE LEVEL</Label>
          <div className="grid grid-cols-3 gap-4">
            <SelectionButton
              value="very_high"
              label="VERY HIGH"
              isSelected={formData.confidence === 'very_high'}
              onSelect={(value) => updateField('confidence', value as ProjectConfidence)}
            />
            <SelectionButton
              value="high"
              label="HIGH"
              isSelected={formData.confidence === 'high'}
              onSelect={(value) => updateField('confidence', value as ProjectConfidence)}
            />
            <SelectionButton
              value="medium"
              label="MEDIUM"
              isSelected={formData.confidence === 'medium'}
              onSelect={(value) => updateField('confidence', value as ProjectConfidence)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <SelectionButton
              value="low"
              label="LOW"
              isSelected={formData.confidence === 'low'}
              onSelect={(value) => updateField('confidence', value as ProjectConfidence)}
            />
            <SelectionButton
              value="very_low"
              label="VERY LOW"
              isSelected={formData.confidence === 'very_low'}
              onSelect={(value) => updateField('confidence', value as ProjectConfidence)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t-4 border-black">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting || !!coordinateError || isCheckingCoordinates}
            className="flex-1"
          >
            {isSubmitting ? 'CREATING...' : 
             isCheckingCoordinates ? 'CHECKING...' :
             coordinateError ? 'RESOLVE COLLISION' : 
             'CREATE PROJECT'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            CANCEL
          </Button>
        </div>
      </form>
    </Modal>
  );
}
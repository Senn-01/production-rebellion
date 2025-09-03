import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { CategoryBlock } from '../forms/CategoryBlock';
import { SelectionButton } from '../forms/SelectionButton';
import { CompactGuidance } from '../forms/CompactGuidance';
import { ProjectFormData } from '../../types/project';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ProjectFormData;
  onUpdateField: (field: keyof ProjectFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function AddProjectModal({
  isOpen,
  onClose,
  formData,
  onUpdateField,
  onSubmit,
  onCancel
}: AddProjectModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="bg-[#d1d5db] border-4 border-black shadow-[8px_8px_0px_#000000] max-h-[85vh] overflow-y-auto"
        style={{ width: '1000px', maxWidth: '1000px' }}
      >
        <DialogHeader className="bg-[#FDE047] border-4 border-black p-6">
          <DialogTitle className="text-3xl font-black uppercase tracking-wider text-black">
            ADD NEW PROJECT
          </DialogTitle>
          <DialogDescription className="text-base font-bold uppercase tracking-wide text-black/90">
            STRATEGIC PROJECT EVALUATION
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-6 p-6">
          {/* Project Name */}
          <div>
            <Label className="text-base font-black uppercase tracking-wider text-black mb-3 block">
              PROJECT NAME *
            </Label>
            <Input
              required
              value={formData.projectName}
              onChange={(e) => onUpdateField('projectName', e.target.value)}
              className="bg-white border-4 border-black shadow-[4px_4px_0px_#FDE047] font-bold uppercase tracking-wide text-black placeholder:text-black/50 focus:shadow-[6px_6px_0px_#FDE047] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-100 font-mono text-lg h-12"
              placeholder="ENTER PROJECT TITLE"
            />
          </div>

          {/* Scores */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <Label className="text-base font-black uppercase tracking-wider text-black mb-3 block">
                COST SCORE (1-10) *
              </Label>
              <Select value={formData.costScore} onValueChange={(value) => onUpdateField('costScore', value)}>
                <SelectTrigger className="bg-white border-4 border-black shadow-[4px_4px_0px_#000000] font-bold uppercase tracking-wide text-black focus:shadow-[6px_6px_0px_#525252] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-100 font-mono h-12">
                  <SelectValue placeholder="SELECT EFFORT LEVEL" />
                </SelectTrigger>
                <SelectContent className="bg-white border-4 border-black shadow-[4px_4px_0px_#000000]">
                  {Array.from({length: 10}, (_, i) => (
                    <SelectItem key={i+1} value={(i+1).toString()} className="font-bold uppercase tracking-wide font-mono hover:bg-[#525252]/20">
                      {i+1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <CompactGuidance type="cost" />
            </div>

            <div>
              <Label className="text-base font-black uppercase tracking-wider text-black mb-3 block">
                BENEFIT SCORE (1-10) *
              </Label>
              <Select value={formData.benefitScore} onValueChange={(value) => onUpdateField('benefitScore', value)}>
                <SelectTrigger className="bg-white border-4 border-black shadow-[4px_4px_0px_#000000] font-bold uppercase tracking-wide text-black focus:shadow-[6px_6px_0px_#525252] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-100 font-mono h-12">
                  <SelectValue placeholder="SELECT IMPACT LEVEL" />
                </SelectTrigger>
                <SelectContent className="bg-white border-4 border-black shadow-[4px_4px_0px_#000000]">
                  {Array.from({length: 10}, (_, i) => (
                    <SelectItem key={i+1} value={(i+1).toString()} className="font-bold uppercase tracking-wide font-mono hover:bg-[#525252]/20">
                      {i+1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <CompactGuidance type="benefit" />
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-base font-black uppercase tracking-wider text-black mb-4 block">
              CATEGORY *
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <CategoryBlock 
                value="work" 
                label="WORK" 
                description="Career, clients, income"
                color="bg-[#525252]"
                isSelected={formData.category === 'work'}
                onSelect={(value) => onUpdateField('category', value)}
              />
              <CategoryBlock 
                value="learn" 
                label="LEARN" 
                description="Education, skills, growth"
                color="bg-[#525252]"
                isSelected={formData.category === 'learn'}
                onSelect={(value) => onUpdateField('category', value)}
              />
              <CategoryBlock 
                value="build" 
                label="BUILD" 
                description="Creating, ventures, projects"
                color="bg-[#525252]"
                isSelected={formData.category === 'build'}
                onSelect={(value) => onUpdateField('category', value)}
              />
              <CategoryBlock 
                value="manage" 
                label="MANAGE" 
                description="Health, relationships, personal"
                color="bg-[#525252]"
                isSelected={formData.category === 'manage'}
                onSelect={(value) => onUpdateField('category', value)}
              />
            </div>
          </div>

          {/* Tags (Optional) */}
          <div>
            <Label className="text-base font-black uppercase tracking-wider text-black mb-3 block">
              TAGS (OPTIONAL)
            </Label>
            <Input
              value={formData.tags}
              onChange={(e) => onUpdateField('tags', e.target.value)}
              className="bg-white border-4 border-black shadow-[4px_4px_0px_#000000] font-bold text-black placeholder:text-black/50 focus:shadow-[6px_6px_0px_#525252] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-100 font-mono h-12"
              placeholder="ENTER COMMA-SEPARATED TAGS"
            />
            <p className="text-sm font-mono uppercase tracking-wide text-black/70 mt-2">
              EXAMPLE: URGENT, CLIENT-WORK, DEADLINE
            </p>
          </div>

          {/* Priority + Status Combined Section */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <Label className="text-base font-black uppercase tracking-wider text-black mb-4 block">
                PRIORITY LEVEL *
              </Label>
              <div className="space-y-3">
                <SelectionButton 
                  value="high" 
                  label="HIGH" 
                  isSelected={formData.priority === 'high'}
                  onSelect={(value) => onUpdateField('priority', value)}
                />
                <SelectionButton 
                  value="medium" 
                  label="MEDIUM" 
                  isSelected={formData.priority === 'medium'}
                  onSelect={(value) => onUpdateField('priority', value)}
                />
                <SelectionButton 
                  value="low" 
                  label="LOW" 
                  isSelected={formData.priority === 'low'}
                  onSelect={(value) => onUpdateField('priority', value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-black uppercase tracking-wider text-black mb-4 block">
                STATUS *
              </Label>
              <div className="space-y-3">
                <SelectionButton 
                  value="focus" 
                  label="FOCUS" 
                  isSelected={formData.status === 'focus'}
                  onSelect={(value) => onUpdateField('status', value)}
                />
                <SelectionButton 
                  value="visible" 
                  label="VISIBLE" 
                  isSelected={formData.status === 'visible'}
                  onSelect={(value) => onUpdateField('status', value)}
                />
                <div className="p-3"></div> {/* Spacer to align with priority */}
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <Label className="text-base font-black uppercase tracking-wider text-black mb-3 block">
              DUE DATE (OPTIONAL)
            </Label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => onUpdateField('dueDate', e.target.value)}
              className="bg-white border-4 border-black shadow-[4px_4px_0px_#000000] font-bold uppercase tracking-wide text-black focus:shadow-[6px_6px_0px_#525252] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-100 font-mono h-12"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-base font-black uppercase tracking-wider text-black mb-3 block">
              DESCRIPTION/LINKS (OPTIONAL)
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => onUpdateField('description', e.target.value)}
              className="bg-white border-4 border-black shadow-[4px_4px_0px_#000000] font-bold text-black placeholder:text-black/50 focus:shadow-[6px_6px_0px_#525252] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all duration-100 font-mono"
              placeholder="ADDITIONAL CONTEXT OR LINKS..."
              rows={3}
            />
          </div>

          {/* Simplified Confidence Level */}
          <div>
            <Label className="text-base font-black uppercase tracking-wider text-black mb-4 block">
              CONFIDENCE LEVEL *
            </Label>
            <div className="grid grid-cols-3 gap-4">
              <SelectionButton 
                value="high" 
                label="HIGH" 
                isSelected={formData.confidence === 'high'}
                onSelect={(value) => onUpdateField('confidence', value)}
              />
              <SelectionButton 
                value="medium" 
                label="MEDIUM" 
                isSelected={formData.confidence === 'medium'}
                onSelect={(value) => onUpdateField('confidence', value)}
              />
              <SelectionButton 
                value="low" 
                label="LOW" 
                isSelected={formData.confidence === 'low'}
                onSelect={(value) => onUpdateField('confidence', value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-6 pt-6 border-t-4 border-black">
            <button
              type="submit"
              className="flex-1 bg-black text-white border-4 border-black font-black uppercase tracking-wider px-8 py-4 hover:bg-black/90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000]"
            >
              CREATE PROJECT
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-white border-4 border-black font-black uppercase tracking-wider px-8 py-4 hover:bg-white/90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#525252] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000]"
            >
              CANCEL
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
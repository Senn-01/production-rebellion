import { Calendar, CheckCircle2, Target, Archive, ExternalLink, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { TriageItem } from '../../types/triage';

interface TriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  triageItems: TriageItem[];
  currentTriageIndex: number;
  onTriageAction: (action: string) => void;
}

export function TriageModal({ 
  isOpen, 
  onClose, 
  triageItems, 
  currentTriageIndex, 
  onTriageAction 
}: TriageModalProps) {
  if (triageItems.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-[#f7f7f5] border-4 border-black shadow-[8px_8px_0px_#000000] max-w-md">
          <DialogHeader className="bg-[#FDE047] border-4 border-black p-6">
            <DialogTitle className="text-2xl font-black uppercase tracking-wider text-black">
              TRIAGE COMPLETE
            </DialogTitle>
            <DialogDescription className="text-sm font-bold uppercase tracking-wide text-black/70">
              NO ITEMS TO PROCESS
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-[#525252]" />
            <p className="text-lg font-black uppercase tracking-wider text-black mb-6">
              ALL CAUGHT UP!
            </p>
            <button
              onClick={onClose}
              className="bg-black text-white border-4 border-black font-black uppercase tracking-wider px-6 py-3 hover:bg-black/90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000]"
            >
              CLOSE
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const currentItem = triageItems[currentTriageIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#f7f7f5] border-4 border-black shadow-[8px_8px_0px_#000000] max-w-lg">
        <DialogHeader className="bg-[#FDE047] border-4 border-black p-6">
          <DialogTitle className="text-2xl font-black uppercase tracking-wider text-black">
            TRIAGE
          </DialogTitle>
          <DialogDescription className="text-sm font-bold uppercase tracking-wide text-black/70">
            ITEM {currentTriageIndex + 1} OF {triageItems.length}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          {/* Current Item */}
          <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_#000000]">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-[#525252]" />
              <span className="text-xs font-bold uppercase tracking-wide text-black/70 font-mono">
                ADDED {new Date(currentItem.dateAdded).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <p className="font-mono text-black leading-tight">
              {currentItem.text}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => onTriageAction('track')}
              className="w-full bg-[#FDE047] border-4 border-black font-black uppercase tracking-wider px-6 py-4 hover:bg-[#FDE047]/90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000] flex items-center justify-center gap-3"
            >
              <Target className="w-5 h-5" />
              TRACK PROJECT
            </button>

            <button
              onClick={() => onTriageAction('parking')}
              className="w-full bg-[#525252] text-white border-4 border-black font-black uppercase tracking-wider px-6 py-4 hover:bg-[#525252]/90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000] flex items-center justify-center gap-3"
            >
              <Archive className="w-5 h-5" />
              PARKING LOT
            </button>

            <button
              onClick={() => onTriageAction('doing')}
              className="w-full bg-[#9ca3af] text-white border-4 border-black font-black uppercase tracking-wider px-6 py-4 hover:bg-[#9ca3af]/90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000] flex items-center justify-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5" />
              DOING IT NOW
            </button>

            <button
              onClick={() => onTriageAction('routing')}
              className="w-full bg-[#f7f7f5] border-4 border-black font-black uppercase tracking-wider px-6 py-4 hover:bg-[#f7f7f5]/90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000] flex items-center justify-center gap-3"
            >
              <ExternalLink className="w-5 h-5" />
              ROUTING <span className="text-xs">(SOON)</span>
            </button>

            <button
              onClick={() => onTriageAction('delete')}
              className="w-full bg-black text-white border-4 border-black font-black uppercase tracking-wider px-6 py-4 hover:bg-black/90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000] flex items-center justify-center gap-3"
            >
              <Trash2 className="w-5 h-5" />
              DELETE
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
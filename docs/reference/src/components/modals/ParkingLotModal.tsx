import { Archive, Calendar, ArrowUp, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { ParkingLotItem } from '../../types/triage';

interface ParkingLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  parkingLotItems: ParkingLotItem[];
  onPromoteToProject: (item: ParkingLotItem) => void;
  onDeleteItem: (itemId: number) => void;
}

export function ParkingLotModal({ 
  isOpen, 
  onClose, 
  parkingLotItems, 
  onPromoteToProject,
  onDeleteItem 
}: ParkingLotModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#f7f7f5] border-4 border-black shadow-[8px_8px_0px_#000000] max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="bg-[#525252] border-4 border-black p-6">
          <DialogTitle className="text-2xl font-black uppercase tracking-wider text-white">
            PARKING LOT
          </DialogTitle>
          <DialogDescription className="text-sm font-bold uppercase tracking-wide text-white/90">
            {parkingLotItems.length} ITEMS PARKED
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6">
          {parkingLotItems.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="w-16 h-16 mx-auto mb-4 text-[#525252]" />
              <p className="text-lg font-black uppercase tracking-wider text-black mb-2">
                PARKING LOT IS EMPTY
              </p>
              <p className="text-sm font-bold uppercase tracking-wide text-black/70">
                USE TRIAGE TO ADD ITEMS HERE
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {parkingLotItems.map((item) => (
                <div key={item.id} className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] transition-all duration-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-[#525252]" />
                        <span className="text-xs font-bold uppercase tracking-wide text-black/70 font-mono">
                          ADDED {new Date(item.dateAdded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="font-mono text-black leading-tight mb-4">
                        {item.text}
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => onPromoteToProject(item)}
                          className="bg-[#FDE047] border-4 border-black font-black uppercase tracking-wider px-4 py-2 hover:bg-[#FDE047]/90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000] flex items-center gap-2 text-sm"
                        >
                          <ArrowUp className="w-4 h-4" />
                          PROMOTE TO PROJECT
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="bg-black text-white border-4 border-black font-black uppercase tracking-wider px-4 py-2 hover:bg-black/90 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000] flex items-center gap-2 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          DELETE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
/**
 * ParkingLotModal Component - Someday/Maybe Items
 * 
 * Displays parked items with actions:
 * - Promote to Project: Opens AddProjectModal with content pre-filled
 * - Delete: Removes item permanently
 */

'use client';

import React from 'react';
import { Archive, Calendar, ArrowUp, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ParkingLotItem {
  id: string;
  content: string;
  parked_at: string;
}

interface ParkingLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  parkingLotItems: ParkingLotItem[];
  onPromoteToProject: (item: ParkingLotItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export function ParkingLotModal({ 
  isOpen, 
  onClose, 
  parkingLotItems, 
  onPromoteToProject,
  onDeleteItem 
}: ParkingLotModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="xl"
      className="bg-[#f7f7f5] max-h-[80vh] overflow-y-auto"
    >
      {/* Header */}
      <div className="bg-[#525252] border-4 border-black p-6 -m-6 mb-6">
        <h2 className="text-2xl font-black uppercase tracking-wider text-white">
          PARKING LOT
        </h2>
        <p className="text-sm font-bold uppercase tracking-wide text-white/90 mt-1">
          {parkingLotItems.length} ITEMS PARKED
        </p>
      </div>

      {/* Content */}
      <div>
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
              <div 
                key={item.id} 
                className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] transition-all duration-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-[#525252]" />
                      <span className="text-xs font-bold uppercase tracking-wide text-black/70 font-mono">
                        ADDED {new Date(item.parked_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <p className="font-mono text-black leading-tight mb-4">
                      {item.content}
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => onPromoteToProject(item)}
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <ArrowUp className="w-4 h-4" />
                        PROMOTE TO PROJECT
                      </Button>
                      <Button
                        onClick={() => onDeleteItem(item.id)}
                        variant="danger"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        DELETE
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
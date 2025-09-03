import { useState } from 'react';
import { TriageItem, ParkingLotItem } from '../types/triage';
import { initialTriageItems, initialParkingLotItems } from '../data/sampleTriageData';

export function useTriageSystem() {
  const [triageItems, setTriageItems] = useState<TriageItem[]>(initialTriageItems);
  const [parkingLotItems, setParkingLotItems] = useState<ParkingLotItem[]>(initialParkingLotItems);
  const [currentTriageIndex, setCurrentTriageIndex] = useState(0);

  const handleTriageAction = (action: string, onOpenProject?: (text: string) => void) => {
    const currentItem = triageItems[currentTriageIndex];
    
    switch (action) {
      case 'track':
        // Open project creator modal
        if (onOpenProject) {
          onOpenProject(currentItem.text);
        }
        // Remove from triage
        setTriageItems(prev => prev.filter((_, index) => index !== currentTriageIndex));
        setCurrentTriageIndex(0);
        break;
      case 'parking':
        // Move to parking lot
        setParkingLotItems(prev => [...prev, {
          id: Date.now(),
          text: currentItem.text,
          dateAdded: new Date().toISOString().split('T')[0]
        }]);
        // Remove from triage
        setTriageItems(prev => prev.filter((_, index) => index !== currentTriageIndex));
        setCurrentTriageIndex(0);
        break;
      case 'doing':
      case 'routing':
      case 'delete':
        // Remove from system
        setTriageItems(prev => prev.filter((_, index) => index !== currentTriageIndex));
        setCurrentTriageIndex(0);
        break;
    }
  };

  const handlePromoteToProject = (item: ParkingLotItem, onOpenProject?: (text: string) => void) => {
    if (onOpenProject) {
      onOpenProject(item.text);
    }
    setParkingLotItems(prev => prev.filter(p => p.id !== item.id));
  };

  const handleDeleteParkingItem = (itemId: number) => {
    setParkingLotItems(prev => prev.filter(p => p.id !== itemId));
  };

  return {
    triageItems,
    parkingLotItems,
    currentTriageIndex,
    handleTriageAction,
    handlePromoteToProject,
    handleDeleteParkingItem
  };
}
import { TriageItem, ParkingLotItem } from '../types/triage';

export const initialTriageItems: TriageItem[] = [
  { id: 1, text: 'Learn Docker containerization for deployment optimization', dateAdded: '2024-08-25' },
  { id: 2, text: 'Redesign the user onboarding flow', dateAdded: '2024-08-24' },
  { id: 3, text: 'Set up automated testing pipeline', dateAdded: '2024-08-23' },
];

export const initialParkingLotItems: ParkingLotItem[] = [
  { id: 1, text: 'Research new design system frameworks', dateAdded: '2024-08-20' },
  { id: 2, text: 'Plan team building activities', dateAdded: '2024-08-18' },
  { id: 3, text: 'Explore AI integration opportunities', dateAdded: '2024-08-15' },
];
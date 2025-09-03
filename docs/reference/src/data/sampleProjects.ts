import { Project } from '../types/project';

export const sampleProjects: Project[] = [
  { id: 1, category: 'WORK', x: 75, y: 25, isBossBattle: true, title: 'Q4 Revenue Push', priority: 'high' },
  { id: 2, category: 'LEARN', x: 25, y: 35, isBossBattle: false, title: 'React Advanced', priority: 'medium' },
  { id: 3, category: 'BUILD', x: 65, y: 65, isBossBattle: true, title: 'MVP Launch', priority: 'high' },
  { id: 4, category: 'MANAGE', x: 85, y: 75, isBossBattle: false, title: 'Team Restructure', priority: 'low' },
  { id: 5, category: 'WORK', x: 45, y: 15, isBossBattle: false, title: 'Client Presentation', priority: 'high' },
  { id: 6, category: 'LEARN', x: 15, y: 85, isBossBattle: false, title: 'Design Systems', priority: 'medium' },
  { id: 7, category: 'BUILD', x: 35, y: 55, isBossBattle: false, title: 'Feature Update', priority: 'medium' },
  { id: 8, category: 'MANAGE', x: 55, y: 45, isBossBattle: true, title: 'Process Optimization', priority: 'high' },
];
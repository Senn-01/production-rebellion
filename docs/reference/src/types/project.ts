export type CurrentPage = 'map' | 'focus' | 'data' | 'prime';

export interface Project {
  id: number;
  category: 'WORK' | 'LEARN' | 'BUILD' | 'MANAGE';
  x: number;
  y: number;
  isBossBattle: boolean;
  title: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ProjectFormData {
  projectName: string;
  costScore: string;
  benefitScore: string;
  category: string;
  tags: string;
  priority: string;
  dueDate: string;
  description: string;
  status: string;
  confidence: string;
}
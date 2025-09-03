import { useState } from 'react';
import { ProjectFormData } from '../types/project';

const initialFormData: ProjectFormData = {
  projectName: '',
  costScore: '',
  benefitScore: '',
  category: '',
  tags: '',
  priority: '',
  dueDate: '',
  description: '',
  status: '',
  confidence: ''
};

export function useProjectForm() {
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);

  const updateField = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    return formData;
  };

  return {
    formData,
    updateField,
    resetForm,
    handleSubmit,
    setFormData
  };
}